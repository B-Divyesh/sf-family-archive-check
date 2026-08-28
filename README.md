# Family Archive Check

Check that family photos and videos have a readable, independent copy before handoff.

Family Archive Check is a local-first desktop app for household archivists. It compares a main folder with a copy on another drive. It reports missing, changed, and unreadable files. It also exports a portable JSON recovery manifest and a printable handoff sheet.

It does not host photos, identify faces, sync files, or change the selected folders.

## Try the sample

Open `https://family-archive-check.sociobot.in/demo`. The sample works without an account and contains one missing video. Demo data stays separate from real folder data.

## Install

The [product site](https://family-archive-check.sociobot.in) detects macOS, Windows, or Linux and links to the matching release. Builds are unsigned until the operator adds signing certificates.

Command-line download helpers are also available:

```sh
curl -fsSL https://family-archive-check.sociobot.in/install.sh | sh
```

```powershell
irm https://family-archive-check.sociobot.in/install.ps1 | iex
```

Both helpers download the current release, verify its SHA-256 checksum, and place it in Downloads. Open the downloaded installer to finish.

## Use the app

1. Choose the main archive folder.
2. Choose an independent copy on another drive or mounted location.
3. Select **Check both folders**.
4. Review missing, changed, and unreadable items.
5. Export the JSON recovery manifest and print the handoff sheet.

The free app checks up to 500 files. A $29 one-time household license enables unlimited checks and saved folder profiles. Recovery exports and accessibility are never paid features.

## Develop and test

Requirements: Node.js 22+, Rust stable, and the [Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/).

```sh
npm ci
npm run dev
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

Build the static deploy exactly as the work order expects:

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

`.github/workflows/release.yml` runs for `v*` tags. It builds unsigned Tauri installers for macOS arm64 and x86_64, Windows, and Linux. The workflow attaches installers, `SHA256SUMS`, and `latest.json` to the GitHub Release.

## Privacy and license

The scanner reads chosen folders locally. The website sends no archive data away. A license check sends only the pasted license token to the Sociobot billing API. See `/privacy` and `/terms` on the product site.

The source code is available under the [MIT License](LICENSE).
