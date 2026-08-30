# Independent product verification 8 — PASS

## Verdict

**PASS — candidate `c13c9a6f937fd4d576d90ca6d033603a292806be` is accepted.**

- Live URL: <https://family-archive-check.sociobot.in>
- Verified: 2026-08-30 UTC
- Artifact: Tauri 2 desktop app with a hosted browser demo and one license-verification endpoint
- Product code changes during verification: none

The candidate performs the researched recovery-readiness job, the live deployment matches the candidate product, all mandatory claims pass, and every release-blocking gate passes. The earlier verification 7 test-timeout failure is repaired. One low-severity count-wording inconsistency is documented below; it does not hide any discrepancy or change the pass/fail result.

## Mandatory first-read and demo gate — PASS

A cold live visit answers all three questions in the first viewport:

- **What:** “Check every family photo and video has a copy.”
- **For whom:** “For household archivists who need a clear answer before handing photos and videos to family.”
- **First action:** “Try it with sample data,” beside “See a finished two-folder check.”

At 1440×900, the action occupies y=560–604. At 390×844, it occupies y=424–468. The one-click action opens `?demo=1`, shows six main files versus five copy files, names `2024/01-New-year/fireworks.mp4`, and keeps the “Demo — sample data, nothing is saved” banner visible with **Reset demo** and **Start for real**.

Cold interpretation: this checks whether a household’s family photos and videos have an independent copy before a family handoff. A household archivist should click **Try it with sample data** first.

## Mandatory claims gate — PASS

`.factory/claims.json` is present with 26 entries. After `npm ci` in the clean candidate checkout, every `test` field was run exactly and independently before the general suite. All returned exit 0:

`demo-ready`, `file-list-export`, `handoff-sheet`, `local-only`, `offline-reload`, `compare-copies`, `media-readable`, `repeatable-sample`, `complete-file-count`, `common-media-codecs`, `filesystem-matrix`, `independent-folders`, `free-limit`, `read-only`, `capture-year`, `paid-license`, `platform-download`, `demo-isolation`, `license-privacy`, `license-rate-limit`, `installer-checksum`, `payment-policy`, `free-exports`, `accessibility-not-gated`, `no-face-recognition`, and `no-tracking`.

The landing page, app, legal pages, demo guide, and README were cross-checked against the manifest. No unlisted relied-on product claim was found.

## Clean local quality gates — PASS

| Gate | Fresh result |
| --- | --- |
| `npm ci` | PASS; 88 packages, zero audit vulnerabilities |
| All 26 exact claim commands | PASS |
| `npm test` | PASS; 23 Vitest and 29 Playwright tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS; TypeScript and Rust format checks |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS; 8 tests |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| Default and desktop-feature Clippy with `-D warnings` | PASS |
| `npm run build` | PASS; produced `dist/site` and `dist/app` |
| `npm ci --omit=dev && npm run build` | PASS; both configured outputs present |
| `CI=true npm run tauri -- build --no-bundle` | PASS; optimized release binary built |
| Release-binary smoke under Xvfb | PASS; remained running for the 12-second window |

The first desktop-feature Clippy attempt correctly identified missing host GTK/WebKit development libraries. After installing the exact packages declared in `.github/workflows/quality.yml`, the check passed. This was a disposable-host prerequisite, not a product failure.

GitHub quality run [33284394545](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33284394545) also passed for the exact candidate, including the cross-platform storage/codec jobs and Windows installer-helper job.

## End-to-end product evidence — PASS

- Sample export downloaded `family-archive-file-list-2026-08-28.json`; its declared claim test parsed the sample check ID and missing MP4.
- The handoff action opened `/print/sample-family-archive`, with one main landmark and four concrete recovery steps.
- A live browser check containing one match, one missing MP4, one changed file, and one copy-only file reported and named all three discrepancy types.
- Matching malformed JPEGs produced an attention result and one unreadable entry; no **Ready for handoff** result appeared.
- Selecting the same folder twice produced a specific alert, disabled **Check both folders**, and recovered after a different copy folder was selected.
- Exactly 500 matching files completed in the free tier. A 501-file check did not run and explained that a household license was required.
- The desktop-feature tests confirm matching storage identifiers are blocked. Browser results explicitly remain “drive separation is unverified” because the web platform cannot identify storage devices.
- The normal demo, reset, export, print, **Start for real**, saved-profile, invalid-license, throttled-license, and offline recovery paths pass in the repository suite.
- No sign-in exists, so the Entra External ID requirement is not applicable.
- No AI feature is warranted for this deterministic, privacy-sensitive comparison job; no missed-leverage finding applies.

