# Perfection loop round 3 — complete finding closure

- Released candidate: `4c2cc445cdef25f4f3ceddec7452231a6b702d27`
- Adversarial report: `cfa6bf029ac05bc7c7de19ac0a4df09212cb44a8` / `.factory/review-3.md`
- Repair implementation: `1b0b50e4d74b7414cb9eb42e8c90664f85d0f13d`
- Deployment: `60bea997-51a7-4e61-abee-221f5a33b7fe`

## Review 3 finding

| Finding | Change made | Evidence |
|---|---|---|
| F-3-1 | Replaced the misleading exact progress phrase with “Checking up to 48 media files.” Added `media-sample-count` to `.factory/claims.json`, centralized the native limit, and dedicated a test that scans 60 valid images and proves 48 are sampled, readable, and hashed. | `cargo test --manifest-path src-tauri/Cargo.toml claim_media_sample_count`; clean-clone log `/tmp/family-archive-check-polish-3-media-sample-count.log`; live text at `/`; [live desktop screenshot](verification-artifacts/polish-3-live-home-desktop.webp). |

## Review 1 findings

| Finding | Change retained and reverified | Evidence |
|---|---|---|
| F-1-1 | A recorded valid entitlement enables a 501-file check, profile save, reload, and reuse; the same flow proves the unlicensed boundary. | `@claim:paid-license`; clean-clone claim pass; live `/check`. |
| F-1-2 | The handoff claim asserts the heading, four recovery steps, both locations, result, and Print action. | `@claim:handoff-sheet`; live `/print/sample-family-archive`. |
| F-1-3 | Shell valid/tampered cases execute locally; the Windows PowerShell harness executes both cases in CI. | `@claim:installer-checksum`; quality run `33293365892`; v0.1.9 DEB matched `SHA256SUMS`. |
| F-1-4 | Demo state stays in memory. The test and live audit preserve seeded real profiles and a sentinel through export, reset, and exit. | `@claim:demo-isolation`; live one-click storage audit; [live demo screenshot](verification-artifacts/polish-3-live-demo-mobile.webp). |
| F-1-5 | Payment wording names Dodo Payments and is backed by the live checkout policy. | `@claim:payment-policy`; cold link crawl received 200 after the Dodo redirect. |
| F-1-6 | Recovery exports and accessibility remain available without a license. | `@claim:free-exports`; `@claim:accessibility-not-gated`; live `/demo`. |
| F-1-7 | Landing and demo both show six main items and five copy items. | `@claim:demo-ready`; live demo screenshot above. |
| F-1-8 | Public copy says the app does not identify people; source, dependencies, and permissions prohibit face-recognition and camera code. | `@claim:no-face-recognition`; live `/privacy`. |
| F-1-9 | Audience, action, and all three facts fit inside 390×844 and 1440×900 first views. | Browser tests `mobile layout keeps actions inside the viewport` and `desktop first screen keeps its audience and primary action visible`; [live mobile screenshot](verification-artifacts/polish-3-live-home-mobile.webp). |
| F-1-10 | Every public route sets its own title, description, canonical, Open Graph, and Twitter metadata. | Browser test `every public route publishes its own title, description, canonical, and social metadata`; cold live checks on all six routes. |
| F-1-11 | The sample handoff route is listed in the sitemap. | `public/sitemap.xml`; live `/sitemap.xml` and `/print/sample-family-archive` returned 200. |
| F-1-12 | The real HTTP 404 uses the full standard shell and poster identity. | Browser test `unknown routes return 404 and hashed assets are immutable`; [live 404 screenshot](verification-artifacts/polish-3-live-not-found-desktop.webp); live unknown paths returned 404. |
| F-1-13 | The process copy explains counting files, opening samples, and checking changed matches. | `.factory/copy-audit.md`; live `/`. |
| F-1-14 | Public copy consistently uses `main archive`, `independent copy`, and `recovery file list`. | Policy test `uses main archive, independent copy, and recovery file list consistently`; live `/`, `/check`, and README audit. |
| F-1-15 | The walkthrough says the app counts and tests both folders the same way. | `.factory/copy-audit.md`; live `/`. |
| F-1-16 | The disclosure control says “Enter license token” and reveals the field. | Keyboard browser coverage; live `/`. |
| F-1-17 | README says archive data stays on the computer. | `.factory/copy-audit.md`; README line 5. |
| F-1-18 | README describes the same repeatable photo and video sample. | `@claim:repeatable-sample`; README audit. |
| F-1-19 | README calls the optional commands terminal downloads. | `.factory/copy-audit.md`; README Install section. |
| F-1-20 | Visitor copy explains that downloads are checked for changes; SHA-256 stays in a developer note. | `@claim:installer-checksum`; README audit. |
| F-1-21 | Folder guidance says connected drive or network folder. | `@claim:independent-folders`; live `/check`; README audit. |
| F-1-22 | Copy plainly distinguishes website folder names from desktop drive checks. | `@claim:independent-folders`; live `/check`; README audit. |
| F-1-23 | README says “Build the deployable static site.” | `.factory/copy-audit.md`; README Develop and test section. |
| F-1-24 | Privacy copy says Sociobot’s license service. | `@claim:license-privacy`; live `/privacy`; README audit. |
| F-1-25 | The unsupported visitor-facing signing statement remains removed. | Exact-copy audit; `@claim:platform-download`; live install section resolves to a real AppImage. |

