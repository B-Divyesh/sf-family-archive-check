# Family Archive Check handoff

## Independent verification status: FAIL — do not release

- Candidate: `9c6bc1476de73b03cde87334250ad12715f53097`
- Live URL: `https://family-archive-check.sociobot.in`
- Verified: 28 August 2026 (UTC)
- Full report: [`.factory/verification.md`](verification.md)

The live site matches the candidate build, the aggregate tests/build pass, normal demo and export flows work, performance is excellent, and release installers exist. Release is still blocked by these acceptance failures:

1. Eight of nine exact `.factory/claims.json` commands failed when run independently from the clean clone. Seven e2e commands assume a prebuilt `dist/site`; the native claim initially lacked the documented system dependencies.
2. Separate folders containing identical zero-byte `corrupt.jpg` files receive “Ready for handoff” with zero unreadable entries.
3. The same directory can be selected as both the main archive and independent copy and receives “Ready for handoff.”
4. At 1440×900 the audience sentence is clipped and “Try it with sample data” begins below the fold.
5. Axe reports a critical missing-label violation for both file inputs on `/check`; keyboard navigation lands on those invisible 1×1 controls.

Additional findings: relied-on claims are missing from `.factory/claims.json` or incompletely exercised, hashed assets have only a 30-second cache lifetime, unknown routes return HTTP 200, and several secondary mobile links are under 44 px high.

## What works

- Tauri 2 read-only folder inventory and sampled SHA-256 comparison code.
- Missing, changed, and extra path reporting for normal inputs.
- Portable JSON manifest and printable handoff output.
- One-click isolated sample at `/demo`, with Reset and Start for real.
- 500-file free boundary and clear 501-file license message.
- Sociobot one-time-license flow, restore field, invalid-token handling, and offline failure recovery.
- Offline demo reload through the service worker.
- Privacy/terms routes, security headers, responsive layout, reduced motion, and no console errors.
- Original art-deco visual system and documented generated-asset provenance.
- Unsigned installers for macOS, Windows, and Linux with matching SHA-256 checksums.

## Verification commands

```sh
npm ci
npm test
npm run build
npx tsc --noEmit
cargo test --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Linux native checks require the Tauri packages used by `.github/workflows/release.yml`.

Measured results:

- Aggregate test: 4 unit + 11 Playwright tests passed.
- Rust: 2 tests passed; formatting and clippy passed.
- Production build: `dist/site` and `dist/app` produced.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.205 s, CLS 0, TBT 28 ms.
- Main JavaScript 10.9 KB gzip; CSS 4.2 KB gzip; total initial transfer 61.9 KB.
- License endpoint burst allowance observed: 30 successful requests, then 429 with `Retry-After: 3`.

## Required before re-verification

- Repair the clean-clone claim commands.
- Validate actual media decodability, including empty and truncated files.
- Prevent a folder from being compared with itself and address independent-media assurance.
- Fit all required first-screen content at 1440×900.
- Label and de-tab the hidden file inputs; rerun axe on `/check` in fresh contexts.
- Add missing claims/tests and correct caching and soft-404 behavior.

## Known hardware/signing gaps

- Physical APFS, NTFS, and exFAT drives were not available in this Linux verifier.
- Installers remain unsigned. Operator certificates are still required for macOS notarization and Windows Authenticode.
- The one-time product must remain registered at the Sociobot billing service with the production return URL.

No product code was modified during verification.
