#!/usr/bin/env bash
# Runs the scanner against a real exFAT loopback volume on Linux CI.
set -euo pipefail
PATH="/usr/sbin:/sbin:${PATH}"

as_root() {
  if command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    "$@"
  fi
}

if [[ "${1:-}" != "exfat" ]]; then
  echo "Usage: tests/storage-volume.sh exfat" >&2
  exit 64
fi

work_dir="$(mktemp -d)"
image_path="$work_dir/family-archive-check.img"
mount_path="$work_dir/mount"
fixture_path="$mount_path/Family Archive"

cleanup() {
  if mountpoint -q "$mount_path"; then
    as_root umount "$mount_path"
  fi
  rm -rf "$work_dir"
}
trap cleanup EXIT

mkdir -p "$mount_path"
truncate -s 32M "$image_path"
mkfs.exfat -n FAC_EXFAT "$image_path" >/dev/null
fsck.exfat -n "$image_path" >/dev/null

# GitHub's Ubuntu image can expose exFAT either through its kernel driver or
# through exfat-fuse. Both mount the same freshly formatted exFAT image; the
# latter reports a FUSE filesystem type to findmnt.
if as_root mount -t exfat -o loop "$image_path" "$mount_path"; then
  :
elif command -v mount.exfat-fuse >/dev/null 2>&1; then
  as_root mount.exfat-fuse "$image_path" "$mount_path"
else
  echo "Neither an exFAT kernel mount nor mount.exfat-fuse is available." >&2
  exit 1
fi

actual_filesystem="$(findmnt --noheadings --output FSTYPE --target "$mount_path" | tr -d '[:space:]')"
actual_source="$(findmnt --noheadings --output SOURCE --target "$mount_path" | tr -d '[:space:]')"
if [[ "$actual_filesystem" != "exfat" && "$actual_filesystem" != fuse* ]]; then
  echo "Expected an exFAT or FUSE-backed exFAT volume, got $actual_filesystem" >&2
  exit 1
fi
if [[ "$actual_source" != "$image_path" && "$actual_source" != *"$image_path"* ]]; then
  echo "Expected the mounted source to be the exFAT test image, got $actual_source" >&2
  exit 1
fi

mkdir -p "$fixture_path"
cp tests/fixtures/valid.* "$fixture_path/"
FAC_VOLUME_FIXTURE_ROOT="$fixture_path" FAC_EXPECTED_FILESYSTEM="exfat|fuse" \
  cargo test --manifest-path src-tauri/Cargo.toml mounted_volume_fixture -- --exact
