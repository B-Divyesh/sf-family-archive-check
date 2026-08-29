# Independent product verification 6 — FAIL

## Scope and verdict

- Candidate: `b263f57f78bd8cbfb57a5b94c93edaa7fd586585`
- Live URL: <https://family-archive-check.sociobot.in>
- Verified: 2026-08-29 UTC
- Artifact: Tauri 2 desktop app with a hosted browser fallback and one managed license-verification endpoint
- Verdict: **FAIL — release blocked.** The core archive-check product, deployment, installers, accessibility, and all 25 declared claim commands pass. The live license endpoint does not enforce its documented 10-request allowance across serverless instances, and one relied-on filesystem claim is absent from the claims manifest.

No product code was modified during this verification.

## Release-blocking findings

### Critical — V6-1: the live 10-per-10-minute license limit is process-local, not client-wide

The privacy page and README promise: **“It allows 10 checks per client address in 10 minutes.”** The required behavior is that request 11 from one client returns `429` with `Retry-After`.

Fresh live evidence contradicts that promise:

1. From the same QA container and public client address, 12 sequential requests to `GET /api/license/verify?license=qa-invalid-b263f57` opened ordinary independent HTTP connections.
2. All 12 returned HTTP `200` with `{"valid":false,"reason":"invalid","expires_at":null}`.
3. Each response reported `X-RateLimit-Limit: 10`, but `X-RateLimit-Remaining` remained at `9` instead of counting down.
4. Repeating the sequence with a cookie jar did not help: the first 11 responses were still `200`; remaining stayed at `8` and later reset to `9`. No affinity cookie was issued.

The implementation explains the result. `api/src/license-verification.js` stores buckets in a module-level JavaScript `Map`. Each Azure Functions process therefore owns an independent bucket, and the next request can land on another process. This is not a client-wide limit and has no durable or shared persistence boundary.

A single persistent browser connection eventually reached one warm process's bucket: six additional requests returned `200`, followed by `429` responses with `Retry-After: 268`. This proves the local counter works inside one process, but it does not repair the connection-independent bypass above. A later response also exposed conflicting retry data (`Retry-After: 0` while the JSON body said `retry_after_seconds: 573`) when the upstream Sociobot limit fired.

The endpoint also trusts the first user-supplied `X-Forwarded-For` value. Requests with `X-Forwarded-For: 198.51.100.41` and `.42` each started a fresh bucket at remaining `9`, so a caller can choose a new identity without changing clients.

Observed effective allowance: **at least 12 accepted requests from one client in the documented 10-minute window**; no reliable product-wide ceiling was observed. The intended per-process allowance is 10. This fails the explicit server-endpoint acceptance gate and leaves the paid verification proxy open to trivial rate-limit bypass.

Required remediation: use a shared atomic rate-limit store or an edge/platform rate-limit facility, derive the client identity only from a trusted platform header, return one consistent positive `Retry-After`, then prove requests 1–10 are accepted and request 11 is rejected across separate connections and concurrent requests.

### Major — V6-2: an APFS/NTFS/exFAT claim is missing from `.factory/claims.json`

README states: **“CI also scans those fixtures on APFS, NTFS, and exFAT volumes.”** No claim entry states this filesystem matrix or points to the three mounted-volume checks. The candidate's GitHub run does provide good evidence—all three matrix jobs passed—but the claims contract requires every relied-on README claim to be listed with its sandbox test.

Required remediation: add one filesystem-matrix claim whose test checks the published candidate CI jobs or otherwise runs the platform-specific mounted-volume assertions. Do not weaken the README compatibility statement merely to avoid registering it.

## Mandatory first-read and demo gate — PASS

A cold 1440×900 live visit answers all three required questions in the first viewport:

- What: **“Check every family photo and video has a copy.”**
- For whom: **“For household archivists who need a clear answer before handing photos and videos to family.”**
- First click: **“Try it with sample data,”** explained by **“See a finished two-folder check.”**

The audience, action, and all three private/offline/price facts ended by y=735 in a 900px-high viewport. At 390×844, the action ended at y=468 and the facts at y=672. The one-click action opened `/?demo=1`, immediately showing six main files, five copy files, the missing `2024/01-New-year/fireworks.mp4`, and the persistent **“Demo — sample data, nothing is saved”** banner with Reset demo and Start for real.

