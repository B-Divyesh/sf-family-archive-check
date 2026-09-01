# Independent verification 11 — PASS

**Candidate:** `91d436901c3ee02400ba09195208f52e2b62b6cc`  
**Live URL:** <https://family-archive-check.sociobot.in>  
**Verified:** 2026-09-01 UTC

## Decision

**PASS.** The live static application matches the candidate production build, and the candidate meets the researched job: a household archivist can use a sample two-folder comparison, see a missing item, and export recovery information without an account or upload.

## First-read and product flow

In a cold browser session, the first screen says: “Check every family photo and video has a copy,” identifies “household archivists,” and presents the one-click **Try it with sample data** action with “See a finished two-folder check.” This satisfies the plain-language and demo-entry acceptance check.

Following that action opened `/?demo=1`, showed the persistent “Demo — sample data, nothing is saved” banner, and rendered the finished sample result, “One archive item needs attention.” Reset demo remained in the demo namespace. The declared sample has six source items and five independent-copy items, exercising the missing-file recovery path. Local Playwright coverage additionally exercised export, printable handoff, recovery-file import, invalid input/recovery states, folder independence, the 500-file free boundary, and license UI behavior.

## Required claims

The first claim command run before dependency installation was blocked because this clean checkout had no installed Playwright dependency. After `npm ci`, **every one of the 34 commands in `.factory/claims.json` passed** from the shipped demo entry point:

`demo-ready`, `file-list-export`, `handoff-sheet`, `local-only`, `offline-reload`, `compare-copies`, `media-readable`, `repeatable-sample`, `media-sample-count`, `complete-file-count`, `common-media-codecs`, `filesystem-matrix`, `independent-folders`, `free-limit`, `read-only`, `capture-year`, `paid-license`, `platform-download`, `demo-isolation`, `license-privacy`, `license-rate-limit`, `installer-checksum`, `payment-policy`, `free-exports`, `accessibility-not-gated`, `no-face-recognition`, `no-tracking`, `release-tag-trigger`, `release-platform-builds`, `release-attachments`, `release-recovery-import`, `recovery-import`, and `recovery-import-private`.

## Local build and desktop evidence

- `npm ci`: passed; 88 packages; audit reported zero vulnerabilities.
- `npm test`: passed — 28 Vitest checks and 34 Playwright checks.
- `npm run typecheck`, `npm run lint`, and `npm run build`: passed.
- Production site assets: JS 41,638 bytes raw / 13,870 bytes gzip; CSS 16,440 bytes raw / 4,400 bytes gzip.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed — 9 tests.
- Both no-default-feature and `desktop` feature `cargo clippy ... -D warnings` checks passed.
- `CI=true npm run tauri -- build --debug --no-bundle`: passed after installing the documented Linux GTK/WebKit build prerequisites. The resulting native binary ran under Xvfb for eight seconds without application errors; the only output was an expected virtual-display EGL acceleration warning.

## Live deployment, privacy, and resilience

- The local production JS and CSS SHA-256 hashes matched the assets served by the live page exactly (`index-D92goGZ5.js` and `index-CBhZGBve.css`).
- Cold-load request recording showed same-origin HTML/assets plus only `https://api.github.com/repos/B-Divyesh/sf-family-archive-check/releases/latest` for public release metadata. No tracker, analytics, font-CDN, file-data, or console/page-error request was observed. This matches the privacy page’s documented GitHub release lookup.
- Live `/?demo=1` registered `family-archive-check-v5`; after `context.setOffline(true)`, it reloaded successfully and retained the sample result.
- Live license verification allowance was confirmed through the same-origin `/api/license/verify` endpoint: requests 1–10 returned 200 and decremented `X-RateLimit-Remaining` from 9 to 0; request 11 returned **429** with `Retry-After: 597` and remaining `0`. This confirms the documented allowance of 10 requests per client in 10 minutes.
- Headers: HTTPS, CSP with `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and no-cache HTML/service worker were present. Hashed JS/CSS used `public, max-age=31536000, immutable`.
- The primary route, demo, check, privacy, terms, print route, and designed 404 each returned 200 with their expected title and exactly one h1. An unknown path returned 404.

## Accessibility, responsive behavior, and performance

- The worker `verify-url.sh` passed for the live home page: HTTP 200, title, `lang=en`, one h1, main landmark, image alt coverage, named controls, and no console errors.
- Axe Core 4.10.3, injected in Playwright Chromium to honor the site CSP, found **zero serious or critical findings** (and zero total violations) on `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and `/404.html`.
- At 390 px, there was no horizontal overflow. Keyboard Tab reached the visible skip link; Enter moved focus to `#main`. The primary action had a visible `rgb(0, 63, 64) solid 4px` focus outline. Reduced-motion browsing produced no console errors.
- Mobile Lighthouse (clean rerun): Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,230 ms, CLS 0, TBT 90 ms.

## Defects

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Scope note

No product code, application data, deployment, or unrelated service was changed. This verification added only its report and handoff status.
