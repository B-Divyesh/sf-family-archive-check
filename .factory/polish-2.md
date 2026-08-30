# Polish round 2 — complete finding closure

Released candidate reviewed: `154eab54fbc57be419b148646b002390eb7dadf2`  
Review source: `f7236ed6754bf11ca94b9e520f0926fe93b7e6ce` / `.factory/review-2.md`  
Repair implementation: `3bbc6fdfaa1e6208feda884186e5d488980551e8`

## Review 2 findings

| Finding | Change made | Evidence |
|---|---|---|
| F-2-1 | Only `/print/sample-family-archive` is a public route. Real handoff preview stays at `/check`; unknown print paths now receive the designed HTTP 404. Metadata remains `/check` while previewing. | Browser test `a real handoff stays inside the check route and unknown print paths are real 404s`; `tests/serve-site.mjs`; local screenshot `repair-artifacts/polish-2-local/screenshot-desktop.png`; live `/check`, `/print/sample-family-archive`, and `/print/not-a-real-check` recheck recorded in handoff. |
| F-2-2 | Result h1 now derives from missing, changed, and unreadable issue count. | Browser test `a multi-item result names the true issue count in its heading and status`. |
| F-2-3 | Standardized `main archive`, `independent copy`, and `recovery file list` across UI, README, walkthrough, demo guide, and design notes. | Policy test `uses main archive, independent copy, and recovery file list consistently`; old-copy search. |
| F-2-4 | Expanded `demo-ready` claim and test to prove a fresh visitor reaches sample data without account controls, redirects, or auth cookies. | `@claim:demo-ready`. |
| F-2-5 | Removed the unsupported unsigned-installer statement from landing and README. | Exact-copy search; `@claim:platform-download` verifies the remaining plain installer promise. |
| F-2-6 | Registered the v-tag workflow statement as its own claim and parsed the workflow in a tagged policy test. | `@claim:release-tag-trigger`. |
| F-2-7 | Registered and tested the macOS arm64/x64, Windows, and Linux Tauri matrix statement. | `@claim:release-platform-builds`. |
| F-2-8 | Registered and tested installer, `SHA256SUMS`, and `latest.json` release attachments. | `@claim:release-attachments`. |
| F-2-9 | Added local recovery-file-list import, schema validation, restored-folder selection, and a comparison against saved paths, sizes, and sampled fingerprints. | `@claim:recovery-import`; `@claim:recovery-import-private`; local screenshot `repair-artifacts/polish-2-local/screenshot-desktop.png`. |
| F-2-10 | Rewrote the walkthrough heading as “See the desktop check from folder choice to report.” | `.factory/copy-audit.md`; browser landing check. |
| F-2-11 | Replaced “matching release” with “matching installer.” | README copy audit. |
| F-2-12 | Rewrote purchase copy to say Dodo handles questions or requests about an order. | `@claim:payment-policy`; landing and terms copy audit. |

## Historical review 1 findings

| Finding | Change made or confirmed | Evidence |
|---|---|---|
| F-1-1 | Licensed 501-file check, verification, profile save/reload/reuse remains behavioral. | `@claim:paid-license`. |
| F-1-2 | Sample handoff sheet continues to assert heading, locations, four steps, summary, and print action. | `@claim:handoff-sheet`. |
| F-1-3 | Both installer helpers retain executable checksum coverage. | `@claim:installer-checksum`; Windows workflow harness. |
| F-1-4 | Demo storage remains separate from real profiles and sentinel storage. | `@claim:demo-isolation`. |
| F-1-5 | Payment responsibility stays registered and checked through checkout. | `@claim:payment-policy`. |
| F-1-6 | Recovery export and accessibility remain unlicensed features. | `@claim:free-exports`; `@claim:accessibility-not-gated`. |
| F-1-7 | Landing and demo counts remain 6 main / 5 independent-copy items. | `@claim:demo-ready`. |
| F-1-8 | No people-identification code, dependency, camera permission, or request is present. | `@claim:no-face-recognition`. |
| F-1-9 | All three hero facts remain inside the 390×844 and 1440×900 first view. | Browser tests `mobile layout keeps actions inside the viewport` and `desktop first screen keeps its audience and primary action visible`. |
| F-1-10 | Route metadata remains per-route; print is now only the public sample route. | Browser route/metadata tests; local verify report. |
| F-1-11 | Sample handoff route remains in sitemap. | Build and sitemap inspection. |
| F-1-12 | Designed static 404 remains the actual unknown-route response. | Real-404 browser test; local `GET /print/not-a-real-check` assertion. |
| F-1-13 | Technical process wording remains rewritten in plain words. | `.factory/copy-audit.md`. |
| F-1-14 | Remaining shortened terms were removed in this round. | F-2-3 policy test. |
| F-1-15 | Walkthrough still names counting and testing both folders. | `.factory/copy-audit.md`. |
| F-1-16 | License disclosure action remains “Enter license token.” | Browser keyboard coverage. |
| F-1-17 | README keeps the plain on-your-computer wording. | README copy audit. |
| F-1-18 | README keeps “same repeatable sample.” | README copy audit. |
| F-1-19 | README keeps the plain terminal-download wording. | README copy audit. |
| F-1-20 | Visitor copy explains that the download is unchanged; SHA-256 is developer detail only. | `@claim:installer-checksum`. |
| F-1-21 | README and picker use connected drive or network folder. | README and browser picker. |
| F-1-22 | README names the website and desktop limitation directly. | README copy audit. |
| F-1-23 | README keeps “Build the deployable static site.” | README copy audit. |
| F-1-24 | Privacy copy uses Sociobot’s license service, not implementation jargon. | `@claim:license-privacy`. |
| F-1-25 | Unsupported signing-warning copy was removed rather than left as an untested claim. | Exact-copy search; `@claim:platform-download`. |
| V8-1 | The historical multi-issue h1 defect is fixed by deriving the heading from the true issue count. | Browser test `a multi-item result names the true issue count in its heading and status`; live recovery recheck. |

## Verification

- Fresh clone: `/tmp/family-archive-check-polish-2-clean.vd88xY` at `3bbc6fdfaa1e6208feda884186e5d488980551e8`.
- Every one of 31 exact commands in `.factory/claims.json` passed independently; logs are `/tmp/family-archive-check-polish-2-<claim-id>.log`.
- Fresh-clone aggregate passed: `npm test` (27 Vitest + 33 Playwright), `npm run typecheck`, `npm run lint`, `npm run build`, `cargo test --manifest-path src-tauri/Cargo.toml`, and both clippy commands.
- Local `verify-url.sh` has no console errors and reports title, `lang`, one h1, main landmark, image alt, and labeled buttons: `repair-artifacts/polish-2-local/verify.json`.
- Local Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO: `repair-artifacts/polish-2-local/lighthouse-mobile.json`.
- Deployed with `/opt/fleet/lib/deploy-static.sh family-archive-check dist/site` to `https://family-archive-check.sociobot.in`. Cold live checks returned 200 for `/`, `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive`; `/print/not-a-real-check` and an unrelated missing route returned designed 404s.
- Live route titles, canonicals, demo banner/data, console, and Axe all passed; the real recovery import flow produced “6 archive items need attention.” Evidence: `repair-artifacts/polish-2-live/`.
- Live mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO: `repair-artifacts/polish-2-live/lighthouse-mobile.json`.