## Required claims gate — all 25 commands PASS

The checkout began clean at the exact candidate. `.factory/claims.json` exists. After the required lockfile install (`npm ci`: 65 packages, 0 vulnerabilities), every listed command was run separately and exactly as declared. Summary: `total=25 failed=0`.

| Claim | Result |
| --- | --- |
| `demo-ready` | PASS |
| `file-list-export` | PASS |
| `handoff-sheet` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |
| `compare-copies` | PASS |
| `media-readable` | PASS |
| `repeatable-sample` | PASS |
| `complete-file-count` | PASS |
| `common-media-codecs` | PASS |
| `independent-folders` | PASS |
| `free-limit` | PASS |
| `read-only` | PASS |
| `capture-year` | PASS |
| `paid-license` | PASS |
| `platform-download` | PASS |
| `demo-isolation` | PASS |
| `license-privacy` | PASS |
| `license-rate-limit` | PASS locally, but contradicted by live V6-1 |
| `installer-checksum` | PASS |
| `payment-policy` | PASS |
| `free-exports` | PASS |
| `accessibility-not-gated` | PASS |
| `no-face-recognition` | PASS |
| `no-tracking` | PASS |

The local `license-rate-limit` test correctly exercises one `PerClientRateLimiter` instance. It does not model process replacement or multiple serverless instances, which is why it misses V6-1.

## Local install, tests, and builds

| Gate | Fresh result |
| --- | --- |
| `npm ci` | PASS; 65 packages, 0 audit vulnerabilities |
| `npm test` | PASS; 18 Vitest tests and 29 Playwright tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS; TypeScript plus Rust formatting |
| `npm run build` | PASS; `dist/site/` and `dist/app/` produced |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS; 8 tests |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| core Clippy with `-D warnings` | PASS |
| desktop-feature Clippy with `-D warnings` | PASS after installing the workflow's GTK/WebKit prerequisites |
| `CI=true npm run tauri -- build --no-bundle` | PASS; optimized native binary built |
| native binary Xvfb smoke | PASS; stayed running for 12 seconds, terminated only by the test timeout |

The current candidate's GitHub quality run `33277429856` also passed `full-suite`, production-only install/build, Windows installer-helper, and the APFS, NTFS, and exFAT storage/codec jobs.

## Independent end-to-end product exercise

- Matching folders containing a valid JPEG and text file produced **“Files match; drive separation is unverified”**, one compared fingerprint, 100% known-year coverage, and no differences. This is the correct cautious browser result because a browser cannot prove physical drive separation.
- Selecting the exact same folder twice produced **“The same folder was chosen twice”** and disabled Check both folders.
- An attention case correctly listed one missing MP4, one changed text file, and one file found only on the copy.
- Matching malformed JPEGs produced **“One archive item needs attention”**, zero compared fingerprints, one unreadable entry, and the path `corrupt.jpg`.
- The sample export downloaded `family-archive-file-list-2026-08-28.json`; it contained check ID `sample-family-archive` and the expected missing video.
- The handoff action opened `/print/sample-family-archive`, retained the demo banner, and displayed four recovery steps.
- Reset demo restored the fixture. Start for real discarded sample state, opened `/check`, and left Check both folders disabled until two folders are chosen.
- The full suite independently covers 500/501 free-limit boundaries, paid recovery, malformed data, saved-profile reuse, cancellation/recovery paths, and singular result copy.
- An invalid live license request was one GET to the same-origin product proxy, with the token as the only query value and no body. The UI displayed a recoverable “license is not active” message.

## Privacy, offline behavior, and network requests

- A cold landing requested only the same-origin document, hashed JavaScript/CSS, the original hero image, and GitHub's public releases API.
- Demo reset, JSON export, print, Start for real, and all real browser-folder scans sent no archive paths, bytes, hashes, or other file data off origin.
- No analytics, tracker, third-party script, third-party stylesheet, font CDN, raw Azure endpoint, or sign-in request appeared. There is no sign-in, so the Entra tenant requirement is not applicable.
- After service-worker activation, a deliberately stale cached `/demo` document was replaced online. The current demo then reloaded offline with its result, banner, and version intact and no console/page error. Active cache: `family-archive-check-v3`.
- `/api/` is bypassed by the service worker and license responses use `Cache-Control: no-store`.

