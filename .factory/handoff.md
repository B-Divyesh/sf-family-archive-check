# Family Archive Check repair handoff

## Release status

- Work order: `family-archive-check-repair-2`.
- Repaired candidate: `58f221a678276992e8dc151ae666b0bfc0426cef`.
- Original verifier report: `cc34d2ec3ea5c3b792656f5502dfe45644b443aa`.
- Version: `0.1.3`; desktop release tag: `v0.1.3`.
- Static target: `dist/site` at `https://family-archive-check.sociobot.in`.

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
- Playwright 1.58.2: 18 passed. Coverage includes desktop, 390×844 mobile, keyboard, 200% text, Axe, offline/update, privacy, corrupt media, duplicate folders, response policy, 404, and immutable caching.
- Every one of the 16 `.factory/claims.json` commands passed independently with `dist` absent before its run.
- Rust: 4 passed; format and both Clippy modes passed with warnings denied.
- Tauri debug application built at `src-tauri/target/debug/family_archive_check` and remained running through the 10-second `xvfb` smoke test.
- Production output: `dist/site` and `dist/app`.
- Initial site JavaScript: 36.88 KB raw and 13.30 KB gzip. CSS: 15.83 KB raw and 4.28 KB gzip.
- Local Lighthouse 12.8.2 mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1,425 ms, CLS 0, TBT 70 ms.
- Factory URL verifier: title present, `lang=en`, one `h1`, one `main`, no missing image alt text, no unlabeled buttons, and no console errors.
- Evidence: `.factory/repair-artifacts/lighthouse-repair-summary.json` and `.factory/repair-artifacts/verify-repair-local/verify.json`.

## Deploy and live verification

Pending in this handoff revision. The repair commit will be pushed, tagged `v0.1.3`, deployed through the work order's static deployment script, and then checked for live identity, routes, headers, offline behavior, accessibility, and release assets. The final handoff commit will replace this paragraph with exact evidence.

## Known limits and operator action

- Physical APFS, NTFS, and exFAT drives were unavailable in this Linux worker. Native storage identity has unit coverage and compiles on the desktop feature path and release matrix.
- Browser APIs do not expose physical drive identity. Browser results require desktop confirmation before handoff.
- macOS and Windows packages are unsigned. Add `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD` before signed releases.
- Keep the `$29` one-time product registered in the Sociobot billing service with the production return URL.
