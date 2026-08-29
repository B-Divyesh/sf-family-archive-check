# Family Archive Check — repair handoff

## Status

Local repair verification is complete for version `0.1.4`. This handoff will be updated with the pushed commit, production deployment, and live checks after publication.

## Repair made

Independent verification of candidate `a2a14da843e2d2ec09542f8f3371c0d4ddcfe55c` found one release-blocking defect: the initial SPA render focused the route `<h1>`. On a cold load, the first forward Tab therefore skipped **Skip to main content** and the complete header navigation.

`src/main.ts` now distinguishes a cold render from a route transition:

- Cold loads leave focus at the document start, so the skip link is the first Tab stop.
- Client-side navigation and `popstate` (back/forward) focus the new `<h1>` and update the polite route announcer.
- Non-navigation re-renders no longer unexpectedly move focus to the heading.

The desktop-app, static-site, demo, privacy, offline, release-download, and local-first behaviors remain unchanged. The release version was advanced to `0.1.4` consistently across npm, Cargo, Tauri, UI, lockfiles, and the manual release-workflow default.

## Regression coverage

`tests/e2e/claims.spec.ts` adds `cold-load keyboard order starts with the skip link and route changes announce their heading`. From a fresh `/` load it asserts:

1. the document body retains focus before keyboard use;
2. the skip link is the first visible Tab stop;
3. the wordmark, Demo, Check folders, and Privacy remain in forward order;
4. SPA navigation to Demo and browser Back both focus the new route heading.

The full Playwright suite also retains checks for hidden file-input focus, desktop and 390 px layouts, 200% text, all public routes, serious/critical Axe findings, demo isolation, offline reload/update, privacy request boundaries, 404/cache policy, export, handoff, license, corrupt-media, and duplicate-folder behavior.

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
- `npm test`: 12 Vitest tests and 20 Playwright tests passed.
- TypeScript, formatting, both production bundles, 4 Rust tests, and both warnings-as-errors Clippy modes passed.
- The debug Tauri executable built and stayed alive for the 12-second Xvfb smoke test; only expected headless EGL/DRI3 warnings appeared.
- The production-only boundary installed 19 packages with 0 vulnerabilities and built both `dist/site` and `dist/app`; Vite remains a production dependency for this supported deployment path.
- Every one of the 16 commands in `.factory/claims.json` passed independently, including both Rust claims and all browser claims.
- Initial site JavaScript is 33.19 KB raw / 11.79 KB gzip plus a 2.48 KB core chunk; CSS is 15.83 KB raw / 4.28 KB gzip.
- Local Lighthouse 13.4.1 mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 2,053 ms, CLS 0, TBT 30 ms.
- The factory URL verifier found the title, `lang=en`, one `<h1>`, one `<main>`, no missing image alternatives, no unlabeled buttons, and no browser console errors.

Evidence:

- `.factory/repair-artifacts/lighthouse-repair-3-local.json`
- `.factory/repair-artifacts/verify-repair-3-local/verify.json`

## Known limits and operator action

- The Linux worker cannot directly exercise physical APFS, NTFS, or exFAT devices. Native storage-identity behavior retains Rust coverage and ships through the multi-platform release workflow.
- Browser APIs cannot identify physical drives; browser-mode results still explain that desktop confirmation is required before handoff.
- macOS and Windows packages are unsigned. Signing requires `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`.
- No analytics or third-party fonts are used. The only cold landing-page external request is GitHub's public release API; license verification is explicitly initiated and goes only to Sociobot.
