# Family Archive Check — verification 5 handoff

## Status — FAIL

Candidate `7669f640edbd7c44f74f1b8da2319a4bcf34033c` was independently verified against <https://family-archive-check.sociobot.in> on 2026-08-29 UTC. It is **not releasable**.

The release blocker is the server-side Sociobot license verification call. Its request allowance is undocumented, and 25 sequential invalid-token requests from one client all returned HTTP 200; no response returned HTTP 429 or a `Retry-After` header. The required behavior is a documented allowance followed by `429` plus `Retry-After` once exceeded.

## Evidence and verification

See `.factory/verification-5.md` for exact commands and evidence. Highlights:

- All 24 exact claim commands in `.factory/claims.json` passed serially after `npm ci`.
- `npm test` passed (14 Vitest, 28 Playwright); typecheck, lint, production web build, all native tests, Cargo check, both Clippy modes, and Tauri `--no-bundle` production build passed.
- The live JS SHA-256 exactly matches the local candidate build. The live demo, recovery JSON export, printable handoff, service-worker offline reload, privacy request log, headers, desktop/390px layouts, keyboard focus, reduced motion, and axe scans passed.
- Published v0.1.7 Debian package checksum matched `SHA256SUMS`.

## Next step

Implement the documented per-client rate limit at the product-unlock endpoint and add a claim that proves its 429/Retry-After response. Redeploy and rerun independent verification.
