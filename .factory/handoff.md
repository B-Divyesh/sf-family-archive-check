# Family Archive Check repair handoff

## Release status

- Independent-verifier report repaired: `cc34d2ec3ea5c3b792656f5502dfe45644b443aa` against candidate `9c6bc1476de73b03cde87334250ad12715f53097`.
- Repair code commit: `7ea0863aea5de207c78b583cb028cac7f67311d5`.
- Version/tag: `v0.1.2`.
- Static deployment: Azure Static Web Apps production deployment `4ddb835f-7c43-4d01-931d-90876d873c1d`.
- Live URL: `https://family-archive-check.sociobot.in`.
- Desktop release workflow: `https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33211953287`.
- GitHub release: `https://github.com/B-Divyesh/sf-family-archive-check/releases/tag/v0.1.2`.

## Repairs

1. Each command in `.factory/claims.json` now builds what it needs. Playwright uses a production-policy test server, and Rust claim tests do not require GTK/Tauri libraries.
2. Sampled JPEG, PNG, GIF, WebP, and TIFF files are decoded before being marked readable. Other supported photo and video containers receive format and truncation checks. Empty files fail immediately.
3. Native scans include a storage-device identifier. The app blocks the same folder and folders on the same device. The browser blocks duplicate folder names and explains that only the desktop app can identify physical drives.
4. The desktop hero was tightened. At 1440×900, the audience sentence ends at 687.91 px and the sample action ends at 765.47 px.
5. Folder inputs now have accessible names and `tabindex="-1"`. Their visible buttons remain keyboard-operable. Fresh Axe checks cover `/check`.
6. The claim manifest now covers 16 relied-on statements, including the 500/501 boundary, demo isolation, license request privacy, date coverage, installer checksums, media validation, and folder independence.
7. Azure routes now return a real 404 for unknown URLs. Hashed `/assets/*` responses use `max-age=31536000, immutable`; HTML and the service worker remain revalidated.
8. Footer, purchase, and legal links meet the 44 px mobile target. Decorative button semantics and the cited metaphorical copy were removed.
9. The service-worker cache is versioned to `family-archive-check-v2`. The existing demo, export, handoff, license, and release-download flows remain intact.

## Exact verification evidence

Clean verification started with no `node_modules` or `dist`:

```sh
npm ci
npm test
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo clippy --manifest-path src-tauri/Cargo.toml --features desktop --all-targets -- -D warnings
CI=true npm run tauri -- build --debug --no-bundle
```

Results:

- `npm ci`: 65 packages installed, 0 vulnerabilities.
- Unit/policy: 9 passed.
- Playwright 1.58.2: 18 passed, including desktop, 390×844 mobile, keyboard, 200% text, Axe, offline, privacy, corrupt media, same-folder, 404, and caching regressions.
- Rust: 4 passed. Formatting and both clippy modes passed with warnings denied.
- Native Linux debug application built and stayed running for a 10-second `xvfb` smoke test.
- Production output: `dist/site` and `dist/app`.
- Initial site JavaScript: 36.88 KB raw and 13.29 KB gzip. CSS: 15.83 KB raw and 4.28 KB gzip.
- Local Lighthouse 12.8.2 mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1,505 ms, CLS 0, TBT 51 ms.
- Live Lighthouse 12.8.2 mobile: 100/100/100/100; LCP 951 ms, CLS 0, TBT 18.5 ms.
- Factory URL verifier: title present, `lang=en`, one `h1`, one `main`, no missing alt text, no unlabeled buttons, and no console errors.
- All 16 claim commands passed independently after `dist` was removed. Each e2e command rebuilt the site first.

Evidence is in `.factory/repair-artifacts/`.

## Live checks

- Local and live main-JavaScript SHA-256: `d4b365f9d7641bff9401df9e0cc4ed0530b6b2a18da3ebe1cb106a8e33aad2bb`.
- `/`, `/demo`, `/check`, `/privacy`, and `/terms`: HTTP 200.
- `/missing-stop`: HTTP 404 with the designed not-found page.
- Hashed main JavaScript: `Cache-Control: public, max-age=31536000, immutable`.
- `/sw.js`: `Cache-Control: no-cache`.
- HSTS, CSP, `nosniff`, Referrer Policy, and Permissions Policy are present.
- Fresh live desktop and mobile first-screen checks had zero overflow or console errors.
- Fresh live `/check` Axe serious/critical violations: 0. Hidden file inputs reached by Tab: 0.
- Live offline `/demo` reload restored “One archive item needs attention.” Demo requests stayed same-origin.
- The production license endpoint returned `valid: false, reason: invalid` for a smoke-test token and allowed the production origin through CORS.

## Desktop release verification

- All four Tauri matrix builds and the checksum job completed successfully.
- The release contains 11 assets: both macOS DMGs and app archives, Windows MSI and EXE, Linux AppImage, DEB, RPM, `SHA256SUMS`, and `latest.json`.
- `latest.json` reports `v0.1.2` and non-null URLs for macOS arm64/x64, Windows MSI, Linux AppImage, and Linux DEB.
- Downloaded RPM SHA-256 matched `3f40036fe6735fc465fa584d1da6613783c4f6c4e97c20d43fdd484e6313b648`.
- A fresh live browser selected the v0.1.2 Linux AppImage URL with no console errors.

## Known limits and operator action

- Physical APFS, NTFS, and exFAT drives were unavailable in this Linux worker. Native storage identity has unit coverage and compiled on the release matrix.
- Browser APIs do not reveal physical drive identity. The browser result now requires desktop confirmation before handoff.
- macOS and Windows packages are unsigned. Add `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` plus their password secrets before enabling notarized/signed builds.
- Keep the `$29` one-time product registered in the Sociobot billing service with the production return URL.