## Review 2 and earlier controller findings

| Finding | Change retained and reverified | Evidence |
|---|---|---|
| F-2-1 | Real handoff previews stay inside `/check`; only the sample has a public print route; unknown print paths return the designed HTTP 404. | Browser test `a real handoff stays inside the check route and unknown print paths are real 404s`; cold live 200/404 checks. |
| F-2-2 | Result headings derive from the actual missing, changed, and unreadable count. | Browser test `a multi-item result names the true issue count in its heading and status`. |
| F-2-3 | README, picker, and walkthrough use the full product terms. | Policy terminology test; live `/` and `/check`. |
| F-2-4 | A fresh visitor reaches populated sample data with no account controls, redirect, or auth cookie. | `@claim:demo-ready`; live one-click demo audit. |
| F-2-5 | The unproved unsigned-installer sentence remains absent. | Exact-copy audit; `@claim:platform-download`. |
| F-2-6 | The `v*` release trigger is registered and parsed by a claim test. | `@claim:release-tag-trigger`; `.github/workflows/release.yml`. |
| F-2-7 | The macOS arm64/x64, Windows, and Linux Tauri matrix is registered and tested. | `@claim:release-platform-builds`; v0.1.9 release asset list. |
| F-2-8 | Installer assets, `SHA256SUMS`, and `latest.json` are registered and tested. | `@claim:release-attachments`; live v0.1.9 manifest has five non-null platform URLs. |
| F-2-9 | Recovery-file-list import validates local JSON and compares a restored folder locally. | `@claim:recovery-import`; `@claim:recovery-import-private`; live `/check`. |
| F-2-10 | The walkthrough heading names the desktop check from folder choice to report and makes no speed claim. | `.factory/copy-audit.md`; live `/`. |
| F-2-11 | README says “matching installer.” | README audit; live platform link. |
| F-2-12 | Purchase copy says Dodo handles questions or requests about the order. | `@claim:payment-policy`; live `/` and `/terms`. |
| V8-1 | The historical multi-item result heading uses the true issue count. | Browser test `a multi-item result names the true issue count in its heading and status`. |
| Controller-3-1 | Each Playwright run owns a fresh server; cleanup refuses unrelated listeners; offline tests close only their private contexts. | Full clean-clone 33-test Playwright pass; `tests/stop-preview-server.mjs`; `playwright.config.ts`; `@claim:offline-reload`. |

## Final evidence

- Clean clone `/tmp/family-archive-check-polish-3-clean.RNA5r0` at `1b0b50e4d74b7414cb9eb42e8c90664f85d0f13d`: all 32 exact claim commands passed independently. Logs are `/tmp/family-archive-check-polish-3-<claim-id>.log`.
- The same clone passed `npm test` (27 Vitest and 33 Playwright tests), typecheck, formatting, both site/app builds, eight native tests, and both clippy configurations.
- GitHub quality run `33293365892` completed successfully.
- Live route audit: `/`, `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive` returned 200; two unknown paths returned the designed 404. All routes had one h1/main, correct route metadata, no unexpected console errors, and zero serious/critical Axe findings.
- Live mobile Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 90 ms.
- Initial bundles: 15,022 bytes JavaScript gzip, 4,407 bytes CSS gzip; mobile hero 40,942 bytes.
- The final live crawl checked 16 links. Checkout, legal, internal, Sociobot, and the current Linux installer resolved successfully.
- Release v0.1.9 contains macOS arm64/x64, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`; the downloaded DEB checksum passed.

Every reported finding is closed. No severity is deferred.
