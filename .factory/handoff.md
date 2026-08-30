# Family Archive Check — verification 8 handoff

## Status

**PASS — candidate `c13c9a6f937fd4d576d90ca6d033603a292806be` is accepted.**

- Tested URL: <https://family-archive-check.sociobot.in>
- Verification date: 2026-08-30 UTC
- Full report: [verification-8.md](verification-8.md)
- Product code changed by verifier: no

The prior verification 7 blocker is repaired. From the clean candidate checkout, all 26 declared claim commands, `npm test`, typecheck, lint, Rust tests/checks/Clippy, production-only builds, the exact dual frontend build, and the optimized Tauri release build pass. The live deployment matches all 20 publicly served local build files by SHA-256.

## Verification summary

- Mandatory first read passes at 1440×900 and 390×844. The first screen plainly says what the app does, who it serves, and offers one-click **Try it with sample data**.
- `npm test`: 23 Vitest and 29 Playwright tests pass.
- Native scanner: 8 Rust tests pass; default and desktop-feature Clippy pass with warnings denied.
- Actual release binary stayed running through a 12-second Xvfb smoke test.
- Live normal, mismatch, corrupt-media, same-folder recovery, 500-file, 501-file, demo export, printable handoff, and offline-reload paths pass.
- Sixteen route/viewport Axe scans have zero serious or critical findings and zero horizontal overflow. Keyboard skip-link, focus order, route focus, and reduced motion pass.
- Live demo activity is same-origin only and sets no cookies. Security, CSP, no-cache/immutable caching, and API `no-store` headers are present.
- License verification allows 10 requests per client in 10 minutes. Request 11 returned 429; the throttle response included `Retry-After: 593`.
- Fresh live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,386 ms, CLS 0, total blocking time 55 ms, transfer 63,714 bytes.
- Release `v0.1.9` has macOS, Windows, and Linux assets plus valid `SHA256SUMS` and `latest.json`. A downloaded Linux DEB matched its published checksum.

## Defects and known gaps

- **Low — V8-1:** multi-issue results keep the h1 “One archive item needs attention,” while the status panel correctly gives the actual count and lists every discrepancy. Pluralize/count the h1 in the next copy-polish release.
- Installers are intentionally unsigned previews. The site discloses the OS warning.

## How to verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo clippy --manifest-path src-tauri/Cargo.toml --features desktop --all-targets -- -D warnings
npm run build
CI=true npm run tauri -- build --no-bundle
```

Run every exact claim command independently with:

```sh
while IFS= read -r test_command; do bash -lc "$test_command" || exit $?; done < <(jq -r '.[].test' .factory/claims.json)
```

## Needs operator action

For signed public desktop releases, provide the Apple notarization/certificate and Windows Authenticode secrets expected by `.github/workflows/release.yml`. No DNS, infrastructure, billing, or deployment action was performed in this verification.
