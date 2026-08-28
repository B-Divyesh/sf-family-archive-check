use chrono::Utc;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::{
    collections::HashSet,
    fs::{self, File},
    io::{BufReader, Read},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use walkdir::WalkDir;

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
    let sampled_paths: HashSet<String> = sample_candidates.into_iter().take(48).collect();
    let mut files = Vec::with_capacity(paths.len());

    for item in paths {
        let file_kind = kind(&item);
        let relative_path = relative_path(&item, path);
        let sampled = sampled_paths.contains(&relative_path);
        let metadata = fs::metadata(&item);
        let readable = File::open(&item)
            .and_then(|mut file| {
                let mut byte = [0_u8; 1];
                file.read(&mut byte).map(|_| ())
            })
            .is_ok();
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
    })
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

#[tauri::command]
fn scan_folder(path: String, label: String) -> Result<TargetScan, String> {
    scan(Path::new(&path), label)
}

#[tauri::command]
fn write_manifest(path: String, contents: String) -> Result<(), String> {
    if !path.to_ascii_lowercase().ends_with(".json") {
        return Err("Choose a file name ending in .json.".into());
    }
    fs::write(path, contents).map_err(|error| format!("The manifest could not be saved: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![scan_folder, write_manifest])
        .run(tauri::generate_context!())
        .expect("error while running Family Archive Check");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn claim_read_only_scan_reads_files_without_changing_them() {
        let directory = tempfile::tempdir().unwrap();
        let file_path = directory.path().join("1998-family.jpg");
        let mut file = File::create(&file_path).unwrap();
        file.write_all(b"sample photo bytes").unwrap();
        let before = fs::read(&file_path).unwrap();
        let result = scan(directory.path(), "Main archive".into()).unwrap();
        assert_eq!(result.files.len(), 1);
        assert_eq!(result.files[0].capture_year, Some(1998));
        assert!(result.files[0].hash.is_some());
        assert_eq!(before, fs::read(&file_path).unwrap());
    }

    #[test]
    fn scan_hashes_at_most_forty_eight_media_files() {
        let directory = tempfile::tempdir().unwrap();
        for index in 0..60 {
            fs::write(
                directory.path().join(format!("photo-{index:02}.jpg")),
                b"photo",
            )
            .unwrap();
        }
        let result = scan(directory.path(), "Main archive".into()).unwrap();
        assert_eq!(result.files.iter().filter(|file| file.sampled).count(), 48);
        assert_eq!(
            result
                .files
                .iter()
                .filter(|file| file.hash.is_some())
                .count(),
            48
        );
    }
}
