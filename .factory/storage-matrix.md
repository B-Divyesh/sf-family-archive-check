# Storage and codec acceptance matrix

The scanner has one portable codec-fixture test and three native mounted-volume runs. The fixtures are intentionally tiny, original test media: 2×2 green JPEG, PNG, and HEIC images plus 0.2-second green H.264 MP4 and MOV videos. They were generated on 2026-08-29 with ImageMagick/libheif and FFmpeg, then independently parsed with ImageMagick and FFprobe before being committed under `tests/fixtures/`.

| Filesystem | Runner | Command | Observable assertion |
|---|---|---|---|
| APFS | macOS hosted runner | `bash tests/storage-volume-macos.sh` | `df` resolves the fixture directory's backing device and `diskutil` identifies it as APFS; native `scan()` inventories, validates, and hashes all five fixtures. |
| NTFS | Windows hosted runner | `pwsh -File tests/storage-volume.ps1` | `Get-Volume` identifies NTFS; native `scan()` inventories, validates, and hashes all five fixtures. |
| exFAT | Ubuntu hosted runner | `bash tests/storage-volume.sh exfat` | a freshly formatted, `fsck.exfat`-validated exFAT loopback image is mounted and checked with `findmnt`; if the runner lacks the kernel driver, `exfat-fuse` mounts that same image. Native `scan()` inventories, validates, and hashes all five fixtures. |

The portable regression is `cargo test --manifest-path src-tauri/Cargo.toml claim_common_media_codecs`. It proves that valid JPEG, PNG, HEIC, MP4, and MOV files are sampled, accepted as readable, and fingerprinted. The mounted-volume regression is deliberately guarded by `FAC_VOLUME_FIXTURE_ROOT`; the CI scripts set that variable only after proving the target filesystem type, so a normal local `cargo test` remains safe and does not mount or write a disk image.
