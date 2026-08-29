# Family Archive Check — repair 5 handoff

## Status

Repair commit: `3aee1e3` (`fix: rate limit license verification`).

The release-blocking V5-1 finding from `.factory/verification-5.md` is repaired. This handoff is updated again with release and deployment evidence after the tagged release completes.

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

Pending in this revision: push `main`, tag `v0.1.8`, wait for the three-platform GitHub release and checksum manifest, deploy `dist/site` plus the `api/` function, and verify the live endpoint produces `429` with `Retry-After` after its documented allowance.

## Operator notes

Desktop installers remain unsigned. Signing/notarization needs the owner-provided `APPLE_CERTIFICATE` and Windows certificate secrets before a signed production distribution can be made. No telemetry is collected.
