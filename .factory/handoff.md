# Family Archive Check handoff

## What was built

- A Tauri 2 desktop app with a Rust, read-only folder scanner.
- Main/archive copy comparison by relative path, byte size, and up to 48 stable, paired SHA-256 media samples.
- Readability checks for every file plus EXIF or filename year coverage.
- Clear ready and attention reports for missing, changed, extra, and unreadable files.
- Portable JSON recovery manifest downloads and a printable recovery handoff sheet.
- A browser folder-picker fallback for the hosted static site.
- A one-click isolated demo at `/demo` with a realistic missing-video case.
- A $29 one-time license flow through Sociobot, including callback storage, daily verification, paste-to-restore, removal, a 500-file free limit, unlimited checks, and local saved profiles.
- An art-deco transit-poster visual system and original generated archive illustration.
- `/privacy`, `/terms`, SPA 404 handling, metadata, social art, icons, service worker, security headers, sitemap, robots, and OS-aware release links.
- A GitHub Actions matrix for unsigned macOS arm64/x86_64, Windows, and Linux installers, plus `SHA256SUMS` and `latest.json`.

## Run and verify

```sh
npm ci
npm test
npm run build:site
cargo test --manifest-path src-tauri/Cargo.toml
```

The static deployment output is `dist/site/index.html`. The Tauri webview output is `dist/app/index.html` after `npm run build`.

Verified on 2026-08-28:

- `npm test`: 4 unit tests and 11 Playwright tests passed.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 2 native scanner tests passed.
- TypeScript: `npx tsc --noEmit` passed.
- Rust formatting: `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` passed.
- Dependency audit: 0 known npm vulnerabilities.
- Initial site assets: 12.4 KB gzip JavaScript and 4.2 KB gzip CSS.
- Hero WebP: 92 KB desktop and 40 KB mobile.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100.
- Lighthouse timings: LCP 1.4 s, CLS 0, total blocking time 30 ms.
- Playwright checked offline reload, outbound requests, JSON contents, 390 px layout, all main routes, and serious/critical axe findings.

## Release verification

- GitHub Actions run `33203929377` completed successfully for tag `v0.1.1`.
- The release contains macOS arm64/x64 DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`.
- `latest.json` contains non-null HTTPS URLs for each supported platform.
- The Windows MSI was downloaded from the public release and matched SHA-256 `2112898d21b75ce3cd7fd154aa9028147a3d7c245b2d0fa0c9f06dbc57b479ff`.
- Release: `https://github.com/B-Divyesh/sf-family-archive-check/releases/tag/v0.1.1`.

## Product notes

- Hashing reads the full contents of no more than 48 media files per folder. A stable path score keeps the sample aligned when one copy is missing files. All other files still get an open/read check.
- Folder traversal errors become unreadable entries instead of disappearing from the report.
- Photo dates come from EXIF `DateTimeOriginal` or `DateTime`; filename years are the fallback. Video dates use filename years.
- The browser fallback gets only the access granted by the folder picker. The installed app reads explicit paths selected in the native picker.
- The app never moves, renames, edits, or uploads selected media. Exporting a manifest is the only archive workflow that writes a file.
- Generated art provenance and the complete prompt are in `.factory/design.md` and `assets/src/archive-route.json`.

## Known gaps

- APFS, NTFS, and exFAT behavior is implemented through standard read-only file APIs, but physical drives were not available in this Linux worker for device testing.
- HEIC files can be inventoried and hashed. Embedded HEIC EXIF support depends on what the EXIF parser can decode; filename years remain available.
- Signed and notarized installers cannot be produced without owner certificates.

## Needs operator action

- Register the paid product slug `family-archive-check` with the Sociobot billing service and set the production return URL.
- Add `APPLE_CERTIFICATE`, its password/profile secrets, and `WINDOWS_CERT_PFX` secrets before enabling signed builds. The current workflow intentionally builds unsigned installers.
