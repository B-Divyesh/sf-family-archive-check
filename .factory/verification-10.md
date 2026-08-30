# Independent verification 10 — Family Archive Check

## Verdict: FAIL

Tested candidate: `74eae44f9fc9fbc110c49586951b2391f3ab2776`

Tested URL: <https://family-archive-check.sociobot.in>

Test date: 2026-08-30 UTC

The candidate's web deployment, source tests, and locally built desktop app pass the acceptance checks. The product still fails release acceptance because the desktop download advertised by the live site is v0.1.9, built from older commit `2273b2432b546c95844d2ad99c371fc5b02e3829`. It is not the candidate and does not contain the recovery-file import workflow present in the candidate.

## Release-blocking finding

### F-10-1 — High — The downloadable desktop app is stale

- The live Linux button resolves to `Family.Archive.Check_0.1.9_amd64.AppImage` in GitHub release v0.1.9.
- Tag `v0.1.9` resolves to commit `2273b2432b546c95844d2ad99c371fc5b02e3829`, not candidate `74eae44f9fc9fbc110c49586951b2391f3ab2776`.
- The release workflow run for v0.1.9 also records head SHA `2273b2432b546c95844d2ad99c371fc5b02e3829`.
- The downloaded AppImage checksum is `ca970aa8cde27e7559e209d328fe09fb93ebf095b952593de5989fc0a6bbafb6` and matches the release's `SHA256SUMS`, so this is a provenance/version problem rather than a corrupt download.
- The extracted AppImage launched successfully under Xvfb. Its UI goes from folder selection directly to the household-license section and has no **Import recovery file list** control.
- The candidate's locally built Tauri app launched successfully and includes **Check a restored folder** and **Import recovery file list**. The candidate README and passing `recovery-import` claims also promise that capability.

Impact: a visitor cannot download the candidate being accepted, and the shipped desktop product lacks a documented recovery workflow. This violates the desktop installer contract and prevents an end-to-end handoff of candidate 74eae44.

Required fix: publish a new immutable version tag from the candidate or a tested descendant, let the release matrix build all platform assets, update the landing release metadata, and verify the new binary's checksum, build identity, and recovery-import UI. Do not retarget or reuse v0.1.9.

No other release-blocking defect was found.

## Mandatory claims — 32/32 passed

`.factory/claims.json` was present. Before other QA, `npm ci` was run and every listed command was executed separately against the product demo entry point. All passed.

| Claim | Result |
|---|---|
| `demo-ready` | PASS |
| `file-list-export` | PASS |
| `handoff-sheet` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |
| `compare-copies` | PASS |
| `media-readable` | PASS |
| `repeatable-sample` | PASS |
| `media-sample-count` | PASS |
| `complete-file-count` | PASS |
| `common-media-codecs` | PASS |
| `filesystem-matrix` | PASS |
| `independent-folders` | PASS |
| `free-limit` | PASS |
| `read-only` | PASS |
| `capture-year` | PASS |
| `paid-license` | PASS |
| `platform-download` | PASS |
| `demo-isolation` | PASS |
| `license-privacy` | PASS |
| `license-rate-limit` | PASS |
| `installer-checksum` | PASS |
| `payment-policy` | PASS |
| `free-exports` | PASS |
| `accessibility-not-gated` | PASS |
| `no-face-recognition` | PASS |
| `no-tracking` | PASS |
| `release-tag-trigger` | PASS |
| `release-platform-builds` | PASS |
| `release-attachments` | PASS |
| `recovery-import` | PASS |
| `recovery-import-private` | PASS |

Aggregate claim log: `/tmp/family-archive-claims-74eae44.log` in the disposable verification worker.

## First-read and demo

PASS. A cold 1440×900 visit shows, above the fold:

- What: “Check every family photo and video has a copy.”
- For whom: “For household archivists who need a clear answer before handing photos and videos to family.”
- What to click: **Try it with sample data**, next to “See a finished two-folder check.”

The same action is visible at 390×844. One click loads a populated two-folder result and a persistent “Demo — sample data, nothing is saved” banner with reset and start-for-real actions.

## Clean checkout gates

All commands ran from the clean candidate checkout:

