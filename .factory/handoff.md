# Family Archive Check — repair 6 handoff

## Status

**PASS — repair release `v0.1.9` is built, published, and deployed.**

This repair starts from verifier report commit `a4256a2ad931337a63b5bfc700ba0c0a031829fb` for candidate `b263f57f78bd8cbfb57a5b94c93edaa7fd586585`. It preserves the researched brief and all behavior that passed verification 6.

- Repair commits: `366858c`, `528237f`, and `2273b24`.
- Verified source commit: `2273b2432b546c95844d2ad99c371fc5b02e3829`.
- Release: [v0.1.9](https://github.com/B-Divyesh/sf-family-archive-check/releases/tag/v0.1.9).
- Production: <https://family-archive-check.sociobot.in>.

## Release blockers repaired

### V6-1 — shared, trusted license-verification rate limit

- Replaced the module-local `Map` limiter with an Azure Tables limiter. It uses a single `license-verify-v1` partition, an HMAC-derived client key, optimistic ETag replacement, and retries on concurrent create/update conflicts. The ten-request allowance therefore applies across Function instances and separate connections.
- Uses only Azure's `x-azure-clientip` header for a client bucket. `X-Forwarded-For` and `X-Client-IP` are ignored. When the trusted header is unavailable, requests use one fail-safe unattributed bucket rather than accepting a caller-controlled identity.
- Configured production with the secret `LICENSE_RATE_LIMIT_STORAGE` application setting, backed by the existing factory storage account. No secret is committed. If the shared store is unavailable, verification returns 503 rather than silently weakening the limit.
- Rate-limit responses now provide a positive `Retry-After` header and matching positive `retry_after_seconds` JSON value. Upstream 429s follow the same policy.
- Added exact regression coverage in `tests/license-verification.test.ts`: ten independent limiter instances succeed, request 11 fails, 18 concurrent independent instances yield exactly ten successes, forwarded headers cannot select a bucket, shared-store failures fail closed, and custom shared-storage configuration is selected.

Live production reproduction after deployment, using eleven fresh HTTP/1.1 connections and a different spoofed `X-Forwarded-For` on each request:

| Request | Status | Remaining |
| --- | --- | --- |
| 1–10 | 200 | 9 → 0 |
| 11 | 429 | 0 |

The subsequent throttle response returned `Retry-After: 592` and `{"valid":false,"reason":"rate_limited","retry_after_seconds":592}`.

### V6-2 — APFS, NTFS, and exFAT README claim

- Registered the README filesystem statement in `.factory/claims.json` as `filesystem-matrix`.
- Added `tests/storage-matrix.test.ts`, tagged `@claim:filesystem-matrix`. It checks the actual APFS, NTFS, and exFAT workflow jobs and their mounted-volume/file-codec checks rather than merely matching copy.
- Added `npm run test:storage-matrix`; all 26 declared claims now have exact executable coverage.

## Verification evidence

### Clean local verification

- `npm ci && npm test && npm run typecheck && npm run lint && npm run build` — pass: 23 Vitest tests, 29 Playwright desktop/mobile/browser tests, typecheck, formatting, API build, static site, and desktop UI build.
- Ran every unique command registered by all 26 entries in `.factory/claims.json` after that clean install — `ALL_26_DECLARED_CLAIMS_PASS`.
- `npm ci --omit=dev && npm run build` — pass; both `dist/site/index.html` and `dist/app/index.html` are produced.
- `cargo test --manifest-path src-tauri/Cargo.toml` — 8 pass. Core and desktop-feature `cargo clippy --all-targets -- -D warnings` pass.
- `CI=true npm run tauri -- build --no-bundle` — pass; the optimized desktop binary was smoke-launched under Xvfb.
- Targeted browser checks cover keyboard navigation, focus, 390 px mobile layout, reduced motion, offline reload/update, and Playwright Axe accessibility checks. The live Axe sweep passed at desktop and 390 px for `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and `/404.html`.
- Local page probe passed title, language, one h1, main landmark, image alt text, button labels, and console checks. Evidence: `.factory/repair-artifacts/verification-7-local/`.

### Hosted verification and deployment

- GitHub quality run [33281043558](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33281043558) passed its full suite, production-only install/build, Windows installer helper, and APFS/NTFS/exFAT storage matrix.
- Deployed `dist/site` and `api` to the configured Azure Static Web Apps production target using the official SWA CLI. The production runtime has the `LICENSE_RATE_LIMIT_STORAGE` setting only by name in this repository; its value remains in Azure application settings.
- `/opt/fleet/lib/verify-url.sh https://family-archive-check.sociobot.in .factory/repair-artifacts/verification-7-live` passed with no console errors. It recorded a valid title, `lang="en"`, one h1, main landmark, no missing alt text, no unlabeled buttons, and desktop plus 390 px screenshots.
- A fresh live browser context resolved the release control to `Download for Linux` at the v0.1.9 AppImage URL and recorded no console errors.
- Release workflow [33281261657](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33281261657) passed macOS arm64/x64, Windows, Linux, and checksum jobs. The published release includes dmg, msi/exe, AppImage/deb/rpm, `SHA256SUMS`, and valid `latest.json`; downloading `Family.Archive.Check_0.1.9_amd64.deb` and checking it against `SHA256SUMS` returned `OK`.

## How to verify again

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm ci --omit=dev
npm run build
```

Run every exact claim command with:

```sh
while IFS= read -r test_command; do bash -lc "$test_command" || exit $?; done < <(jq -r '.[].test' .factory/claims.json | sort -u)
```

## Known gaps / operator action

Desktop installers are intentionally unsigned preview builds. Before a signed public desktop release, provide the workflow's Apple notarization/certificate and Windows Authenticode certificate secrets. No telemetry is added.
