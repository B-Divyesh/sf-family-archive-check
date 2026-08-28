#!/bin/sh
set -eu
repo="B-Divyesh/sf-family-archive-check"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) pattern='aarch64.*\.dmg$' ;;
  Darwin-x86_64) pattern='x64.*\.dmg$|x86_64.*\.dmg$' ;;
  Linux-*) pattern='\.AppImage$' ;;
  *) echo "No one-line installer is available for this system." >&2; exit 1 ;;
esac
api="https://api.github.com/repos/$repo/releases/latest"
json="$tmp_dir/release.json"
curl -fsSL "$api" -o "$json"
url="$(sed -n 's/.*"browser_download_url": "\([^"]*\)".*/\1/p' "$json" | grep -Ei "$pattern" | head -n 1)"
[ -n "$url" ] || { echo "The release asset is not published yet." >&2; exit 1; }
asset="$tmp_dir/$(basename "$url")"
curl -fL "$url" -o "$asset"
sums_url="$(sed -n 's/.*"browser_download_url": "\([^"]*SHA256SUMS\)".*/\1/p' "$json" | head -n 1)"
curl -fsSL "$sums_url" -o "$tmp_dir/SHA256SUMS"
(cd "$tmp_dir" && grep " $(basename "$asset")$" SHA256SUMS | sha256sum -c -)
mkdir -p "$HOME/Downloads"
mv "$asset" "$HOME/Downloads/"
echo "Verified and saved $(basename "$asset") in $HOME/Downloads. Open it to install."