## Accessibility, responsive behavior, and errors

- `/opt/fleet/lib/verify-url.sh` passed live: HTTP 200, title, `lang=en`, one h1, main landmark, image alt text, labeled buttons, and no console errors.
- Independent Axe scans at 1440×900 and 390×844 found zero serious or critical violations on `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, the designed 404, and `/404.html`.
- Cold Tab order starts with the visible Skip to main content link, then wordmark, Demo, Check folders, and Privacy. Focus outlines are solid 4px and contrast correctly on both paper and ink surfaces. Hidden directory inputs are labeled and removed from Tab order.
- All mobile user-facing controls met 44px touch sizing. Every tested route had zero horizontal overflow. The check screen remained usable at 200% text size.
- With reduced motion requested, no rendered element retained a transition or animation over 1ms.
- Normal routes had no console or page errors. Directly navigating to the deliberate `/missing-stop` test returns HTTP 404 and produces only Chromium's expected failed-document console message.
- All discovered internal links, the Sociobot home link, checkout link, and live platform asset resolved successfully. The checkout redirected to Dodo and identified Dodo as Merchant of Record handling order inquiries and returns.

## Deployment identity, headers, caching, and performance

- Live HTML exactly matches local `dist/site/index.html`: SHA-256 `f9df50d9d7bb070d89415ad0b944b19c50fa304b2d773bf1e7e4a712767b4e11`.
- Live/local main JavaScript match: `345c8bdb2880bce2c405a0e05243e5ae08435d46f4cc5960d8ff5e714b74fa3b`.
- Live/local CSS match: `5c74fb61c434220c680779776a3149daa23a1236cc1a045f2af2c6e404fdffba`.
- Live/local service worker match: `852fa1c81e7914761d08576192b7f5427875c3746c32c22e5f028677c5a3bf3a`.
- Candidate changes after release tag target `b4d011a85c3bdbe9a38eb16ad77dbf9b6c4536b5` affect only `.factory/handoff.md`; product code is identical to v0.1.8.
- Root headers include HSTS, `nosniff`, strict-origin referrer policy, restrictive camera/microphone/geolocation policy, and CSP with `frame-ancestors 'none'`. Hashed JS/CSS use one-year immutable caching; HTML and the service worker use `no-cache`; unknown routes return a real 404.
- Emitted site assets: 39,159 bytes total JavaScript raw, 16,224 bytes CSS raw, no fonts, 40,942-byte mobile hero, and 92,116-byte desktop hero. All budgets pass.
- Fresh Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,751ms, CLS 0, total blocking time 30ms, speed index 905ms, total transfer 63,302 bytes.

## Release and installer evidence

- GitHub release v0.1.8 has 11 assets: macOS arm64/x64 DMGs and app archives, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`.
- `latest.json` is valid and provides all five required platform URLs.
- Downloaded `Family.Archive.Check_0.1.8_amd64.deb` matched `SHA256SUMS`; SHA-256: `21d49997d21db6b85c37b75dad97b0c197ebe6c749dc44f6720dac7ee34416ed`. Its metadata reports package/version `family-archive-check 0.1.8`; its extracted binary stayed running for 12 seconds under Xvfb.
- Live `install.sh` and `install.ps1` exactly match the candidate. Running the shell helper against the live release downloaded the 81,598,968-byte AppImage, verified SHA-256 `c9d1e264da6d3e98cc2b2a9447c017cd37e0b10bac0490fcced047680635c6b5`, and saved it only after verification.
- Candidate quality workflow and v0.1.8 release workflow both completed successfully.

## Retest required

1. Replace the process-local limiter and untrusted client-address parsing as described in V6-1.
2. Add the filesystem matrix statement to `.factory/claims.json` with a meaningful automated test.
3. Deploy the API repair and repeat the rate-limit test over separate connections, a persistent browser connection, and concurrent requests. The same client's first 10 may pass; request 11 must return `429` with one consistent positive `Retry-After`.
