# Independent verification 9 — Family Archive Check

**Verdict: PASS**

- Candidate: `5a55302d2482979ae06cf180ada91d4be1d2b5ca`
- Verified URL: <https://family-archive-check.sociobot.in>
- Verification date: 2026-08-30 UTC
- Scope: independent QA only; no product source was changed.

## Acceptance result

The deployed desktop app and site meet the researched job: a household archivist can compare a main archive with an independent copy, see missing/changed/unreadable status, and export a recovery file list plus printable handoff sheet. The brief's non-goals are also explicit: it does not host, sync, edit, upload, or identify people in media.

Cold first read passed. The live first screen says **“Check every family photo and video has a copy,”** names “household archivists,” and offers **“Try it with sample data”** with the immediate outcome (“See a finished two-folder check”). The action is available in one click and opens the isolated sample.

## Required claims — 32/32 PASS

From the clean candidate checkout, after `npm ci`, I executed every exact `test` command in `.factory/claims.json` independently before the general QA suite. All passed:

| Test command family | Passing claim IDs |
| --- | --- |
| `npm run test:e2e -- --grep @claim:…` | `demo-ready`, `file-list-export`, `handoff-sheet`, `local-only`, `offline-reload`, `paid-license`, `platform-download`, `demo-isolation`, `payment-policy`, `free-exports`, `accessibility-not-gated`, `no-tracking`, `recovery-import`, `recovery-import-private` |
| `npm run test:unit -- --testNamePattern @claim:…` | `compare-copies`, `media-readable`, `independent-folders`, `free-limit`, `license-privacy`, `license-rate-limit`, `installer-checksum`, `no-face-recognition`, `release-tag-trigger`, `release-platform-builds`, `release-attachments` |
| `cargo test --manifest-path src-tauri/Cargo.toml …` | `repeatable-sample`, `media-sample-count`, `complete-file-count`, `common-media-codecs`, `read-only`, `capture-year` |
| `npm run test:storage-matrix` | `filesystem-matrix` |

The direct browser claims exercised the demo entry point, including sample 6/5 counts and missing video, JSON download, printable sheet, real/demo storage isolation, recovery import, outgoing-request privacy, offline reload, keyboard/axe check, and recorded release/checkout fixtures.

## Clean-checkout quality gates

| Check | Result / evidence |
| --- | --- |
| `npm test` | PASS — 27 Vitest tests and 33 Playwright tests completed. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS (TypeScript plus Rust format check). |
| `npm run build` | PASS; created `dist/site` and `dist/app`. Site app JS: 40,382 bytes raw / 13,440 bytes gzip; CSS: 16,440 bytes raw / 4,400 bytes gzip. |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 8 native core tests. |
| `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` | PASS. |

The optional desktop-feature Clippy invocation could not start because this disposable Linux verifier image lacks the documented `glib-2.0` development package (`glib-2.0.pc`). This is an environment prerequisite, not a source failure; native core tests, the release workflow claim, and a published Linux package check all passed. I did not install system packages or modify the product to mask the limitation.

## Live deployment, privacy, and accessibility

- The live root loaded cold with no page errors or console errors. Its only external request was the documented `https://api.github.com/repos/B-Divyesh/sf-family-archive-check/releases?per_page=1`; all product assets were same-origin. No tracker or third-party font was requested.
- A fresh live `/demo` service-worker context successfully reloaded offline after its first load (`200`, demo heading and banner retained).
- Live `/`, `/demo`, `/privacy`, `/terms`, and the designed `/not-a-route` 404 were checked at desktop and/or 390 px. Each normal route had `lang=en`, one `<h1>`, one `<main>`, a route-specific title, no horizontal overflow, and no serious/critical axe findings. The expected 404 document request is the sole 404 console network message on that route.
- Keyboard smoke test reached the skip link first and showed a designed 4 px `#003f40` focus outline. Mobile rendering was visually inspected at 390 px; controls and copy stack without clipping. `prefers-reduced-motion: reduce` produced `scroll-behavior: auto`, no running animations, and near-zero transition durations.
- Headers on the live shell include HSTS, `nosniff`, strict referrer policy, Permissions-Policy denying camera/microphone/geolocation, and a matching CSP. HTML uses short revalidation; hashed JS is `public, max-age=31536000, immutable`.
- Production license allowance was tested against the product endpoint with one client: requests 1–10 returned 200; request 11 returned `429`, `Retry-After: 597`, `X-RateLimit-Limit: 10`, and `X-RateLimit-Remaining: 0`. This matches the documented 10 requests per client in 10 minutes.

## Deployment and release identity

A fresh local production build of the candidate matched the live deployed assets byte-for-byte:

| Asset | SHA-256 |
| --- | --- |
| `assets/index-CmAEqT0O.js` | `227494f0e06168dd767d48a677a3fdaf3866e6ec98f80664b8cc617c7a880903` |
| `assets/index-CBhZGBve.css` | `94348611e689b918f354744dcd6b578bff432ae1411d4a6cecc2f6de3a3d262a` |

The live app identified itself as v0.1.9. GitHub release v0.1.9 supplies macOS arm64/x64, Windows MSI/EXE, and Linux AppImage/DEB/RPM plus valid `latest.json` and `SHA256SUMS`. I downloaded `Family.Archive.Check_0.1.9_amd64.deb`; its SHA-256 was `85a32dcf24d100b0c44ae2a869956cc46bcf6e5ac66995653ab924b1096e4b0f`, exactly matching `SHA256SUMS`, and package metadata reports `family-archive-check` 0.1.9 for amd64.

## Defects

No product defects found.

### Environment note (not a product defect)

- **Info:** desktop-feature Clippy needs the normal Linux Tauri GTK/GLib development prerequisite, absent in this verifier container. See the quality-gate evidence above.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
```

Open `/demo` for the isolated sample. The precise per-claim commands are in `.factory/claims.json`.
