# Family Archive Check — repair 8 handoff

## Status: COMPLETE

Repaired from verifier report commit `522129a32fdd46ade00b99009cb1d43081ab9101` and candidate `74eae44f9fc9fbc110c49586951b2391f3ab2776`.

- Live site: <https://family-archive-check.sociobot.in>
- Public desktop release: <https://github.com/B-Divyesh/sf-family-archive-check/releases/tag/v0.1.11>
- Release source: `1ca3997ff9c6814b47343f522d056c8971fa4b6c`
- Final main repair commit before this handoff: `c3a4b2b57117bd8e0098b7d7c1f89de11a2dfd9f`
- Verified: 2026-08-30 UTC

## Finding repaired

F-10-1 was reproduced before changing the product. The old public v0.1.9 AppImage came from `2273b2432b546c95844d2ad99c371fc5b02e3829`. Its SHA-256 was `ca970aa8cde27e7559e209d328fe09fb93ebf095b952593de5989fc0a6bbafb6`, which matched its published checksum, but its extracted binary and launched UI did not contain **Import recovery file list**.

The root cause was release identity drift: the site accepted whatever GitHub called latest, while the release workflow did not bind a desktop binary to a tested source commit or required capability.

The repair:

- requires the exact current release tag (`v0.1.11`) before the site offers an installer;
- reads CORS-safe metadata from GitHub's public Releases API and uses a versioned one-hour cache;
- embeds the exact source commit, app version, and `recovery-file-import` capability in the native app;
- verifies the extracted AppImage contains that capability and source before publication;
- generates `SHA256SUMS` and `latest.json` only after every platform build succeeds;
- publishes macOS arm64/x64, Windows, and Linux assets from one immutable tag;
- keeps the release draft until source, capability, manifests, and checksums are ready;
- asserts draft metadata is resolved through the releases collection, because GitHub's tag endpoint returns 404 for drafts;
- includes regression coverage for the stale v0.1.9 browser cache, recovery UI/build inclusion, exact release source/capability, and draft publication path.

The researched brief, visual thesis, local-first behavior, demo sandbox, paid-license flow, and previously passing checks were preserved.

## Release evidence

GitHub release run `33301027801` passed: verify, Windows, Linux, macOS arm64, macOS x64, checksums, extracted-binary capability/source check, and published-metadata check.

The public v0.1.11 release targets exact commit `1ca3997ff9c6814b47343f522d056c8971fa4b6c` and contains 11 assets: `.dmg` for arm64/x64, `.app.tar.gz` for arm64/x64, `.msi`, `.exe`, `.AppImage`, `.deb`, `.rpm`, `SHA256SUMS`, and `latest.json`.

Independent download evidence:

- all nine installer/bundle entries passed `sha256sum -c SHA256SUMS`;
- downloaded AppImage SHA-256: `bdabd2af90b1b11b115694c6c5cd37002f6ec38a46f8baeedae8c28cc5d76e24`;
- extracted binary contains `recovery-file-import` and exact source `1ca3997ff9c6814b47343f522d056c8971fa4b6c`;
- launched downloaded AppImage visibly shows **Import recovery file list**, `Version 0.1.11`, and `Build 1ca3997f`;
- screenshot: `.factory/repair-artifacts/repair-8/released-v0.1.11-recovery-import.png` in the repair workspace;
- `latest.json` names v0.1.11, the exact source, capability, checksum URL, metadata API, and non-null platform URLs;
- GitHub's metadata response is HTTP 200 with `Access-Control-Allow-Origin: *`.

The v0.1.10 build attempt was never published. v0.1.11 is a fresh release; v0.1.9 was not changed or reused.

## Verification evidence

Local and CI:

- clean `npm ci`: 88 packages, zero vulnerabilities;
- all 33 exact `.factory/claims.json` commands passed before the immutable release bump; the complete post-bump suite also passed;
- `npm test`: 28 Vitest and 34 Playwright tests passed;
- typecheck, lint, production build, and production-only dependency install/build passed;
- `cargo test`: nine passed;
- core and desktop-feature Clippy passed with warnings denied;
- local Tauri debug build, AppImage bundle, extracted binary, and Xvfb launch passed;
- exact release quality run `33301026911` passed every job, including APFS, NTFS, exFAT, Windows helper, and production install/build;
- final-main quality run `33301501601` passed every job.

Live deployment:

- deployment ID: `21a7d5ec-4be6-4014-b876-ba03f4359f36`;
- `verify-url.sh`: HTTP 200, 895 ms, no console errors, correct title/lang, one h1, main present, no missing alt text, no unnamed buttons;
- desktop and 390 px mobile first-read, one-click demo, touch target, platform handling, release link, keyboard skip link, and main focus passed;
- Axe found zero serious or critical issues on all public routes and the designed 404 page;
- demo/reset traffic made zero off-origin requests; no analytics or trackers were observed;
- a fresh browser cached `family-archive-check-v5` and reloaded `/demo` offline;
- live `index.html`, service worker, JS, and CSS matched the deployed production build;
- CSP permits only self plus GitHub's API for release metadata; hashed assets return one-year immutable caching;
- `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, `/robots.txt`, `/sitemap.xml`, and `/404.html` returned 200; an unknown route returned the designed 404 with status 404;
- license verification requests 1–10 returned 200 for an invalid test token; request 11 returned 429 with `Retry-After`, limit 10, remaining 0, `no-store`, and CORS headers;
- live mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1,207 ms, CLS 0, TBT 0 ms;
- initial JS: 45,421 bytes raw / 15,454 bytes gzip; CSS: 16,440 bytes raw / 4,407 bytes gzip; mobile hero: 40,942 bytes.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --no-default-features --all-targets -- -D warnings
cargo clippy --manifest-path src-tauri/Cargo.toml --features desktop --all-targets -- -D warnings
CI=true npm run tauri -- build --debug --no-bundle
```

Demo: <https://family-archive-check.sociobot.in/?demo=1>.

## Known gaps and operator action

There are no known functional release blockers.

The macOS and Windows installers are intentionally unsigned. To add platform signing in a later release, an operator must provide `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` plus their associated passwords and platform account settings. Signing is not required for this unsigned release and no signing secret is present in the repository.

No prohibited or unrelated resource was read or changed. Deployment touched only the `sf-family-archive-check` static app and its product hostname; release work touched only this GitHub repository and its release assets.
