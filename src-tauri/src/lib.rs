#![cfg_attr(not(feature = "desktop"), allow(dead_code))]

use chrono::Utc;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::{
    collections::HashSet,
    fs::{self, File},
    io::{BufReader, Read, Seek, SeekFrom},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use walkdir::WalkDir;

const MEDIA_SAMPLE_LIMIT: usize = 48;
const RECOVERY_IMPORT_CAPABILITY: &str = "recovery-file-import";

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ReleaseIdentity {
    version: &'static str,
    source_commit: &'static str,
    capabilities: [&'static str; 1],
}

#[cfg_attr(feature = "desktop", tauri::command)]
fn release_identity() -> ReleaseIdentity {
    ReleaseIdentity {
        version: env!("CARGO_PKG_VERSION"),
        source_commit: env!("FAC_BUILD_COMMIT"),
        capabilities: [RECOVERY_IMPORT_CAPABILITY],
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct FileRecord {
    relative_path: String,
    size: u64,
    modified: u64,
    kind: &'static str,
    readable: bool,
    sampled: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    hash: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    capture_year: Option<i32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TargetScan {
    path: String,
    label: String,
    files: Vec<FileRecord>,
    started_at: String,
    completed_at: String,
    file_system: String,
    storage_id: String,
}

fn kind(path: &Path) -> &'static str {
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    match extension.as_str() {
        "jpg" | "jpeg" | "png" | "heic" | "heif" | "gif" | "webp" | "tif" | "tiff" | "raw"
        | "dng" => "photo",
        "mp4" | "mov" | "m4v" | "avi" | "mkv" | "webm" | "mts" | "m2ts" | "3gp" => "video",
        _ => "other",
    }
}

fn hash_file(path: &Path) -> Result<String, String> {
    let file = File::open(path).map_err(|error| error.to_string())?;
    let mut reader = BufReader::new(file);
    let mut hasher = Sha256::new();
    let mut buffer = [0_u8; 1024 * 64];
    loop {
        let count = reader
            .read(&mut buffer)
            .map_err(|error| error.to_string())?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }
    Ok(format!("{:x}", hasher.finalize()))
}

fn has_bytes_at(file: &mut File, offset: u64, expected: &[u8]) -> bool {
    let mut bytes = vec![0; expected.len()];
    file.seek(SeekFrom::Start(offset)).is_ok()
        && file.read_exact(&mut bytes).is_ok()
        && bytes == expected
}

fn valid_iso_media(path: &Path) -> bool {
    let Ok(mut file) = File::open(path) else {
        return false;
    };
    let Ok(metadata) = file.metadata() else {
        return false;
    };
    let length = metadata.len();
    let mut offset = 0_u64;
    let mut has_ftyp = false;
    let mut has_media = false;
    while offset + 8 <= length {
        let mut header = [0_u8; 8];
        if file.seek(SeekFrom::Start(offset)).is_err() || file.read_exact(&mut header).is_err() {
            return false;
        }
        let mut box_length = u64::from(u32::from_be_bytes(header[0..4].try_into().unwrap()));
        let header_length = if box_length == 1 {
            let mut extended = [0_u8; 8];
            if file.read_exact(&mut extended).is_err() {
                return false;
            }
            box_length = u64::from_be_bytes(extended);
            16
        } else {
            8
        };
        if box_length == 0 {
            box_length = length - offset;
        }
        if box_length < header_length || offset + box_length > length {
            return false;
        }
        has_ftyp |= &header[4..8] == b"ftyp";
        has_media |= matches!(&header[4..8], b"mdat" | b"meta");
        offset += box_length;
    }
    offset == length && has_ftyp && has_media
}

fn valid_media(path: &Path) -> bool {
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    let Ok(metadata) = fs::metadata(path) else {
        return false;
    };
    if metadata.len() == 0 {
        return false;
    }
    match extension.as_str() {
        "jpg" | "jpeg" | "png" | "gif" | "webp" | "tif" | "tiff" => image::ImageReader::open(path)
            .ok()
            .and_then(|reader| reader.with_guessed_format().ok())
            .and_then(|reader| reader.decode().ok())
            .is_some_and(|decoded| decoded.width() > 0 && decoded.height() > 0),
        "heic" | "heif" | "mp4" | "mov" | "m4v" | "3gp" => valid_iso_media(path),
        "dng" | "raw" => {
            let Ok(mut file) = File::open(path) else {
                return false;
            };
            has_bytes_at(&mut file, 0, b"II*\0") || has_bytes_at(&mut file, 0, b"MM\0*")
        }
        "avi" => {
            let Ok(mut file) = File::open(path) else {
                return false;
            };
            metadata.len() >= 12
                && has_bytes_at(&mut file, 0, b"RIFF")
                && has_bytes_at(&mut file, 8, b"AVI ")
        }
        "mkv" | "webm" => {
            let Ok(mut file) = File::open(path) else {
                return false;
            };
            metadata.len() >= 12 && has_bytes_at(&mut file, 0, &[0x1a, 0x45, 0xdf, 0xa3])
        }
        "mts" | "m2ts" => {
            let Ok(mut file) = File::open(path) else {
                return false;
            };
            let offset = if extension == "m2ts" { 4 } else { 0 };
            metadata.len() > offset && has_bytes_at(&mut file, offset, &[0x47])
        }
        _ => true,
    }
}

fn year_from_exif(path: &Path) -> Option<i32> {
    if kind(path) != "photo" {
        return year_from_name(path);
    }
    let file = File::open(path).ok()?;
    let mut reader = BufReader::new(file);
    let exif = exif::Reader::new().read_from_container(&mut reader).ok()?;
    let field = exif
        .get_field(exif::Tag::DateTimeOriginal, exif::In::PRIMARY)
        .or_else(|| exif.get_field(exif::Tag::DateTime, exif::In::PRIMARY))?;
    let text = field.display_value().with_unit(&exif).to_string();
    text.get(0..4)?.parse().ok()
}

fn year_from_name(path: &Path) -> Option<i32> {
    let text = path.to_string_lossy();
    for part in text.as_bytes().windows(4) {
        if let Ok(value) = std::str::from_utf8(part).unwrap_or("").parse::<i32>() {
            if (1900..=2100).contains(&value) {
                return Some(value);
            }
        }
    }
    None
}

fn relative_path(path: &Path, root: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}

fn sample_score(path: &str) -> u32 {
    path.as_bytes()
        .iter()
        .fold(2_166_136_261_u32, |score, byte| {
            (score ^ u32::from(*byte)).wrapping_mul(16_777_619)
        })
}

fn scan(path: &Path, label: String) -> Result<TargetScan, String> {
    if !path.is_dir() {
        return Err("The chosen location is not a readable folder.".into());
    }
    let started_at = Utc::now().to_rfc3339();
    let mut paths: Vec<PathBuf> = Vec::new();
    let mut unreadable_entries: Vec<FileRecord> = Vec::new();
    for (index, entry) in WalkDir::new(path)
        .follow_links(false)
        .into_iter()
        .enumerate()
    {
        match entry {
            Ok(entry) if entry.file_type().is_file() => paths.push(entry.into_path()),
            Ok(_) => {}
            Err(error) => {
                let relative_path = error
                    .path()
                    .and_then(|failed_path| failed_path.strip_prefix(path).ok())
                    .filter(|failed_path| !failed_path.as_os_str().is_empty())
                    .map(|failed_path| failed_path.to_string_lossy().replace('\\', "/"))
                    .unwrap_or_else(|| format!("unreadable-entry-{index}"));
                unreadable_entries.push(FileRecord {
                    relative_path,
                    size: 0,
                    modified: 0,
                    kind: "other",
                    readable: false,
                    sampled: false,
                    hash: None,
                    capture_year: None,
                });
            }
        }
    }
    paths.sort();
    let mut sample_candidates: Vec<String> = paths
        .iter()
        .filter(|item| kind(item) != "other")
        .map(|item| relative_path(item, path))
        .collect();
    sample_candidates.sort_by_key(|item| (sample_score(item), item.clone()));
    let sampled_paths: HashSet<String> = sample_candidates
        .into_iter()
        .take(MEDIA_SAMPLE_LIMIT)
        .collect();
    let mut files = Vec::with_capacity(paths.len());

    for item in paths {
        let file_kind = kind(&item);
        let relative_path = relative_path(&item, path);
        let sampled = sampled_paths.contains(&relative_path);
        let metadata = fs::metadata(&item);
        let byte_readable = File::open(&item)
            .and_then(|mut file| {
                let mut byte = [0_u8; 1];
                file.read_exact(&mut byte)
            })
            .is_ok();
        let readable = byte_readable && (!sampled || valid_media(&item));
        let size = metadata.as_ref().map(|value| value.len()).unwrap_or(0);
        let modified = metadata
            .ok()
            .and_then(|value| value.modified().ok())
            .unwrap_or(SystemTime::UNIX_EPOCH)
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        let capture_year = year_from_exif(&item).or_else(|| year_from_name(&item));
        let hash = if sampled && readable {
            hash_file(&item).ok()
        } else {
            None
        };
        files.push(FileRecord {
            relative_path,
            size,
            modified,
            kind: file_kind,
            readable,
            sampled,
            hash,
            capture_year,
        });
    }
    files.extend(unreadable_entries);

    Ok(TargetScan {
        path: path.to_string_lossy().into_owned(),
        label,
        files,
        started_at,
        completed_at: Utc::now().to_rfc3339(),
        file_system: filesystem_label(path),
        storage_id: storage_id(path),
    })
}

#[cfg(unix)]
fn storage_id(path: &Path) -> String {
    use std::os::unix::fs::MetadataExt;
    fs::metadata(path)
        .map(|metadata| format!("device:{}", metadata.dev()))
        .unwrap_or_default()
}

#[cfg(windows)]
fn storage_id(path: &Path) -> String {
    use std::path::Component;
    path.components()
        .find_map(|component| match component {
            Component::Prefix(prefix) => Some(format!("volume:{:?}", prefix.kind())),
            _ => None,
        })
        .unwrap_or_default()
}

#[cfg(target_os = "windows")]
fn filesystem_label(_: &Path) -> String {
    "Windows mounted volume".into()
}
#[cfg(target_os = "macos")]
fn filesystem_label(_: &Path) -> String {
    "macOS mounted volume".into()
}
#[cfg(target_os = "linux")]
fn filesystem_label(_: &Path) -> String {
    "Linux mounted volume".into()
}

#[cfg(feature = "desktop")]
#[tauri::command]
fn scan_folder(path: String, label: String) -> Result<TargetScan, String> {
    scan(Path::new(&path), label)
}

#[cfg(feature = "desktop")]
#[tauri::command]
fn write_manifest(path: String, contents: String) -> Result<(), String> {
    if !path.to_ascii_lowercase().ends_with(".json") {
        return Err("Choose a file name ending in .json.".into());
    }
    fs::write(path, contents)
        .map_err(|error| format!("The recovery file list could not be saved: {error}"))
}

#[cfg(feature = "desktop")]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            scan_folder,
            write_manifest,
            release_identity
        ])
        .run(tauri::generate_context!())
        .expect("error while running Family Archive Check");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn release_identity_records_recovery_import_and_source() {
        let identity = release_identity();
        assert_eq!(identity.version, env!("CARGO_PKG_VERSION"));
        assert!(!identity.source_commit.is_empty());
        assert_eq!(identity.capabilities, ["recovery-file-import"]);
    }

    #[test]
    fn claim_read_only_scan_reads_files_without_changing_them() {
        let directory = tempfile::tempdir().unwrap();
        let file_path = directory.path().join("1998-family.png");
        image::DynamicImage::new_rgb8(1, 1)
            .save(&file_path)
            .unwrap();
        let before = fs::read(&file_path).unwrap();
        let result = scan(directory.path(), "Main archive".into()).unwrap();
        assert_eq!(result.files.len(), 1);
        assert_eq!(result.files[0].capture_year, Some(1998));
        assert!(result.files[0].hash.is_some());
        assert_eq!(before, fs::read(&file_path).unwrap());
    }

    #[test]
    fn claim_media_sample_count_checks_at_most_forty_eight_media_files() {
        let directory = tempfile::tempdir().unwrap();
        for index in 0..60 {
            image::DynamicImage::new_rgb8(1, 1)
                .save(directory.path().join(format!("photo-{index:02}.png")))
                .unwrap();
        }
        let result = scan(directory.path(), "Main archive".into()).unwrap();
        assert_eq!(
            result.files.iter().filter(|file| file.sampled).count(),
            MEDIA_SAMPLE_LIMIT
        );
        assert!(result
            .files
            .iter()
            .filter(|file| file.sampled)
            .all(|file| file.readable));
        assert_eq!(
            result
                .files
                .iter()
                .filter(|file| file.hash.is_some())
                .count(),
            MEDIA_SAMPLE_LIMIT
        );
    }

    #[test]
    fn claim_repeatable_sample_selects_the_same_paths_on_every_scan() {
        let directory = tempfile::tempdir().unwrap();
        for index in 0..64 {
            image::DynamicImage::new_rgb8(1, 1)
                .save(directory.path().join(format!("photo-{index:02}.png")))
                .unwrap();
        }

        let first = scan(directory.path(), "Main archive".into()).unwrap();
        let second = scan(directory.path(), "Main archive".into()).unwrap();
        let sampled = |result: &TargetScan| {
            result
                .files
                .iter()
                .filter(|file| file.sampled)
                .map(|file| file.relative_path.clone())
                .collect::<Vec<_>>()
        };

        assert_eq!(first.files.len(), 64);
        assert_eq!(sampled(&first).len(), 48);
        assert_eq!(sampled(&first), sampled(&second));
    }

    #[test]
    fn claim_complete_file_count_enumerates_sampled_and_unsampled_files() {
        let directory = tempfile::tempdir().unwrap();
        let dated = directory.path().join("2008");
        fs::create_dir(&dated).unwrap();
        let mut expected = HashSet::new();

        for index in 0..52 {
            let name = format!("2008/photo-{index:02}.png");
            image::DynamicImage::new_rgb8(1, 1)
                .save(directory.path().join(&name))
                .unwrap();
            expected.insert(name);
        }
        let notes = directory.path().join("notes");
        fs::create_dir(&notes).unwrap();
        for index in 0..21 {
            let name = format!("notes/note-{index:02}.txt");
            fs::write(directory.path().join(&name), "archive note").unwrap();
            expected.insert(name);
        }

        let result = scan(directory.path(), "Main archive".into()).unwrap();
        let actual = result
            .files
            .iter()
            .map(|file| file.relative_path.clone())
            .collect::<HashSet<_>>();

        assert_eq!(result.files.len(), expected.len());
        assert_eq!(actual, expected);
        assert_eq!(result.files.iter().filter(|file| file.sampled).count(), 48);
    }

    #[test]
    fn claim_media_readable_rejects_empty_and_truncated_images() {
        let directory = tempfile::tempdir().unwrap();
        for extension in [
            "jpg", "jpeg", "png", "heic", "heif", "gif", "webp", "tif", "tiff", "raw", "dng",
            "mp4", "mov", "m4v", "avi", "mkv", "webm", "mts", "m2ts", "3gp",
        ] {
            fs::write(directory.path().join(format!("empty.{extension}")), []).unwrap();
        }
        fs::write(directory.path().join("truncated.png"), b"\x89PNG\r\n\x1a\n").unwrap();
        image::DynamicImage::new_rgb8(1, 1)
            .save(directory.path().join("valid.png"))
            .unwrap();

        let result = scan(directory.path(), "Main archive".into()).unwrap();
        let readable = |name: &str| {
            result
                .files
                .iter()
                .find(|file| file.relative_path == name)
                .unwrap()
                .readable
        };
        for extension in [
            "jpg", "jpeg", "png", "heic", "heif", "gif", "webp", "tif", "tiff", "raw", "dng",
            "mp4", "mov", "m4v", "avi", "mkv", "webm", "mts", "m2ts", "3gp",
        ] {
            assert!(!readable(&format!("empty.{extension}")), "{extension}");
        }
        assert!(!readable("truncated.png"));
        assert!(readable("valid.png"));
    }

    #[test]
    fn claim_common_media_codecs_accepts_shipped_valid_fixtures() {
        let fixture_directory = Path::new(env!("CARGO_MANIFEST_DIR")).join("../tests/fixtures");
        let expected = [
            "valid.jpg",
            "valid.png",
            "valid.heic",
            "valid.mp4",
            "valid.mov",
        ];
        let result = scan(&fixture_directory, "Codec fixtures".into()).unwrap();

        assert_eq!(result.files.len(), expected.len());
        for name in expected {
            let record = result
                .files
                .iter()
                .find(|file| file.relative_path == name)
                .unwrap_or_else(|| panic!("missing fixture {name}"));
            assert!(record.sampled, "{name} was not sampled");
            assert!(record.readable, "{name} was not accepted as readable");
            assert!(record.hash.is_some(), "{name} was not hashed");
        }
    }

    #[test]
    fn mounted_volume_fixture_scans_the_expected_real_filesystem() {
        let Ok(root) = std::env::var("FAC_VOLUME_FIXTURE_ROOT") else {
            return;
        };
        let expected_filesystem = std::env::var("FAC_EXPECTED_FILESYSTEM")
            .expect("mounted-volume runs must name the expected filesystem")
            .to_ascii_lowercase();
        let fixture_root = PathBuf::from(root);
        let observed_filesystem = mounted_filesystem_type(&fixture_root).to_ascii_lowercase();
        assert!(
            expected_filesystem
                .split('|')
                .any(|expected| observed_filesystem.contains(expected)),
            "expected {expected_filesystem} filesystem, observed {observed_filesystem}"
        );

        let result = scan(&fixture_root, "Mounted volume fixture".into()).unwrap();
        for name in [
            "valid.jpg",
            "valid.png",
            "valid.heic",
            "valid.mp4",
            "valid.mov",
        ] {
            let record = result
                .files
                .iter()
                .find(|file| file.relative_path == name)
                .unwrap_or_else(|| panic!("mounted volume omitted {name}"));
            assert!(
                record.readable,
                "mounted {expected_filesystem} fixture {name} was unreadable"
            );
            assert!(
                record.hash.is_some(),
                "mounted {expected_filesystem} fixture {name} was not hashed"
            );
        }
    }

    #[cfg(target_os = "linux")]
    fn mounted_filesystem_type(path: &Path) -> String {
        std::process::Command::new("findmnt")
            .args(["--noheadings", "--output", "FSTYPE", "--target"])
            .arg(path)
            .output()
            .expect("findmnt must be available in the Linux storage matrix")
            .stdout
            .iter()
            .map(|byte| char::from(*byte))
            .collect()
    }

    #[cfg(target_os = "macos")]
    fn mounted_filesystem_type(path: &Path) -> String {
        let volume_device = String::from_utf8(
            std::process::Command::new("df")
                .args(["-P"])
                .arg(path)
                .output()
                .expect("df must be available in the macOS storage matrix")
                .stdout,
        )
        .expect("df output must be UTF-8")
        .lines()
        .last()
        .and_then(|line| line.split_whitespace().next())
        .expect("df must identify the macOS volume")
        .to_owned();
        std::process::Command::new("diskutil")
            .arg("info")
            .arg(volume_device)
            .output()
            .expect("diskutil must be available in the macOS storage matrix")
            .stdout
            .iter()
            .map(|byte| char::from(*byte))
            .collect()
    }

    #[cfg(target_os = "windows")]
    fn mounted_filesystem_type(path: &Path) -> String {
        let command = format!(
            "(Get-Volume -FilePath '{}').FileSystem",
            path.to_string_lossy().replace('\'', "''")
        );
        std::process::Command::new("powershell")
            .args(["-NoProfile", "-Command", &command])
            .output()
            .expect("PowerShell must be available in the Windows storage matrix")
            .stdout
            .iter()
            .map(|byte| char::from(*byte))
            .collect()
    }

    #[test]
    fn claim_capture_year_reads_exif_or_folder_dates() {
        let directory = tempfile::tempdir().unwrap();
        let dated = directory.path().join("2004");
        fs::create_dir(&dated).unwrap();
        let file_path = dated.join("reunion.png");
        image::DynamicImage::new_rgb8(1, 1)
            .save(&file_path)
            .unwrap();
        let result = scan(directory.path(), "Main archive".into()).unwrap();
        assert_eq!(result.files[0].capture_year, Some(2004));
    }
}
