# Family Archive Check — polish round 1 handoff

## Status

All 25 findings in `.factory/review-1.md` are fixed. The repaired static site is live at <https://family-archive-check.sociobot.in>. The Tauri desktop-app and static deployment classes are unchanged. There are no known product gaps or deferred review items.

## What changed

- Reworked the first screen so its job, audience, one-click `?demo=1` action, and all privacy/offline/price facts fit at 390×844 and 1440×900.
- Isolated the demo in its own in-memory state. Reset and Start for real cannot read or mutate real saved profiles.
- Strengthened `.factory/claims.json` to 21 claims and made every test observable. Paid-license coverage now performs a 501-file native check and reuses a saved profile after reload.
- Standardized “recovery file list” across the product and rewrote every jargon/copy finding.
- Added complete route metadata, sample print sitemap entry, route focus/announcements, and a full-shell real 404.
- Added executable shell and PowerShell installer checksum tests, including tamper rejection. Windows runs them in quality and release CI.
- Preserved the art-deco archive-transit visual system while tightening its responsive layout.
- Bumped the desktop app to 0.1.6 and kept npm, Cargo, Tauri, UI, and workflow versions aligned.

The exact F-1-1 through F-1-25 mapping is in `.factory/polish-1.md`.

## Verification evidence

Repair commits:

- `c0e0dc7a640158dddfddc127d6dd372941e1152a` — product, claims, copy, routing, layout, and tests.
- `59b906b` — corrected the Windows tampered-fixture scope; Windows CI job `99138064392` passed.
- `ecccc9d` — kept result entrance motion at full opacity so text contrast never dips during animation; the accessibility test passed three consecutive repeats and five cold live demo runs.
- `d5c2cf33ec06808c2f78344d114c4c602d978fa9` — recorded the complete finding and verification evidence; [quality run 33267041290](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33267041290) passed.

Final clean-clone verification used `/tmp/fac-polish-final.Nlk5zB` at `d5c2cf33ec06808c2f78344d114c4c602d978fa9`:

- All 21 claim commands from `.factory/claims.json` passed individually.
- `npm test`: 14 Vitest tests and 25 Playwright tests passed.
- `npm run lint`: TypeScript and Rust formatting passed.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 4 passed.
- Both clippy modes passed with `-D warnings`.
- `npm run build`: produced `dist/site` and `dist/app`.
- Initial JS: 38.69 KB raw / 13.80 KB gzip. CSS: 16.02 KB raw / 4.32 KB gzip. Mobile hero: 40.94 KB.

Accessibility, browser, privacy, and offline:

- Playwright axe found zero serious or critical violations on `/`, `/?demo=1`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and `/404.html` locally and live.
- `/opt/fleet/lib/verify-url.sh` passed locally in 767 ms and live in 614 ms with no console errors. Evidence: `.factory/repair-artifacts/polish-1-verify-local/` and `polish-1-verify-live/`.
- Offline reload, same-origin archive flow, no tracking, license request shape, demo isolation, keyboard routing/focus, 200% text, mobile overflow, touch targets, and real 404 status are covered by Playwright.
- Lighthouse mobile local: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.6 s, CLS 0, TBT 110 ms.
- Lighthouse mobile live: 100/100/100/100; LCP 1.2 s, CLS 0, TBT 40 ms. Reports are in `.factory/repair-artifacts/polish-1-lighthouse-*.json`.

Deployment:

- Work-order command `npm ci && npm test && npm run build:site` passed immediately before deployment.
- Final Azure Static Web Apps deployment `96dbf482-cb1c-44c4-914e-14b910e63b75` succeeded.
- Cold live checks confirmed first-view facts, one-click demo, reset/exit, exact real-storage preservation, all route titles/canonicals, handoff content, 404 shell/status, legal links, revised copy, and no unexpected console errors.
- Live screenshots: `.factory/repair-artifacts/polish-1-desktop-live.png`, `polish-1-mobile-live.png`, `polish-1-demo-live.png`, and `polish-1-not-found-live.png`.

Desktop release:

- Tag `v0.1.6` points to final repair commit `43f750885b863fed2298e361af0c4c5190fb4811`.
- [Release workflow 33267370733](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33267370733) passed for Linux, Windows, Intel macOS, Apple Silicon macOS, and checksums.
- The public [v0.1.6 release](https://github.com/B-Divyesh/sf-family-archive-check/releases/tag/v0.1.6) contains AppImage, DEB, RPM, MSI, EXE, both DMGs, both app archives, `SHA256SUMS`, and `latest.json`.
- Downloaded `Family.Archive.Check_0.1.6_amd64.deb` passed `sha256sum -c` against the published checksum file. `latest.json` parsed successfully and every platform URL targets v0.1.6.
- A cold Linux visit resolved “Download for Linux” to the real v0.1.6 AppImage with no console errors.

## Run and verify

```sh
npm ci
npm test
npm run lint
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo clippy --manifest-path src-tauri/Cargo.toml --features desktop --all-targets -- -D warnings
npm run build
```

## Needs operator action

The 0.1.6 installers are intentionally unsigned. Add `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` to repository secrets when signing credentials are available. Until then, operating systems may warn before installation.
