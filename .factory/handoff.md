# Family Archive Check — repair handoff

## Status

**REPAIRED AND DEPLOYED.** Version `0.1.5` is live at `https://family-archive-check.sociobot.in`, and its cross-platform desktop installers are published in the `v0.1.5` GitHub Release.

- Keyboard repair: `3f19c56` — `fix: restore cold-load keyboard navigation`
- Contrast repair: `09c6c43` — `fix: enforce archive check contrast`
- Original failed candidate: `a2a14da843e2d2ec09542f8f3371c0d4ddcfe55c`

## Repair made

Independent verification of candidate `a2a14da843e2d2ec09542f8f3371c0d4ddcfe55c` found one release-blocking defect: the initial SPA render focused the route `<h1>`. On a cold load, the first forward Tab therefore skipped **Skip to main content** and the complete header navigation.

`src/main.ts` now distinguishes a cold render from a route transition:

- Cold loads leave focus at the document start, so the skip link is the first Tab stop.
- Client-side navigation and `popstate` (back/forward) focus the new `<h1>` and update the polite route announcer.
- Non-navigation re-renders no longer unexpectedly move focus to the heading.

The desktop-app, static-site, demo, privacy, offline, release-download, and local-first behaviors remain unchanged. The release version was advanced to `0.1.5` consistently across npm, Cargo, Tauri, UI, lockfiles, and the manual release-workflow default. A clean GitHub CI run also exposed six serious contrast failures on the result screen; the teal, coral, green, muted, and raised palette tokens were deepened or clarified so every result-screen text pair clears WCAG 4.5:1.

## Regression coverage

`tests/e2e/claims.spec.ts` adds `cold-load keyboard order starts with the skip link and route changes announce their heading`. From a fresh `/` load it asserts:

1. the document body retains focus before keyboard use;
2. the skip link is the first visible Tab stop;
3. the wordmark, Demo, Check folders, and Privacy remain in forward order;
4. SPA navigation to Demo and browser Back both focus the new route heading.

`tests/policy.test.ts` also calculates contrast directly from the shipped CSS tokens and requires every result/action text pair to meet 4.5:1. The full Playwright suite retains checks for hidden file-input focus, desktop and 390 px layouts, 200% text, all public routes, serious/critical Axe findings, demo isolation, offline reload/update, privacy request boundaries, 404/cache policy, export, handoff, license, corrupt-media, and duplicate-folder behavior.

## Local verification

Commands run successfully in this worker:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo clippy --manifest-path src-tauri/Cargo.toml --features desktop --all-targets -- -D warnings
CI=true npm run tauri -- build --debug --no-bundle
timeout 12s xvfb-run -a src-tauri/target/debug/family_archive_check
npm ci --omit=dev
npm run build
```

Results:

- Fresh `npm ci`: 65 packages, 0 vulnerabilities.
- `npm test`: 13 Vitest tests and 20 Playwright tests passed.
- TypeScript, formatting, both production bundles, 4 Rust tests, and both warnings-as-errors Clippy modes passed.
- The debug Tauri executable built and stayed alive for the 12-second Xvfb smoke test; only expected headless EGL/DRI3 warnings appeared.
- The production-only boundary installed 19 packages with 0 vulnerabilities and built both `dist/site` and `dist/app`; Vite remains a production dependency for this supported deployment path.
- Every one of the 16 commands in `.factory/claims.json` passed independently, including both Rust claims and all browser claims.
- Initial site JavaScript is 33.19 KB raw / 11.79 KB gzip plus a 2.48 KB core chunk; CSS is 15.83 KB raw / 4.28 KB gzip.
- Local Lighthouse 13.4.1 mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1,506 ms, CLS 0, TBT 30 ms.
- The factory URL verifier found the title, `lang=en`, one `<h1>`, one `<main>`, no missing image alternatives, no unlabeled buttons, and no browser console errors.

Evidence:

- `.factory/repair-artifacts/lighthouse-repair-3-local.json`
- `.factory/repair-artifacts/verify-repair-3-local/verify.json`

## Deploy and live verification

- Static Web Apps production deployment: `6abb6e84-5a72-4297-b367-bc2237844a00`.
- GitHub quality workflow [33247915904](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33247915904) passed both the full-suite and production-only install/build jobs.
- An interim `v0.1.4` installer workflow was cancelled after its quality workflow exposed the contrast issue; no `v0.1.4` GitHub Release was published, and that unissued tag was removed.
- GitHub release workflow [33248131214](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33248131214) passed its Windows, Linux, macOS arm64, macOS x64, and checksum jobs.
- GitHub release [v0.1.5](https://github.com/B-Divyesh/sf-family-archive-check/releases/tag/v0.1.5) has 11 assets: macOS arm64/x64 DMGs and app archives, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`.
- Downloaded `Family.Archive.Check-0.1.5-1.x86_64.rpm` SHA-256 was expected and actual `a9fb8e98c8ff636f030cfd38d401b201deebd3d3c67f922c1362222283c88054`.
- `latest.json` reports `v0.1.5` and non-null macOS arm64/x64, Windows MSI, Linux AppImage, and Linux DEB URLs. A fresh live Linux browser selected `Family.Archive.Check_0.1.5_amd64.AppImage` with no console errors.
- Live JavaScript `assets/index-BNHlxbJF.js` SHA-256 matches the locally built bundle: `5486a06aebaabe1a1e889dd207d03780e0eaf4ee6c46ec82fb57d71115b73688`. Live `/sw.js` matches source: `bb8bbdc48f2f73d6ac630de4eb00cd792a1b94b0d0f808e47b72b626507652e0`.
- Live `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and `/404.html` return 200; `/missing-stop` returns 404. Hashed assets are immutable and `/sw.js` is `no-cache`.
- Fresh 1440×900 and 390×844 browser checks passed. The cold-load first Tab targets the visible skip link, then the wordmark and header navigation; route navigation and Back focus their new heading. No horizontal overflow or console/page errors occurred.
- Playwright Axe found zero serious/critical violations on every public route. The live demo reset/export/leave flow made only same-origin product requests. After service-worker activation, `/demo` reloaded offline with its sample result.
- Live headers include HSTS, `nosniff`, strict-origin referrer policy, restrictive CSP with `frame-ancestors 'none'`, and permissions policy. No analytics, third-party fonts, or undeclared external requests were observed.
- Live Lighthouse 13.4.1 mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1,827 ms, CLS 0, TBT 35 ms.

Evidence:

- `.factory/repair-artifacts/lighthouse-repair-3-live.json`
- `.factory/repair-artifacts/verify-repair-3-live/verify.json`

## Known limits and operator action

- The Linux worker cannot directly exercise physical APFS, NTFS, or exFAT devices. Native storage-identity behavior retains Rust coverage and ships through the multi-platform release workflow.
- Browser APIs cannot identify physical drives; browser-mode results still explain that desktop confirmation is required before handoff.
- macOS and Windows packages are unsigned. Signing requires `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`.
- No analytics or third-party fonts are used. The only cold landing-page external request is GitHub's public release API; license verification is explicitly initiated and goes only to Sociobot.
