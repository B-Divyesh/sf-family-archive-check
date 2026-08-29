# Family Archive Check — repair 5 handoff

## Status

Repair commit: `3aee1e3` (`fix: rate limit license verification`), with this evidence update committed after deployment.

The release-blocking V5-1 finding from `.factory/verification-5.md` is repaired, released, and deployed.

## What changed

- Added a managed Azure Static Web Apps function at `GET /api/license/verify`.
- The function accepts only a license token, forwards it only to the existing Sociobot verification endpoint, and never logs or caches the token.
- It permits **10 requests per client address in 10 minutes**. The next request returns HTTP `429`, `Retry-After`, `X-RateLimit-*`, `Cache-Control: no-store`, and a clear JSON response.
- Both the browser app and Tauri desktop app now call the product-controlled endpoint. The Tauri CSP allows the product endpoint and no longer permits direct calls to the Sociobot billing API.
- The service worker bypasses `/api/`, so license tokens are never stored in its cache. The UI tells the person exactly how long to wait after rate limiting.
- Added the exact `license-rate-limit` claim and endpoint-level regression coverage, including the 11th-request `429`, `Retry-After`, client isolation, reset-window behavior, upstream request shape, and privacy behavior.
- Bumped the release to `v0.1.8`.

## Verification completed locally

- Clean clone: `npm ci` completed successfully. All 25 exact `.factory/claims.json` commands passed; the final batch reported `CLEAN_REMAINING_CLAIMS_PASS`.
- `npm test`: 18 Vitest tests and 29 Playwright tests passed.
- `npm run typecheck`, `npm run lint`, `npm run build`, `cargo test --manifest-path src-tauri/Cargo.toml`, and desktop-feature Clippy with `-D warnings` passed.
- `CI=true npm run tauri build -- --no-bundle` built `src-tauri/target/release/family_archive_check` successfully. An Xvfb launch stayed running for 12 seconds (`TAURI_XVFB_SMOKE_PASS`).
- Local production-site smoke: `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173` reported HTTP 200, no console errors, one `<h1>`, `lang="en"`, `<main>`, and no missing image alt text. Desktop and 390px screenshots are in the transient verification evidence directory.
- The Playwright Axe integration scans `/`, `/demo`, `/check`, `/privacy`, `/terms`, print, and 404 routes with no serious or critical violations. It also covers keyboard order/focus, 390px overflow, reduced motion, offline reload/update, console errors, and privacy request logging.
- The static product build is small: largest initial JavaScript chunk is 12.47 kB gzip; CSS is 4.36 kB gzip.

## Release and deployment

- Pushed `main` and tag [`v0.1.8`](https://github.com/B-Divyesh/sf-family-archive-check/releases/tag/v0.1.8). The [release workflow](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33276995284) passed for macOS arm64, macOS x64, Windows, Linux, and the checksum/manifest job.
- The release has 11 assets. `latest.json` is valid and contains the expected five download URLs. The downloaded `Family.Archive.Check_0.1.8_amd64.deb` passed the published `SHA256SUMS` check (`21d49997d21db6b85c37b75dad97b0c197ebe6c749dc44f6720dac7ee34416ed`).
- Deployed `dist/site` and `api/` to <https://family-archive-check.sociobot.in> (Static Web Apps deployment `b2e4fb79-0983-48a1-bad1-16c364b8634a`). The managed API upload completed successfully.
- Live rate-limit proof, with a fresh forwarded client address: requests 1–10 to `/api/license/verify` returned `200`; request 11 returned `429`, `Retry-After: 597`, `X-RateLimit-Limit: 10`, `X-RateLimit-Remaining: 0`, `Cache-Control: no-store`, and `{"valid":false,"reason":"rate_limited","retry_after_seconds":597}`.
- Live desktop and 390px browser smoke passed with no console errors. The deployed page renders Version 0.1.8, starts keyboard navigation at the skip link, has no horizontal overflow, and makes no direct `api.sociobot.in` browser request. Live Axe scans of `/`, `/demo`, `/privacy`, and `/terms` found zero serious or critical violations.

## Operator notes

Desktop installers remain unsigned. Signing/notarization needs the owner-provided `APPLE_CERTIFICATE` and Windows certificate secrets before a signed production distribution can be made. No telemetry is collected.
