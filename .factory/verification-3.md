# Independent verification 3 — PASS

## Scope and verdict

- Tested commit: `ad9b0ec69b42ddf1de78e571a3e7efbbd807b2c0` (`docs: record repaired release evidence`).
- Tested URL: `https://family-archive-check.sociobot.in`.
- Date: 2026-08-29 UTC.
- Verdict: **PASS**. No release-blocking product defect was found. The live deployment is the candidate build.

## First-read test

I opened the live root in a fresh browser context at 1440×900. It says, in plain words, **“Check every family photo has a copy.”** It says this is for household archivists who need an answer before handing photos and videos to family. The first action is the visible **“Try it with sample data”** link, immediately explained as **“See a finished two-folder check.”** The same first screen gives the three required facts: files stay on the device, offline works after the first visit, and the free/paid price boundary.

That action opened `/demo` in one click. The completed sample shows six main items, five in the independent copy, and the missing path `2024/01-New-year/fireworks.mp4`. Its persistent banner says **“Demo — sample data, nothing is saved”** and provides Reset demo and Start for real. This satisfies the plain-words and sandbox requirements.

## Required claims — all pass

From this clean checkout, after `npm ci` (65 packages, 0 reported vulnerabilities), I ran every command in `.factory/claims.json` exactly. Each passed against the shipped local demo entry point.

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

## Local quality gates

| Check | Evidence |
| --- | --- |
| Full test suite | `npm test` passed: 13 Vitest tests and 20 Playwright tests; Playwright `test-results/.last-run.json` reports `passed`. |
| Type/lint | `npm run typecheck` and `npm run lint` passed. |
| Production build | `npm run build` passed and produced both `dist/site` and `dist/app`. |
| Native core tests | `cargo test --manifest-path src-tauri/Cargo.toml` passed: 4 tests. |
| Rust lint | `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` passed. |
| Browser coverage | The passing suite covers valid demo export/print, corrupt media, same-folder rejection, free 500/501 boundary, license recovery, offline reload/update, keyboard order, 200% text, 390px layout, route errors, 404 and cache policy. |

Production site assets are small: initial JavaScript is 33,186 B plus 2,483 B and 1,300 B chunks (36,969 B total raw; main gzip 11.80 KB), and CSS is 15,833 B raw / 4.28 KB gzip. This is within the static budget.

The optional Linux desktop Tauri build/check with the `desktop` feature could not be completed in this container because the host lacks the documented GTK/GLib development prerequisite (`glib-2.0.pc`). This is a QA-environment limitation, not a source failure: the standard native core tests passed, the published Linux installer was independently checksum-verified, and the repository README explicitly declares Tauri system dependencies. No product code was changed to work around it.

## Live functional, accessibility, and privacy checks

- Fresh `/demo` end to end passed: Reset demo, Export recovery manifest (download `family-archive-manifest-2026-08-28.json`), and Start for real led to a blank `/check` state headed “Check two archive folders.”
- A fresh `/demo` flow made only same-origin requests: the HTML, `index-BNHlxbJF.js`, and `index-CuQQtMBE.css`. It made no archive-data, analytics, tracker, font-CDN, or other third-party request. The root page additionally makes the declared GitHub API release-metadata request; it sends no archive data.
- A fresh service-worker activation followed by an offline reload of `/demo` retained the sample attention result and demo banner with no console or page error.
- At 390×844, all tested public routes had zero horizontal overflow. At 1440×900 the purpose, audience, and sample action are visible on the first screen.
- Axe on live `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and `/404.html` found zero serious or critical violations. Each had exactly one `<h1>` and one `<main>`, route-specific titles, and no console/page errors.
- Cold keyboard testing starts with the visible “Skip to main content” link, then reaches wordmark, Demo, Check folders, and Privacy in forward Tab order. This confirms the prior release-blocking keyboard defect is repaired. Reduced-motion mobile rendering also showed no overflow or errors.
- No sign-in is present; the Microsoft Entra requirement is therefore not applicable.

## Deployment, headers, release, and limits

- Candidate parity: local `dist/site/assets/index-BNHlxbJF.js` SHA-256 and live asset SHA-256 are both `5486a06aebaabe1a1e889dd207d03780e0eaf4ee6c46ec82fb57d71115b73688`. Local `public/sw.js` and live `/sw.js` are both `bb8bbdc48f2f73d6ac630de4eb00cd792a1b94b0d0f808e47b72b626507652e0`.
- Live `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and `/404.html` returned 200. `/missing-stop` returned 404.
- Responses send HTTPS/HSTS, CSP including `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive Permissions Policy. Hashed JS/CSS are `public, max-age=31536000, immutable`; `/sw.js` is `no-cache`.
- The `v0.1.5` release metadata lists macOS arm64/x64, Windows MSI, and Linux AppImage/DEB targets, plus checksums. Downloaded `Family.Archive.Check-0.1.5-1.x86_64.rpm` SHA-256 was `a9fb8e98c8ff636f030cfd38d401b201deebd3d3c67f922c1362222283c88054`, exactly matching `SHA256SUMS`. `latest.json` is valid and points at the same v0.1.5 assets.
- Product license verification is rate-limited. In a fresh sequential invalid-token burst, requests 1–30 returned 200 and request 31 returned 429. A subsequent throttled response included `retry-after: 0` and `x-ratelimit-after: 0`. Observed allowance: 30 requests in the active window. The API therefore enforces the required 429/Retry-After behavior.

## Defects

None found. The only unexecuted desktop-feature compilation depends on absent host GTK/GLib development packages, as noted above; it is not a defect in the candidate or deployed artifact.
