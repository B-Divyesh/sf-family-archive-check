# Family Archive Check — repair 4 handoff

## Status — repaired, released, and deployed

The release-blocking findings in independent report `.factory/verification-4.md` for candidate `6517f9915f7244731dc32dbe1a71dc96277a9b87` are repaired. The product remains a Tauri 2 desktop app with a static landing site.

Repair commits:

- `bc818e01ed967fa62fc6bb1d9051ba806282b7dc` — product, accessibility, claims, valid-media fixtures, native regressions, and storage-matrix coverage.
- `7f70a8e65c79dcb2e8d93545f7d07574a3640feb` — platform-specific matrix shells.
- `6bb8757482d6ce15894097c7aa641588a67ff542` and `86ca8950cf30d0062740e554a695f63e0ec1e9ef` — real APFS/exFAT mounted-volume handling.

## Findings repaired

- Focus indicators use `#003F40` on paper and a light raised-surface treatment on dark regions. The live `/check` button reports `rgb(0, 63, 64) solid 4px`; this is well above the 3:1 indicator requirement on the paper surface.
- Footer links now have both `min-width` and `min-height` of 44 px. Live 390 px checks measured the Terms target at exactly `44×44` on the site and standalone 404.
- Added `repeatable-sample` and `complete-file-count` claims with exact native regressions. The claim set now contains 24 independently executable observable claims.
- Added original valid JPEG, PNG, HEIC, MP4, and MOV fixtures, plus native acceptance/hash coverage. GitHub CI scans them from real APFS, NTFS, and freshly formatted exFAT mounted volumes.
- Corrected singular result copy to “1 path match across both folders,” with browser regression coverage.

## Verification

- Clean install: `npm ci` passed.
- Unit and browser: `npm test` passed 14 Vitest and 28 Playwright tests. This includes desktop, 390 px mobile, keyboard, route focus, privacy, demo isolation, offline reload and stale-service-worker update coverage.
- Type/lint: `npm run typecheck`, `npm run lint`, `cargo check`, and both Clippy modes with `-D warnings` passed.
- Native: `cargo test --manifest-path src-tauri/Cargo.toml` passed 8 tests; `CI=true npm run tauri build -- --no-bundle` built and the binary stayed running in an Xvfb smoke test.
- Production consumer build: `npm ci --omit=dev && npm run build` passed in CI and emitted `dist/site` and `dist/app`.
- All 24 commands declared in `.factory/claims.json` were run individually and passed.
- GitHub [quality run 33273115430](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33273115430) passed clean install, browser tests, production build, installer helper, and the APFS/NTFS/exFAT storage-and-codec matrix.
- Accessibility: Playwright Axe found zero serious/critical issues on all app and 404 routes. `/opt/fleet/lib/verify-url.sh` passed locally and live with no console errors. Local mobile Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.35 s, CLS 0, TBT 104 ms. The static initial JavaScript is 38.72 KB raw (13.81 KB gzip); CSS is 16.22 KB raw (4.36 KB gzip).
- Live response policy: root is 200 with `no-cache`, HSTS, nosniff, strict-origin referrer policy, restrictive CSP, and camera/microphone/geolocation disabled; an unknown route is 404. One invalid license request returned the documented `{ valid: false, reason: "invalid" }` shape with `expires_at`. No sign-in or identity provider exists in this product, so identity verification is not applicable.

Evidence is committed under `.factory/repair-artifacts/verify-repair-4-local/`, `.factory/repair-artifacts/verify-repair-4-live/`, and `.factory/repair-artifacts/lighthouse-repair-4-local.json`.

## Release and deployment

- Tag `v0.1.7` points to `86ca8950cf30d0062740e554a695f63e0ec1e9ef`.
- [Release workflow 33273321900](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33273321900) passed for Linux, Windows, Intel macOS, Apple Silicon macOS, and checksums.
- [Release v0.1.7](https://github.com/B-Divyesh/sf-family-archive-check/releases/tag/v0.1.7) publishes AppImage, DEB, RPM, MSI, EXE, both DMGs, both app archives, `SHA256SUMS`, and `latest.json`. A downloaded `Family.Archive.Check_0.1.7_amd64.deb` passed the published SHA-256 check; `latest.json` is valid and has all five platform URLs for v0.1.7.
- `npm run build:site` was deployed to the existing Azure Static Web App production target (`sf-family-archive-check`). The live custom domain is [family-archive-check.sociobot.in](https://family-archive-check.sociobot.in); its client bundle SHA-256 matches the local production build. A fresh Linux browser context resolves “Download for Linux” to the real v0.1.7 AppImage without console errors.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo clippy --manifest-path src-tauri/Cargo.toml --features desktop --all-targets -- -D warnings
```

## Needs operator action

The installers are intentionally unsigned. Add `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` repository secrets when signing credentials are available; until then macOS and Windows may warn before installation.
