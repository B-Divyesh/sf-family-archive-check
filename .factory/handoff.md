# Family Archive Check — polish round 3 handoff

## Status

Base candidate: `627d41b1b5043c68f88702c297bcb12555760470`.
Repair implementation: `2d63f0e4e861d66fa48e81f68fde8250f2f381f6`.

This repair closes every finding in `.factory/review-1.md` and `.factory/review-2.md`, including historical `V8-1`, plus the controller's reproducible preview-server collision. The complete id-to-change-to-evidence map is in `.factory/polish-3.md`.

## What changed

- Preserved the complete first- and second-round product repairs: literal first-screen wording, an isolated direct `?demo=1` sample path with persistent Reset/Start-for-real controls, recovery-file-list import, real routes/metadata/404, mobile layout, legal links, and the art-deco archive-route identity.
- Added `tests/stop-preview-server.mjs`. It identifies port 4173 owners through `/proc`, stops only an orphaned FAC Vite or test server in this workspace, and refuses to kill any unrelated process.
- Added pre-test cleanup hooks and made Playwright build and own a fresh server with `reuseExistingServer: false`. The exact former collision is now reproducible and cleared before the offline claim runs.
- Changed both offline/reload tests to use `browser.newContext()` and `context.close()` in `finally`; neither touches the shared browser or another test's context.
- Updated the catalog description to a verb-first, 72-character plain sentence.

## Verification

- Deterministic-collision reproduction: a live `tests/serve-site.mjs` listener on 127.0.0.1:4173 was cleared by `npm run clean:test-server`; its socket was then closed before `npm run test:e2e -- --grep @claim:offline-reload` started and passed (1 test).
- Local aggregate: `npm test` passed (27 Vitest and 33 Playwright); `npm run typecheck`, `npm run lint`, and `npm run build` passed. Site output is 13.43 KB gzip JavaScript and 4.40 KB gzip CSS.
- Native checks: `cargo test --manifest-path src-tauri/Cargo.toml` passed (8 tests); both non-desktop and `--features desktop` clippy commands passed with `-D warnings`. The documented Tauri packages were installed locally before the desktop check.
- Local browser smoke: `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 repair-artifacts/polish-3-local` passed with no console errors. Evidence: `repair-artifacts/polish-3-local/verify.json`, `screenshot-desktop.png`, `screenshot-mobile.png`, `demo-mobile.png`, and `not-found-desktop.png`.
- Local mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.5 s, CLS 0, and TBT 0 ms. Evidence: `repair-artifacts/polish-3-local/lighthouse-mobile.json`.
- Clean clone: `/tmp/family-archive-check-polish-3-clean.eDF6Sr` at `2d63f0e4e861d66fa48e81f68fde8250f2f381f6`; every one of the 31 exact `.factory/claims.json` commands passed independently. Logs: `/tmp/family-archive-check-polish-3-<claim-id>.log`.
- Clean-clone aggregate passed: `npm test` (27 Vitest and 33 Playwright), `npm run typecheck`, `npm run lint`, `npm run build`, `cargo test --manifest-path src-tauri/Cargo.toml`, and both clippy commands with `-D warnings`.

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

The factory static deployment and cold live recheck are recorded after the final committed build is deployed.

## Known gaps

None expected. Desktop installers remain unsigned preview artifacts until an operator provides signing credentials; no visitor-facing claim about that state is made.
