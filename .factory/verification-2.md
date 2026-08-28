# Independent verification 2 — FAIL

## Scope and verdict

- Tested commit: `a2a14da843e2d2ec09542f8f3371c0d4ddcfe55c`.
- Tested URL: `https://family-archive-check.sociobot.in`.
- Date: 2026-08-28 UTC.
- Verdict: **FAIL**. The product has one high-severity keyboard-accessibility defect that violates the required keyboard and skip-link behavior. All other checks below passed.

## First-read test (cold live page)

The first screen plainly says: “Check every family photo has a copy.” It identifies the audience as household archivists preparing to hand photos and videos to family, and its first action is **Try it with sample data**, with the immediate outcome “See a finished two-folder check.” The three facts are also visible: files stay on device, offline after first visit, and free for 500 files/$29 once. This meets the plain-words and one-click demo requirements.

## Release-blocking defect

### High — cold-load Tab order skips the skip link and header navigation

`src/main.ts` focuses the route `<h1>` on every render, including the initial document load. On a fresh live landing page, focus begins on `H1 “Check every family photo has a copy”`; pressing Tab then traverses the primary content actions and footer. It never reaches, in forward Tab order, **Skip to main content**, the wordmark, Demo, Check folders, or Privacy. Those controls are only reachable by reversing with Shift+Tab.

This fails the accessibility acceptance contract: every interactive control must be reachable with Tab, and a skip link must be usable. Moving focus to the new `<h1>` is appropriate for client-side route changes, but must not run on the first load. Axe cannot detect this traversal defect; its serious/critical result is otherwise clean.

Reproduction on live:

```text
fresh GET / -> active element: H1 “Check every family photo has a copy”
Tab -> “Try it with sample data”
Tab -> “Open this sample check”
… (header/skip link omitted from forward order)
```

## Required claim tests — all pass

Ran from the clean checkout after `npm ci`, using exactly every command in `.factory/claims.json`:

| Claim | Result |
| --- | --- |
| `demo-ready` | pass |
| `manifest-export` | pass |
| `handoff-sheet` | pass |
| `local-only` | pass |
| `offline-reload` | pass |
| `compare-copies` | pass |
| `media-readable` | pass |
| `independent-folders` | pass |
| `free-limit` | pass |
| `read-only` | pass |
| `capture-year` | pass |
| `paid-license` | pass |
| `platform-download` | pass |
| `demo-isolation` | pass |
| `license-privacy` | pass |
| `installer-checksum` | pass |

The initially cold Rust compilation exceeded the command capture window; both prescribed Rust claim commands were rerun after compilation and each passed (`1 passed, 0 failed`).

## Local build and test evidence

```text
npm ci                                      PASS (65 packages; 0 vulnerabilities)
npm test                                    PASS (12 Vitest + 19 Playwright)
npm run typecheck                           PASS
npm run lint                                PASS
npm run build                               PASS; dist/site and dist/app created
cargo test --manifest-path src-tauri/Cargo.toml  PASS (4 tests)
cargo clippy --all-targets -- -D warnings   PASS
cargo clippy --features desktop --all-targets -- -D warnings  PASS
CI=true npm run tauri -- build --debug --no-bundle  PASS
```

The exact reported deployment boundary was independently reproduced after a fresh production-only install:

```text
npm ci --omit=dev   PASS (19 packages; 0 vulnerabilities)
npm run build       PASS (both deploy and desktop frontends)
```

The native debug binary was built and remained alive for 12 seconds under Xvfb without a crash. The expected headless EGL/DRI3 warnings were the only output. APFS, NTFS, and exFAT mounts were not available in this Linux QA container; native scanner behavior is covered by the passing Rust tests and release workflow, but physical filesystem-specific behavior was not directly exercised here.

Build budgets: initial site JavaScript is 33.10 KB raw / 11.77 KB gzip plus 2.48 KB raw / 1.01 KB gzip core; CSS is 15.83 KB raw / 4.28 KB gzip. Both are well within the stated static budgets.

## Live verification

- Deployment matches the candidate build: live `/assets/index-BcZkMZ2r.js` SHA-256 equals local `dist/site` SHA-256, `1de4aa68062c2df0dd3f30426dae13944181994068b77a7251ce85c297594d8f`. Live `/sw.js` equals local source, `bb8bbdc48f2f73d6ac630de4eb00cd792a1b94b0d0f808e47b72b626507652e0`.
- Live `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and `/404.html` have one `<h1>`, one `<main>`, correct route title, and no console/page errors. `/missing-stop` correctly returns HTTP 404; the browser records its expected failed-resource message for that document response.
- Desktop 1440×900 and mobile 390×844 demo flows: no horizontal overflow, no console/page errors, no Axe serious/critical findings. The mobile and desktop layouts show the result and export/print controls correctly.
- Demo end to end: `/demo` showed six main items versus five copy items; exported JSON manifest had `checkId: sample-family-archive` and missing `2024/01-New-year/fireworks.mp4`; Print handoff opened `/print/sample-family-archive`; Start for real opened a blank `Check two archive folders` state.
- Invalid/recovery and boundary coverage passed in the 19 browser tests and 12 unit tests: corrupt sampled JPEG/PNG media is reported unreadable, duplicate folder selection is blocked, and 500/501 free-limit boundaries are tested.
- Privacy: a fresh live demo flow (load, reset, export, leave demo) made only same-origin product requests. The cold landing additionally requests `api.github.com` only to obtain public release metadata, exactly as disclosed on `/privacy`; no analytics/tracker or third-party font request was observed. License verification is a GET carrying only the encoded token, as claim-tested.
- Headers: HTTPS responses include CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and restrictive Permissions Policy. Hashed assets are `public, max-age=31536000, immutable`; `/sw.js` is `no-cache`.
- PWA: after service-worker activation, a deliberately stale cached landing document was replaced online, then the current page reloaded offline with the correct h1 and no console errors.
- Rate limiting: `GET /api/v1/products/family-archive-check/verify` accepted 30 sequential invalid-token requests from one client; request 31 returned HTTP `429` with `Retry-After: 4`. No `RateLimit-*` headers were sent. Observed allowance: 30 requests in the active window.
- Release: downloaded `Family.Archive.Check-0.1.3-1.x86_64.rpm`; SHA-256 was `783261e2ed20431786a1df8065a3942c78f7ce2d4c5854ea54e151ae11f3bdce`, matching `SHA256SUMS`. `latest.json` lists macOS arm64/x64, Windows MSI, Linux AppImage, and Linux DEB assets.

## Required remediation and retest

1. Do not focus the `<h1>` on initial document load. Preserve focus movement to the `<h1>` and route announcement for actual SPA navigation/back-forward changes.
2. Add a regression test that opens a fresh route, presses Tab, and verifies the skip link is first and header controls remain in forward tab order.
3. Rerun this verification after deployment. No other defect requires a product change from this review.
