#!/usr/bin/env bash
# Runs the scanner against the macOS runner's mounted APFS work volume.
set -euo pipefail

work_dir="$(mktemp -d /tmp/family-archive-check-apfs.XXXXXX)"
cleanup() { rm -rf "$work_dir"; }
trap cleanup EXIT

volume_device="$(df -P "$work_dir" | awk 'END { print $1 }')"
if ! diskutil info "$volume_device" | tr '[:upper:]' '[:lower:]' | grep -q 'file system personality:.*apfs'; then
  echo "The macOS runner work volume is not APFS." >&2
  exit 1
fi

cp tests/fixtures/valid.* "$work_dir/"
FAC_VOLUME_FIXTURE_ROOT="$work_dir" FAC_EXPECTED_FILESYSTEM="apfs" \
  cargo test --manifest-path src-tauri/Cargo.toml mounted_volume_fixture -- --exact
