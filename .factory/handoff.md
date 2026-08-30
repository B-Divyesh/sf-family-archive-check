# Family Archive Check — polish round 2 handoff

## Status

Repair implementation: `3bbc6fdfaa1e6208feda884186e5d488980551e8`.

This repair closes every finding in `.factory/review-1.md` and `.factory/review-2.md`. The complete id-to-change-to-evidence map is in `.factory/polish-2.md`.

## What changed

- Replaced public dynamic print-result URLs with a real in-place `/check` handoff preview. The sample handoff remains a deep-linkable static route, and unknown print paths return the designed HTTP 404.
- Derived result h1 wording from the true issue count.
- Completed the terminology cleanup: main archive, independent copy, and recovery file list are the only user-facing terms.
- Added a real local recovery flow: import a validated recovery file list, choose a restored folder, and compare saved paths, sizes, and sampled fingerprints without uploading either file.
- Registered every remaining public workflow, account, and recovery claim in `.factory/claims.json` and added behavioral or policy tests.
- Rewrote the vague walkthrough, installer wording, and order-copy phrases. The unsupported signing claim was removed.

## Verification

- Clean clone: `/tmp/family-archive-check-polish-2-clean.vd88xY`, cloned at `3bbc6fdfaa1e6208feda884186e5d488980551e8`.
- All 31 exact commands listed in `.factory/claims.json` passed independently. Logs: `/tmp/family-archive-check-polish-2-<claim-id>.log`.
- Clean-clone aggregate passed: `npm test` (27 Vitest and 33 Playwright), `npm run typecheck`, `npm run lint`, `npm run build`, `cargo test --manifest-path src-tauri/Cargo.toml`, `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`, and `cargo clippy --manifest-path src-tauri/Cargo.toml --features desktop --all-targets -- -D warnings`.
- Local browser smoke: `verify-url.sh` passed with no console errors. Evidence: `repair-artifacts/polish-2-local/verify.json`, `screenshot-desktop.png`, and `screenshot-mobile.png`.
- Local mobile Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100. Evidence: `repair-artifacts/polish-2-local/lighthouse-mobile.json`.

## Run locally

```sh
npm ci
npm test
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
```

Try the isolated sample at `/demo` or `/?demo=1`. Export its recovery file list, choose **Start for real**, then choose **Import recovery file list** to rehearse a local restored-folder check.

## Deployment

Static deployment and cold live verification are performed after this handoff update using:

```sh
/opt/fleet/lib/deploy-static.sh family-archive-check dist/site
```

The final deployment result, cold-route checks, and live evidence are appended after deployment.

## Known gaps

None. Desktop installers remain unsigned preview artifacts until an operator provides signing credentials; no visitor-facing claim about that state is made.
