# Family Archive Check — independent verification handoff

## Current release status: FAIL

Independent QA of candidate `a2a14da843e2d2ec09542f8f3371c0d4ddcfe55c` at `https://family-archive-check.sociobot.in` on 2026-08-28 UTC **FAILS**.

Release-blocking High defect: on cold page load the app programmatically focuses its `<h1>`, so forward Tab navigation starts at main content and omits the skip link and header navigation. This violates the product’s keyboard/skip-link accessibility contract. The exact evidence, complete claim results, local/live checks, and remediation are in `.factory/verification-2.md`.

All 16 required claims passed; the clean production-only `npm ci --omit=dev` → `npm run build` deployment boundary also passed. The live site matches the candidate bundle and service-worker hashes. Do not release this candidate until the cold-load tab order is repaired and independently retested.

---

# Previous repair handoff

## Release status

- Work order: `family-archive-check-repair-2`.
- Repaired candidate: `58f221a678276992e8dc151ae666b0bfc0426cef`.
- Original verifier report: `cc34d2ec3ea5c3b792656f5502dfe45644b443aa`.
- Version: `0.1.3`; desktop release tag: `v0.1.3`.
- Static target: `dist/site` at `https://family-archive-check.sociobot.in`.
- Repair commits: `8e9c0f3` (build), `8e354ff` (CI browser gate), and `dd9aeb1` (online update policy).

## Controller build failure and repair

The clean production-install boundary reproduced the controller failure before any change:

```text
$ npm ci --omit=dev
added 2 packages, audited 3 packages, 0 vulnerabilities
$ npm run build
> npm run build:site && npm run build:app
> vite build --mode site --outDir dist/site
sh: 1: vite: not found
exit 127
```

Vite was in `devDependencies`, so deployment environments that omit development packages could install successfully and then fail at the configured build. Vite `7.3.6` is now an exact production dependency. The supported builder runtime is pinned to Node `>=22.12 <23`.

Regression coverage:

- `tests/build.test.ts` executes the exact `npm run build` command and checks `dist/site/index.html`, its Static Web Apps policy, and `dist/app/index.html`.
- `.github/workflows/quality.yml` has an isolated `npm ci --omit=dev` → `npm run build` job and checks both output roots.
- A separate full-suite job uses Node 22.12, installs Tauri's Linux prerequisites, and runs test, lint, build, Rust test, and warnings-as-errors Clippy gates.
- Package, Tauri, Cargo, and visible footer versions have a synchronization regression.

The repaired production-only sequence passed: 19 packages installed, 0 vulnerabilities, and both production targets built.

## Preserved verifier repairs

The release keeps every repair made for the independent report:

1. All claim commands build their own browser fixture from a clean checkout.
2. Sampled JPEG, PNG, GIF, WebP, and TIFF files are decoded before being marked readable; empty and truncated media fail.
3. Native scans block the same folder or storage device. Browser scans block duplicate folder names and explain their physical-drive limit.
4. The audience sentence and sample action remain within the 1440×900 first viewport.
5. Folder inputs retain accessible names and stay out of sequential keyboard focus.
6. The claims manifest retains all 16 relied-on claims, including the 500/501 boundary, demo isolation, license-request privacy, capture-year coverage, installer checksums, media validation, and folder independence.
7. Unknown URLs return 404; hashed assets retain one-year immutable caching; the service worker remains revalidated.
8. Mobile legal and purchase links retain 44 px targets; decorative button semantics and metaphorical copy remain removed.
9. The service-worker cache remains versioned, and demo, export, handoff, license, and release-download flows remain intact.

## Clean verification evidence

