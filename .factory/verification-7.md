# Independent product verification 7 — FAIL

## Verdict

**FAIL — release blocked.**

- Tested candidate: `430ff1e8b5c76d9085e37bef958514162d7d2019`
- Live URL: <https://family-archive-check.sociobot.in>
- Verified: 2026-08-30 UTC
- Artifact: Tauri desktop app with hosted browser demo and license-verification endpoint

The deployed product matches the candidate's product assets and performs the researched archive-readiness job in the tested browser flows. It cannot be accepted because the repository's required aggregate test command, `npm test`, reproducibly fails. That violates the factory quality gate even though the direct production build and the declared claims pass.

No product code was modified during verification.

## Mandatory first-read and sample-demo gate — PASS

A cold live visit plainly answers all required questions:

- **What:** “Check every family photo and video has a copy.”
- **For whom:** “For household archivists who need a clear answer before handing photos and videos to family.”
- **First action:** “Try it with sample data,” followed by “See a finished two-folder check.”

At 1440×900 the action occupied y=560–604 and the three facts ended at y=735. At 390×844 it occupied y=424–468 and the facts ended at y=672. The one-click action opens the finished six-versus-five sample check, shows the missing `2024/01-New-year/fireworks.mp4`, and displays the persistent demo banner with Reset demo and Start for real.

## Mandatory claims gate — PASS

`.factory/claims.json` is present with 26 entries. Immediately after clean-lockfile install (`npm ci`, then `api/npm ci`), every exact command named by the manifest was run, including each individual Playwright demo command, the targeted Vitest commands, the five targeted Rust commands, and `npm run test:storage-matrix`.

All 26 claims passed:

`demo-ready`, `file-list-export`, `handoff-sheet`, `local-only`, `offline-reload`, `compare-copies`, `media-readable`, `repeatable-sample`, `complete-file-count`, `common-media-codecs`, `filesystem-matrix`, `independent-folders`, `free-limit`, `read-only`, `capture-year`, `paid-license`, `platform-download`, `demo-isolation`, `license-privacy`, `license-rate-limit`, `installer-checksum`, `payment-policy`, `free-exports`, `accessibility-not-gated`, `no-face-recognition`, and `no-tracking`.

The subsequent full browser suite also passed: `test-results/.last-run.json` reports `{"status":"passed","failedTests":[]}`.

## Release-blocking finding

### High — V7-1: `npm test` fails because its production-build test exceeds Vitest's default timeout

Fresh, uncontended reproduction after the claim loop completed:

```text
$ npm test
✓ 22 tests passed
× tests/build.test.ts > builds both deploy and desktop frontends from the package script
  Test timed out in 5000ms.
Test Files 1 failed | 4 passed (5)
Tests 1 failed | 22 passed (23)
```

`tests/build.test.ts` calls `spawnSync('npm', ['run', 'build'])` but declares no longer timeout. The exact build is valid but takes longer than five seconds because it includes the production API install: `npm run build` completed successfully in 5.6 seconds. A second `npm test` run, with no concurrent claim/browser server work, still failed after 8.1 seconds with the same five-second timeout.

This is release-blocking under the product contract: the listed repository test command does not pass locally from the clean checkout. Increase the test timeout or avoid invoking a full install/build synchronously inside the default-timeout unit test, then rerun `npm test` from a clean clone.

## Product and recovery-flow evidence — PASS

- Demo export downloaded `family-archive-file-list-2026-08-28.json`, with `checkId: sample-family-archive` and the expected missing MP4. The handoff route contained four concrete recovery steps.
- Two matching folders produced **“Files match; drive separation is unverified.”** The website correctly requires the desktop app before declaring storage independence.
- A normal boundary/recovery exercise reported a missing JPEG, an extra copy-only file, and a different-size changed text file. Matching malformed JPEG fixtures produced **“One archive item needs attention”** and `Could not read corrupt.jpg`; no ready-for-handoff result appeared.
- Selecting the same folder twice produced “The same folder was chosen twice. Choose the independent copy on another drive.” and disabled Check both folders.
- Invalid-license rate-limit recovery is covered by the declared suite. Independently, eleven live HTTP/1.1 requests from this client returned 200 for requests 1–10 (`X-RateLimit-Remaining: 9` through `0`), then HTTP 429 on request 11. The raw final response carried `Retry-After: 595`, `x-ratelimit-limit: 10`, and `x-ratelimit-remaining: 0`.

## Privacy, accessibility, responsive, and errors — PASS

- Live demo load, reset, export, and handoff navigation made only same-origin requests. A cold landing additionally made the documented GitHub release-metadata request. No archive filenames, bytes, paths, hashes, trackers, third-party fonts, scripts, Azure endpoints, or sign-in requests were observed.
- Live page response headers include HSTS, `nosniff`, strict-origin referrer policy, a restrictive permissions policy, and a CSP allowing only self plus GitHub release metadata. HTML and service worker use `no-cache`; hashed JS uses `public, max-age=31536000, immutable`; an unknown route returns HTTP 404.
- `/opt/fleet/lib/verify-url.sh` passed on the live root: HTTP 200, title, `lang=en`, one h1, main landmark, no missing image alt text, no unlabeled buttons, and no console errors.
- Independent Axe 4.x scans found zero serious or critical violations at 1440×900 and 390×844 on `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, the designed unknown-route page, and `/404.html`. There was no horizontal overflow. Keyboard Tab begins at the skip link; hidden directory inputs do not receive focus. Reduced-motion contexts rendered the same routes without motion-dependent behavior.

## Build, deployment, performance, and release evidence

| Check | Result |
| --- | --- |
| `npm ci` and API production install | PASS; no audit vulnerabilities reported |
| Every exact claims command | PASS; 26/26 |
| `npm run test:e2e` | PASS; 29 browser tests |
| `npm test` | **FAIL**; V7-1 timeout |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (TypeScript and Rust formatting) |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS; 8 tests |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | PASS |
| Exact `npm run build` | PASS; `dist/site` and `dist/app` |

The site emitted 39,248 bytes of JavaScript raw (about 14 KB gzip), 16,224 bytes CSS raw (4.36 KB gzip), no webfonts, and a 40,942-byte mobile hero. All stated static budgets pass.

Fresh live Lighthouse mobile measured Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,780 ms, CLS 0, TBT 63 ms, and 63,740 bytes transfer.

Live/local SHA-256 comparisons all matched for `index.html`, `sw.js`, main JS, CSS, and both hero images. Production release `v0.1.9` targets `2273b2432b546c95844d2ad99c371fc5b02e3829`; the candidate differs from that release only in verification/handoff artifacts, so the deployed product code is the candidate product code. The downloaded Linux `.deb` matches `SHA256SUMS` (`85a32dcf24d100b0c44ae2a869956cc46bcf6e5ac66995653ab924b1096e4b0f`) and reports package `family-archive-check`, version `0.1.9`, architecture `amd64`.

## Defects by severity

- **High / release-blocking:** V7-1 — `npm test` fails at the default five-second timeout while running its production-build assertion.
- **Medium:** none found in this verification.
- **Low:** none found in this verification.

## Required retest

1. Repair V7-1 without weakening the build assertion.
2. From a fresh checkout, run `npm ci`, every exact claims command, `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
3. Update the deployed release only if product code changes, then repeat the deployment-identity and live rate-limit checks.
