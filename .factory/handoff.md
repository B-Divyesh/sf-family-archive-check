# Family Archive Check — verification 6 handoff

## Status

**FAIL — do not release candidate `b263f57f78bd8cbfb57a5b94c93edaa7fd586585`.**

Independent verification on 2026-08-29 UTC found that the live product-controlled license endpoint does not enforce its documented 10-requests-per-client-in-10-minutes allowance across separate Azure Functions instances. A second release blocker is an unregistered README claim about APFS, NTFS, and exFAT CI coverage.

Full evidence and reproduction details are in `.factory/verification-6.md`. No product code was changed.

## What passed

- All 25 commands in `.factory/claims.json` passed from the clean candidate after `npm ci`.
- The cold first screen plainly states the job, audience, first action, and one-click sample outcome.
- `npm test` passed with 18 Vitest and 29 Playwright tests.
- Typecheck, lint, exact production build, eight Rust tests, core/desktop Clippy, optimized Tauri build, and desktop runtime smoke passed.
- Live/local HTML, JavaScript, CSS, and service-worker hashes match.
- Live normal, attention, same-folder, malformed-media, demo export, print, reset, and Start for real flows passed.
- Desktop/mobile Axe, keyboard, focus, reduced-motion, 200% text, touch targets, offline reload/update, headers, caching, link crawl, privacy request logging, and Lighthouse passed.
- v0.1.8 release assets are complete. The Debian and helper-downloaded AppImage matched published SHA-256 values; the extracted Debian binary launched successfully.
- Candidate GitHub quality jobs passed, including APFS, NTFS, exFAT, production-only build, and Windows helper jobs.

## Release blockers

1. **Critical — live rate limit is not client-wide.** Twelve sequential requests from the same client all returned 200 although request 11 should return 429. `X-RateLimit-Remaining` reset across invocations because the limiter uses a module-local `Map`. User-supplied `X-Forwarded-For` also creates arbitrary fresh buckets. A warm-instance browser sequence can return 429, but that does not enforce the allowance across connections/instances.
2. **Major — unlisted claim.** README claims codec scans on APFS, NTFS, and exFAT, but `.factory/claims.json` has no filesystem-matrix claim/test entry. The CI jobs passed; the defect is the mandatory claim registry gap.

## Required next work

- Move rate-limit state to a shared atomic store or an edge/platform limiter and use only a trusted platform-derived client identity.
- Return a consistent positive `Retry-After` in both header and JSON.
- Add multi-connection and concurrent live-like regression coverage proving requests 1–10 pass and request 11 is throttled.
- Register and test the APFS/NTFS/exFAT README claim.
- Rebuild, deploy, and run independent verification 7.

## Operator notes

Desktop installers remain unsigned. Signing/notarization still needs the owner-provided Apple and Windows certificate secrets.
