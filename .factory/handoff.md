# Family Archive Check — polish round 3 handoff

## Status

Base candidate: `627d41b1b5043c68f88702c297bcb12555760470`.

This repair closes every finding in `.factory/review-1.md` and `.factory/review-2.md`, including historical `V8-1`, plus the controller's reproducible preview-server collision. The complete id-to-change-to-evidence map is in `.factory/polish-3.md`.

## What changed

- Preserved the complete first- and second-round product repairs: literal first-screen wording, an isolated direct `?demo=1` sample path with persistent Reset/Start-for-real controls, recovery-file-list import, real routes/metadata/404, mobile layout, legal links, and the art-deco archive-route identity.
- Added `tests/stop-preview-server.mjs`. It identifies port 4173 owners through `/proc`, stops only an orphaned FAC Vite or test server in this workspace, and refuses to kill any unrelated process.
- Added pre-test cleanup hooks and made Playwright build and own a fresh server with `reuseExistingServer: false`. The exact former collision is now reproducible and cleared before the offline claim runs.
- Changed both offline/reload tests to use `browser.newContext()` and `context.close()` in `finally`; neither touches the shared browser or another test's context.
- Updated the catalog description to a verb-first, 70-character plain sentence.

## Verification

- Deterministic-collision reproduction: a live `tests/serve-site.mjs` listener on 127.0.0.1:4173 was cleared by `npm run clean:test-server`; its socket was then closed before `npm run test:e2e -- --grep @claim:offline-reload` started and passed (1 test).
- Local aggregate: `npm test` passed (27 Vitest and 33 Playwright); `npm run typecheck`, `npm run lint`, and `npm run build` passed. Site output is 13.43 KB gzip JavaScript and 4.40 KB gzip CSS.
- Native checks: `cargo test --manifest-path src-tauri/Cargo.toml` passed (8 tests); both non-desktop and `--features desktop` clippy commands passed with `-D warnings`. The documented Tauri packages were installed locally before the desktop check.
- Local browser smoke: `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 repair-artifacts/polish-3-local` passed with no console errors. Evidence: `repair-artifacts/polish-3-local/verify.json`, `screenshot-desktop.png`, `screenshot-mobile.png`, `demo-mobile.png`, and `not-found-desktop.png`.
- Pending final steps: clean-clone execution of every individual claim command, Lighthouse, deployment, and cold live recheck are recorded below when complete.

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
