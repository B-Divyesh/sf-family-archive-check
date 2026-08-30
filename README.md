# Family Archive Check

Check that family photos and videos have a readable, independent copy before handoff.

Family Archive Check is a desktop app that keeps archive data on your computer. It compares a main archive with an independent copy on another drive. It tests the same repeatable sample of photos and videos, then reports missing, changed, and unreadable files. It also exports and imports a recovery file list (JSON) and a printable handoff sheet.

It does not host photos, identify faces, sync files, or change the selected folders.

## Try the sample

Open `https://family-archive-check.sociobot.in/demo`. The sample opens without an account and contains one missing video. Demo data stays separate from real folder data.

## Install

The [product site](https://family-archive-check.sociobot.in) detects macOS, Windows, or Linux and links to the matching installer.

You can also download the app from a terminal:

```sh
curl -fsSL https://family-archive-check.sociobot.in/install.sh | sh
```

```powershell
irm https://family-archive-check.sociobot.in/install.ps1 | iex
```

Both helpers confirm that the download is unchanged, then place the installer in Downloads. Open the downloaded installer to finish.

Developer note: each helper verifies the published SHA-256 checksum before saving the installer.

## Use the app

1. Choose the main archive folder.
2. Choose an independent copy on another connected drive or network folder.
3. Select **Check both folders**.
4. Review missing, changed, and unreadable items.
5. Export the recovery file list (JSON) and print the handoff sheet.
6. Import the recovery file list to check a restored folder later.

The installed app blocks folders on the same storage device. The website can spot the same folder name, but only the desktop app can confirm separate drives.

The free app checks up to 500 files. A $29 one-time household license enables unlimited checks and saved folder profiles. Recovery exports and accessibility are never paid features.

## Develop and test

Requirements: Node.js 22.12.x, Rust stable, and the [Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/).

```sh
npm ci
npm run dev
npm test
npm run lint
cargo test --manifest-path src-tauri/Cargo.toml
```

The scanner tests valid JPEG, PNG, HEIC, MP4, and MOV fixtures. CI also scans those fixtures on APFS, NTFS, and exFAT volumes; see `.factory/storage-matrix.md`.

Build the deployable static site:

```sh
npm run build:site
# output: dist/site/index.html
```

Build both web targets:

```sh
npm run build
# output: dist/site and dist/app
```

Run the native app during development:

```sh
npm run tauri dev
```

## Release

`.github/workflows/release.yml` runs for `v*` tags. It builds Tauri installers for macOS arm64 and x86_64, Windows, and Linux. The workflow attaches installers, `SHA256SUMS`, and `latest.json` to the GitHub Release.

## Privacy and license

The scanner reads chosen folders locally. The website sends no archive data away. The product verification endpoint forwards only the pasted token to Sociobot’s license service. It allows 10 requests per client address in 10 minutes. After that, it returns HTTP 429 with a `Retry-After` value. See `/privacy` and `/terms` on the product site.

The source code is available under the [MIT License](LICENSE).