Commands run in this worker:

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
timeout 10s xvfb-run -a src-tauri/target/debug/family_archive_check
```

Results:

- `npm ci`: 65 packages, 0 vulnerabilities.
- Vitest: 12 passed, including the executable full-build and version-sync regressions.
- Playwright 1.58.2: 19 passed. Coverage includes desktop, 390×844 mobile, keyboard, 200% text, Axe, offline/update, privacy, corrupt media, duplicate folders, response policy, 404, and immutable caching.
- Every one of the 16 `.factory/claims.json` commands passed independently with `dist` absent before its run.
- Rust: 4 passed; format and both Clippy modes passed with warnings denied.
- Tauri debug application built at `src-tauri/target/debug/family_archive_check` and remained running through the 10-second `xvfb` smoke test.
- Production output: `dist/site` and `dist/app`.
- Initial site JavaScript: 36.88 KB raw and 13.30 KB gzip. CSS: 15.83 KB raw and 4.28 KB gzip.
- Local Lighthouse 12.8.2 mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1,425 ms, CLS 0, TBT 70 ms.
- Factory URL verifier: title present, `lang=en`, one `h1`, one `main`, no missing image alt text, no unlabeled buttons, and no console errors.
- Evidence: `.factory/repair-artifacts/lighthouse-repair-summary.json` and `.factory/repair-artifacts/verify-repair-local/verify.json`.

## Deploy and live verification

- Final Azure Static Web Apps production deployment: `f6004351-c86f-4bee-8b67-6a03ccf66c2d`.
- Final repository quality workflow: [run 33215087468](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33215087468), both jobs passed. This includes the production-only install/build regression.
- Desktop release workflow: [run 33214371549, attempt 2](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33214371549), all four platform builds and the checksum job passed.
- GitHub release: [v0.1.3](https://github.com/B-Divyesh/sf-family-archive-check/releases/tag/v0.1.3), 11 assets.
- `latest.json` reports `v0.1.3` and non-null macOS arm64/x64, Windows MSI, Linux AppImage, and Linux DEB URLs. Its asset list contains nine installers/app archives.
- Downloaded RPM SHA-256: expected and actual `783261e2ed20431786a1df8065a3942c78f7ce2d4c5854ea54e151ae11f3bdce`.
- A fresh live Linux browser selected the `v0.1.3` AppImage URL and reported no console errors.
- Local and live main JavaScript SHA-256: `1de4aa68062c2df0dd3f30426dae13944181994068b77a7251ce85c297594d8f`.
- Local and live service-worker SHA-256: `bb8bbdc48f2f73d6ac630de4eb00cd792a1b94b0d0f808e47b72b626507652e0`.
- Live routes `/`, `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive` return 200; `/missing-stop` returns 404.
- Hashed JavaScript returns `Cache-Control: public, max-age=31536000, immutable`; `/sw.js` returns `Cache-Control: no-cache`.
- HSTS, CSP, `nosniff`, Referrer Policy, and Permissions Policy are present.
- Fresh live desktop and 390×844 mobile checks have zero horizontal overflow and console errors. The primary sample action ends at 765 px in the 900 px desktop viewport and 618 px in the 844 px mobile viewport.
- Live `/check` has zero serious/critical Axe findings, and neither hidden file input receives sequential keyboard focus.
- A deliberately stale cached page was replaced on an online reload. The refreshed page then reloaded offline, proving both update and fallback behavior.
- Demo traffic stayed same-origin. The live invalid-license check returned `{valid:false, reason:"invalid"}` with CORS allowing the production origin.
- All crawled internal links returned 200.
- Live Lighthouse 12.8.2 mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1,210 ms, CLS 0, TBT 29 ms.
- Final URL verifier: 987 ms load, correct title and `lang`, one `h1`, one `main`, no missing alt text, no unlabeled buttons, and no console errors.
- Live evidence: `.factory/repair-artifacts/live-lighthouse-repair-summary.json` and `.factory/repair-artifacts/verify-repair-live/verify.json`.

## Known limits and operator action

- Physical APFS, NTFS, and exFAT drives were unavailable in this Linux worker. Native storage identity has unit coverage and compiles on the desktop feature path and release matrix.
- Browser APIs do not expose physical drive identity. Browser results require desktop confirmation before handoff.
- macOS and Windows packages are unsigned. Add `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD` before signed releases.
- Repository Actions cannot create the initial GitHub Release despite job-level `contents: write`; the factory credential created `v0.1.3`, after which the workflow uploaded every asset. Keep this pre-create step unless repository policy is changed.
- Keep the `$29` one-time product registered in the Sociobot billing service with the production return URL.
