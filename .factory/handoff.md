# Family Archive Check — perfection loop round 3 handoff

## Status

Complete. The only new review-3 finding, F-3-1, is fixed, and every finding from reviews 1–3 was reverified. No known product gap remains in this work order.

- Implementation commit: `1b0b50e4d74b7414cb9eb42e8c90664f85d0f13d`
- Static deployment: `60bea997-51a7-4e61-abee-221f5a33b7fe`
- Live site: <https://family-archive-check.sociobot.in>

## What changed

- Reworded the landing walkthrough to “Checking up to 48 media files.”
- Added the `media-sample-count` claim and a dedicated 60-file native scanner test.
- Centralized the native sample limit as `MEDIA_SAMPLE_LIMIT` and proved 48 sampled files are readable and hashed.
- Updated the copy audit and the verb-first, 62-character catalog description.
- Rechecked and documented every historical finding in `.factory/polish-3.md`.
- Added four cold-live evidence screenshots under `.factory/verification-artifacts/`.

The art-deco transit-poster visual system, Tauri 2 desktop artifact, and static deployment class are unchanged.

## Verification

Clean clone: `/tmp/family-archive-check-polish-3-clean.RNA5r0` at `1b0b50e4d74b7414cb9eb42e8c90664f85d0f13d`.

- All 32 exact `.factory/claims.json` commands passed independently.
- `npm test`: 27 Vitest and 33 Playwright tests passed.
- `npm run typecheck`, `npm run lint`, and `npm run build` passed; `dist/site` and `dist/app` were produced.
- `cargo test --manifest-path src-tauri/Cargo.toml`: eight tests passed.
- Both normal and `--features desktop` clippy runs passed with warnings denied.
- GitHub quality run `33293365892` passed all jobs.
- JavaScript is 15,022 bytes gzip, CSS is 4,407 bytes gzip, and the mobile hero is 40,942 bytes.

## Cold live verification

- All six public routes returned 200 with route-specific titles, descriptions, canonicals, one h1, one main, and the common shell.
- Unknown general and print paths returned the designed HTTP 404.
- Axe found zero serious or critical issues on every public route and the 404 at 390 px.
- Standard routes produced no console errors. The real 404 produced only the browser’s expected failed-document 404 message.
- The one-click home action entered `?demo=1` with 6/5 counts, the missing video, and the persistent demo banner.
- Export, Reset demo, and Start for real left seeded real profiles and a sentinel byte-for-byte unchanged.
- The entered demo flow made same-origin requests only, and `/demo` reloaded successfully offline.
- Mobile and desktop first screens kept the audience, action, and all privacy/offline/price facts in the initial viewport.
- Lighthouse mobile scored 99 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.4 s, CLS 0, TBT 90 ms.
- The final crawl checked 16 links, including checkout, legal pages, Sociobot, and the Linux installer.

Screenshots:

- `.factory/verification-artifacts/polish-3-live-home-mobile.webp`
- `.factory/verification-artifacts/polish-3-live-home-desktop.webp`
- `.factory/verification-artifacts/polish-3-live-demo-mobile.webp`
- `.factory/verification-artifacts/polish-3-live-not-found-desktop.webp`

## Desktop release

Release v0.1.9 remains current because this repair changes a landing walkthrough, documentation, and the test name/constant for unchanged scanner behavior. Its release contains macOS arm64/x64, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`. All five manifest platform URLs are non-null. A downloaded DEB matched the published SHA-256 checksum.

## Run and verify

```sh
npm ci --include=dev
npm test
npm run typecheck
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo clippy --manifest-path src-tauri/Cargo.toml --features desktop --all-targets -- -D warnings
```

Open `/demo` or `/?demo=1` for the isolated sample. Use **Reset demo** to restore it and **Start for real** to discard it.

## Known gaps and operator action

None for this repair. The current release and live deployment need no operator action.
