# Independent verification 5 — FAIL

**Candidate:** `7669f640edbd7c44f74f1b8da2319a4bcf34033c`  
**Live URL:** <https://family-archive-check.sociobot.in>  
**Verified:** 2026-08-29 (UTC)  
**Result:** **FAIL — release blocker remains**

## Release-blocking finding

### V5-1 — Critical: product-unlock verification has no observable rate limit

The product calls the Sociobot server-side license endpoint:

`GET https://api.sociobot.in/api/v1/products/family-archive-check/verify?license=<token>`

The product/repository documents no request allowance. From one client, I made 25 sequential requests using one invalid, non-secret QA token. All 25 returned `200` with `{"expires_at":null,"reason":"invalid","valid":false}`. None returned `429` and none included `Retry-After`.

The acceptance contract explicitly requires a documented allowance and, after a single client exceeds it, `429` plus `Retry-After` for every product server-side endpoint, including product-unlock calls. This is therefore a release blocker even though invalid-token handling itself is safe and the browser sends only the token.

## Required claims gate

`.factory/claims.json` exists and defines 24 commands. The first attempted claim command in the uninstalled clean checkout could not load `@playwright/test`; after the required lockfile installation (`npm ci`, 65 packages, 0 audit vulnerabilities), I re-ran every declared command serially from the demo entry point. All passed:

| Claims | Result |
|---|---|
| `demo-ready`, `file-list-export`, `handoff-sheet`, `local-only`, `offline-reload` | PASS |
| `compare-copies`, `media-readable`, `repeatable-sample`, `complete-file-count`, `common-media-codecs`, `independent-folders`, `free-limit`, `read-only`, `capture-year` | PASS |
| `paid-license`, `platform-download`, `demo-isolation`, `license-privacy`, `installer-checksum`, `payment-policy`, `free-exports`, `accessibility-not-gated`, `no-face-recognition`, `no-tracking` | PASS |

The clean serial e2e log is `/tmp/family-archive-e2e-clean.log` in this verification environment. The tests prove the one-click sample, JSON recovery export, printable handoff sheet, demo isolation, offline reload, paid 501-file flow, privacy, and accessible unlicensed path.

## Cold first read

PASS. A fresh live browser showed:

- **What:** “Check every family photo and video has a copy.”
- **For whom:** “For household archivists who need a clear answer before handing photos and videos to family.”
- **First action:** “Try it with sample data,” with “See a finished two-folder check.”

The action is visible in the first screen and opens the finished 6-main/5-copy sample in one click. It meets the plain-words and demo-sandbox gates.

## Build and native checks

- `npm ci`: PASS (65 packages; 0 vulnerabilities).
- `npm test`: PASS — 14 Vitest tests and 28 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS (TypeScript plus Rust formatting).
- `npm run build`: PASS; emitted `dist/site` and `dist/app`.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS — 8 tests.
- `cargo check --manifest-path src-tauri/Cargo.toml`: PASS.
- Both Clippy modes, including `--features desktop -- -D warnings`: PASS. The latter was run after installing the normal Linux Tauri GTK/WebKit build prerequisites in this disposable QA container.
- `CI=true npm run tauri build -- --no-bundle`: PASS; built `src-tauri/target/release/family_archive_check`.
- The built binary stayed alive under Xvfb for ten seconds (the expected timeout exit was 124). Headless portal/DRI warnings were environment-only and no application crash occurred.

The static first-load product JavaScript is 34,935 bytes raw / 12.28 KB gzip; CSS is 16,224 bytes raw / 4.36 KB gzip. Both are within the stated budgets.

## End-to-end and resilience checks

PASS:

- Live demo export downloaded `family-archive-file-list-2026-08-28.json` with check ID `sample-family-archive` and missing path `2024/01-New-year/fireworks.mp4`.
- The live print action reached `/print/sample-family-archive`, with the expected recovery heading and four steps.
- Offline reload after service-worker readiness rendered the demo attention result.
- Unit/native and browser tests cover normal matching folders, missing/changed/extra/unreadable paths, empty/truncated media, same-folder rejection, free 500/501 boundary and paid recovery, repeatable sampling, capture-year recovery, read-only scanning, and actual JPEG/PNG/HEIC/MP4/MOV fixtures.
- The GitHub `v0.1.7` Debian package downloaded and matched `SHA256SUMS`: `75d916f3aa8b95983ea685e8448646c8866fedc2483d4466109428ea3763a0fb`. Its package metadata is `family-archive-check` version `0.1.7`.

## Live deployment, privacy, accessibility, and headers

The deployed `assets/index-CwN_SHri.js` SHA-256 exactly matched the local candidate site build:

`dca8fbcb6273bcd1f52f28e4978b83cf39109252f57fbb22d0d924a010968a77`

Candidate `7669f64` contains documentation/evidence changes after the `v0.1.7` release target `86ca895`; product code is unchanged. The live site therefore matches the candidate product build.

- `/opt/fleet/lib/verify-url.sh` passed live: HTTP 200, title, `lang=en`, exactly one h1, main landmark, no missing image alt text, no unlabeled buttons, and no console errors.
- Direct live axe scans found zero serious/critical violations on `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, `/missing-stop`, and `/404.html`.
- Keyboard check passed: Tab starts at the skip link; navigation moves focus to the destination h1. At 390×844 there was zero horizontal overflow, the demo export was visible, reduced-motion media query was active, and the focused export button had a solid 4px `rgb(0, 63, 64)` outline.
- Cold live load had no console/page errors. The only outgoing request outside the product origin during demo use was the documented GitHub release metadata GET; no files/demo data, trackers, third-party scripts, or third-party fonts were sent. A no-token demo/export/print/offline flow had no console errors.
- Root headers include HSTS, `nosniff`, strict-origin referrer policy, restrictive CSP (`connect-src` only self, GitHub API and Sociobot API), and camera/microphone/geolocation disabled. Root is `no-cache`; hashed JS is `public, max-age=31536000, immutable`.
- Real routes returned 200 and the unknown `/missing-stop` correctly returned 404 with the designed not-found page. No sign-in exists, so Entra tenant verification is not applicable.

## Required remediation

Add and document a per-client allowance to the Sociobot product verification endpoint, enforce it with `429`, and send a valid `Retry-After` header. Add a claim/recorded integration test that exceeds the allowance from one client and asserts status/header. Re-run this verification after deployment.