- `npm ci`: PASS; 88 packages, zero reported vulnerabilities.
- `npm test`: PASS; 27 Vitest and 33 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; produced `dist/site` and `dist/app`.
- `npm ci --omit=dev && npm run build`: PASS; production-only install also builds.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS; eight tests.
- Core and desktop-feature `cargo clippy ... -D warnings`: PASS.
- `CI=true npm run tauri -- build --debug --no-bundle`: PASS after installing the documented Linux WebKit build packages.
- The resulting candidate desktop binary stayed running under Xvfb until the smoke-test timeout and showed the expected recovery-import UI.
- GitHub candidate quality run `33297191282`: PASS, including production build, Windows installer helper, and NTFS/APFS/exFAT storage and codec jobs.

## End-to-end behavior

The live `/check` flow was exercised with browser-selected temporary folders:

- matching files: reported a match while clearly warning that same-device folders do not prove drive separation;
- missing, changed, and backup-only files: all classified correctly;
- corrupt three-byte JPEG copies: reported unreadable media and did not count them ready;
- selecting the same folder twice: blocked with a clear alert;
- malformed JSON and wrong-schema recovery files: rejected with actionable errors;
- exported demo recovery file: imported successfully and checked against a restored folder;
- 500 files per folder: completed in the free tier;
- 501 files: stopped with the documented license message and no misleading result.

The demo JSON export had the expected check ID and missing file. The printable handoff route rendered its four recovery steps. Empty and error states allowed recovery. No console or page error occurred during these flows.

## Accessibility and responsive QA

Desktop 1440×900 and mobile 390×844 checks covered `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and `/404.html`.

- One `<h1>`, one `<main>`, valid titles, and image alternatives on every route.
- Axe: zero serious or critical findings on every tested route and viewport.
- Keyboard order begins with the skip link; primary actions work with Enter; no trap found.
- Focus treatment is a visible 4 px outline with adequate contrast.
- Visible mobile controls meet the 44 px target minimum.
- At 200% text size on a 390 px viewport, controls remained available and no horizontal overflow appeared.
- `prefers-reduced-motion` reduced transitions and animations to effectively instant values.

## Privacy, requests, headers, and rate limiting

- The complete demo, check, recovery import, and export flows made no off-origin request.
- The landing page's only off-origin request was the documented GitHub release API lookup. No tracker, analytics host, CDN font, or external script loaded.
- License verification sent a token only to `api.sociobot.in`; it did not persist the rejected token or verdict.
- Requests 1–10 to the license verification endpoint returned 200. Request 11 returned 429 with `Retry-After: 595`, `X-RateLimit-Limit: 10`, and remaining allowance 0. The observed allowance is 10 requests per client window.
- The UI handled the throttled response with a retry-in-seconds message.
- Concurrent limiter behavior is also covered by a passing repository test: ten accepted requests and eight throttled requests across independent limiter instances.
- There is no sign-in flow, so Entra authority verification is not applicable.

Live responses include HSTS, CSP with `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and restrictive permissions policy. Root and service worker responses use no-cache; hashed JS, CSS, and image assets use one-year immutable caching. Unknown routes return the designed 404.

## Offline, performance, and deployment identity

- Service-worker update and offline reload: PASS; the demo result and banner reload offline from cache `family-archive-check-v3`.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.0 s, LCP 1.3 s, TBT 140 ms, CLS 0, transfer 60 KiB.
- Initial site bundle: about 44,920 bytes JS raw / 15.2 KiB gzip; 16,440 bytes CSS raw / 4.4 KiB gzip; mobile hero 40,942 bytes. All stated budgets pass.
- Local candidate and live hashes match for `index.html`, the main hashed JavaScript, CSS, and service worker. The live web deployment therefore matches candidate 74eae44.
- All crawled internal links returned 200; an unknown route returned 404.
- Release v0.1.9 has checksummed assets and valid `latest.json` entries for macOS arm64/x64, Windows, and Linux. Those assets are internally valid but were built from the older SHA described in F-10-1.

## Acceptance summary

The browser deployment is polished, private by default, accessible, responsive, offline-capable, and functionally consistent with the candidate. Acceptance is nevertheless **FAIL** because the installable desktop artifact—the product class users actually download—does not match the candidate and omits a candidate feature.
