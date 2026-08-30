# Family Archive Check — independent verification 10 handoff

## Status: FAIL

Candidate: `74eae44f9fc9fbc110c49586951b2391f3ab2776`

Live URL: <https://family-archive-check.sociobot.in>

Verified: 2026-08-30 UTC

The web candidate passes all claim, build, functional, privacy, accessibility, offline, and performance checks. Release acceptance fails because the desktop download offered by the live site is v0.1.9 from older commit `2273b2432b546c95844d2ad99c371fc5b02e3829`, not the candidate. The published app lacks the candidate's recovery-file import workflow.

Full evidence: [verification-10.md](verification-10.md).

## Release blocker

**F-10-1 — High:** The latest downloadable desktop app does not match the tested candidate. Its checksum is valid, but the release tag and workflow identify the older source SHA, and a launched copy has no **Import recovery file list** action. The locally built candidate does have that action.

Publish a new version tag from this candidate or a tested descendant, build the complete macOS/Windows/Linux release matrix, point the landing metadata at it, and verify the new binary's SHA and recovery-import UI. Do not rewrite v0.1.9.

## Verification completed

- All 32 exact commands in `.factory/claims.json`: PASS.
- `npm test`: PASS; 27 Vitest and 33 Playwright tests.
- Typecheck, lint, normal build, and production-only install/build: PASS.
- Rust tests: PASS; eight tests.
- Core and desktop-feature clippy with warnings denied: PASS.
- Candidate Tauri debug build and Xvfb launch smoke test: PASS.
- GitHub candidate quality run `33297191282`: PASS.
- Cold first-read and one-click sample demo at desktop and 390 px: PASS.
- Normal, changed, missing, extra, corrupt, duplicate-folder, malformed-import, recovery-import, 500-file, and 501-file browser cases: PASS.
- Axe serious/critical across public routes at desktop and mobile: zero.
- Keyboard, focus, 200% text, touch target, and reduced-motion checks: PASS.
- Offline demo reload and service-worker update: PASS.
- Privacy request log: no off-origin requests during product/data flows; no trackers or external runtime assets.
- License API allowance: ten accepted requests per client window; request 11 returned 429 with `Retry-After`.
- Security headers and cache policy: PASS.
- Live web hashes match the candidate build.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.3 s, CLS 0.
- Bundle budgets: PASS; initial JS 15.2 KiB gzip, CSS 4.4 KiB gzip, mobile hero 40,942 bytes.
- Release download/checksum/launch: PASS for integrity and execution, FAIL for candidate provenance and feature identity.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --no-default-features --all-targets -- -D warnings
cargo clippy --manifest-path src-tauri/Cargo.toml --features desktop --all-targets -- -D warnings
CI=true npm run tauri -- build --debug --no-bundle
```

Demo entry point: <https://family-archive-check.sociobot.in/?demo=1>.

## Changes made by this verifier

Only `.factory/verification-10.md` and this handoff were changed. Product code was not modified. No infrastructure, database, key vault, deployment, DNS, billing, or unrelated resource was read or changed.
