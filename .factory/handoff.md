# Family Archive Check — perfection loop round 4 handoff

## Status

Round 4 is complete. `F-4-1`, `F-4-2`, and every cumulative review finding are fixed and reverified. The art-deco transit-poster identity and Tauri desktop artifact class are unchanged.

Implementation commit: `12f1aaf9525562f941658f50063ab5fd4d3e75d4`

Deployment: `d3937221-9f52-4f01-b37f-1f3f713c7f0e`

Live site: <https://family-archive-check.sociobot.in>

## What changed

- Phone-first platform detection now recognizes iOS, iPadOS, Android, and browser mobile hints before desktop platforms.
- Phones and unknown platforms show a desktop-use instruction and release-page link. They never receive a desktop binary.
- macOS, Windows, and Linux still resolve to matching v0.1.9 release assets.
- Landing purchase and release actions use `rel="external"` and announce “(external site).”
- `@claim:platform-download` now exercises macOS, Windows, Linux, iOS, and Android in five fresh contexts.
- The catalog description is now “Check family photos and videos against an independent copy before handoff.”
- `.factory/copy-audit.md`, `.factory/claims.json`, and `.factory/polish-4.md` record the final copy, claim, and finding evidence.

## Verification

- Clean clone `/tmp/family-archive-check-polish-4-clean.UpRnHW` at `12f1aaf`: all 32 exact claim commands passed independently. Logs are `/tmp/family-archive-check-polish-4-claim-<id>.log`.
- `npm test`: 27 Vitest and 33 Playwright tests passed.
- `npm run typecheck`, `npm run lint`, and `npm run build` passed. `dist/site` and `dist/app` were produced.
- `cargo test --manifest-path src-tauri/Cargo.toml`: eight tests passed.
- Both core and desktop `cargo clippy ... -D warnings` gates passed.
- GitHub quality run [33296946198](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33296946198) passed.
- Local and live `verify-url.sh` checks found no console errors and valid title, language, h1, main, alt text, and button names.
- Live cold Playwright checks covered all five platform branches, six public routes, the designed 404, metadata, legal links, seeded demo isolation, same-origin demo traffic, and offline reload. Evidence: `repair-artifacts/polish-4-live/cold-check.json`.
- Live Axe found zero serious or critical issues across every public route and the 404.
- Live mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.2 s, CLS 0, TBT 40 ms.
- Initial site payload: 44,920 bytes JavaScript raw / 15,209 gzip; 16,440 bytes CSS raw / 4,398 gzip; 40,942-byte mobile hero.
- Local and live hashes match for `index.html` and `/assets/index-C__-ZfiR.js`.
- Phone screenshots: `repair-artifacts/polish-4-live/iphone-13-download.png` and `repair-artifacts/polish-4-live/pixel-5-download.png`.

## Run and verify

```sh
npm ci --include=dev
npm test
npm run typecheck
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --no-default-features -- -D warnings
cargo clippy --manifest-path src-tauri/Cargo.toml --features desktop -- -D warnings
```

The demo entry point is <https://family-archive-check.sociobot.in/?demo=1>. Reset affects only its in-memory fixture; Start for real opens a blank check.

## Known gaps and next steps

No review, product, accessibility, privacy, routing, or deployment gap remains. No operator action is required for this repair. Existing v0.1.9 desktop release assets remain current because the repair changes only landing-site platform guidance and tests.