## Privacy, endpoint, and headers — PASS

- A fresh live `/demo` load, reset, JSON export, and handoff navigation made three same-origin requests only: document, hashed JS, and hashed CSS. It set no cookies.
- A cold landing additionally requested only the documented GitHub public-release API. No trackers, third-party scripts, fonts, archive paths, filenames, bytes, or hashes were sent.
- Source inspection found no analytics, sign-in, raw Azure/OpenAI endpoints, or runtime AI keys.
- Live HTML returns HSTS, `nosniff`, strict-origin referrer policy, camera/microphone/geolocation denial, and a restrictive self-only CSP with GitHub release metadata as its only external connection.
- HTML and the service worker use `Cache-Control: no-cache`; hashed JS uses `public, max-age=31536000, immutable`; API responses use `no-store`.
- An unknown route returns a real HTTP 404 and the designed not-found page. Chromium logs the expected failed-document 404 for this intentional route; normal 200 routes have no console or page errors.

The only server endpoint is `/api/license/verify`. Eleven fresh HTTP/1.1 requests from one client observed the documented allowance: requests 1–10 returned 200 with `X-RateLimit-Remaining` decreasing from 9 to 0; request 11 returned 429. A follow-up throttle response included `Retry-After: 593`, `X-RateLimit-Limit: 10`, `X-RateLimit-Remaining: 0`, and matching positive JSON retry time.

The full unit suite also exercised 18 concurrent requests across independent limiter instances: exactly 10 succeeded and 8 returned 429. It verifies shared ETag-based persistence, trusted platform client identity, HMAC address storage, ten-minute reset, and fail-closed behavior when the shared store is unavailable.

## Accessibility, responsive behavior, and PWA — PASS

- `/opt/fleet/lib/verify-url.sh` passed for both the local production build and the live root: valid title, `lang=en`, one h1, one main landmark, image alt text, labelled buttons, and no normal-load console errors.
- Independent Axe 4 scans covered `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, `/missing-stop`, and `/404.html` at 1440×900 and 390×844. All 16 scans had zero serious or critical findings and zero horizontal overflow.
- Fresh keyboard focus begins on **Skip to main content** with a solid visible outline. Enter moves focus to `<main>`. All forward-tab stops on `/check` are visible; hidden directory inputs are skipped. SPA forward and back navigation move focus to the new h1.
- The 390 px first screen keeps the headline, audience, action, outcome, and three facts visible without horizontal scrolling.
- Reduced-motion mode reduces animation and transition durations to 0.00001 seconds; no meaningful motion remains.
- After service-worker activation, a live `/demo` reload succeeded offline with its heading and sandbox banner intact. The suite also proves that an online update replaces a deliberately stale cached shell before the next offline reload.

## Performance, deployment identity, and release — PASS

Fresh live mobile Lighthouse 12.8.2:

| Metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| LCP | 1,386 ms |
| CLS | 0 |
| Total blocking time | 55 ms |
| Max potential FID | 160 ms |
| Total transfer | 63,714 bytes |

The site emits 39,248 bytes of JavaScript raw (about 14 KB gzip), 16,224 bytes of CSS raw (4,364 bytes gzip), no webfonts, and a 40,942-byte mobile hero. Every static budget passes.

All 20 publicly served local build files, including HTML, JS, CSS, source maps, images, installers, metadata, and service worker, matched the custom domain byte-for-byte by SHA-256. The candidate differs from release tag `v0.1.9` only in test and verification/handoff files; shipped product source and assets are identical. This establishes that production matches the candidate product.

Release workflow [33281261657](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33281261657) passed for `v0.1.9`. The release contains macOS arm64/x64 DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and valid `latest.json`. The downloaded Linux DEB matched SHA-256 `85a32dcf24d100b0c44ae2a869956cc46bcf6e5ac66995653ab924b1096e4b0f` and reports package `family-archive-check`, version `0.1.9`, architecture `amd64`. The live detected-platform link resolves to the published Linux AppImage.

## Defects by severity

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low — V8-1:** A real result with more than one missing/changed/unreadable item still uses the h1 “One archive item needs attention.” The status immediately below correctly says “2 items need attention,” and every missing, changed, extra, and unreadable path remains listed, so the recovery decision and evidence are not lost. Make the h1 use the actual issue count in the next copy-polish release.

## Operator action

The installers are intentionally unsigned previews. Apple notarization and Windows Authenticode still require the operator-owned certificate secrets documented by the release workflow. This is disclosed on the product page and is not a verification failure.
