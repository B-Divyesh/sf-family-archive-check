# Polish round 3 — complete finding closure

Released candidate reviewed: `627d41b1b5043c68f88702c297bcb12555760470`  
Review sources: `.factory/review-1.md` and `.factory/review-2.md`  
Repair scope: all historical findings, including `V8-1`, plus the controller's deterministic-preview-server finding.

The product fixes from the first two rounds are retained and rechecked below. This round makes the full browser suite deterministic: every test and Playwright web server starts by stopping only an orphaned FAC Vite/test server on port 4173, then Playwright builds and owns a fresh server (`reuseExistingServer: false`). The two offline/reload tests now create and close only their own browser context.

## Review 1 findings

| Finding | Change retained or made | Evidence |
|---|---|---|
| F-1-1 | The licensed native fixture rejects 501 unlicensed files, accepts a recorded valid license, saves, reloads, and reuses a profile. | `@claim:paid-license` |
| F-1-2 | The sample handoff test asserts its heading, four recovery steps, both locations, result, and print action. | `@claim:handoff-sheet`; `repair-artifacts/polish-3-local/demo-mobile.png` |
| F-1-3 | Shell checksum cases run locally and the checked-in Windows PowerShell harness covers valid and tampered downloads. | `@claim:installer-checksum`; `tests/installers.ps1` |
| F-1-4 | Demo state remains in memory and the test compares seeded real storage byte-for-byte through export, reset, and exit. | `@claim:demo-isolation` |
| F-1-5 | Payment copy names Dodo Payments and the checkout-policy test follows the live checkout. | `@claim:payment-policy`; live checkout check |
| F-1-6 | Recovery export and accessibility remain usable without a license. | `@claim:free-exports`; `@claim:accessibility-not-gated` |
| F-1-7 | Landing and demo show and assert six main-archive items and five independent-copy items. | `@claim:demo-ready`; `repair-artifacts/polish-3-local/demo-mobile.png` |
| F-1-8 | The no-people-identification boundary is plain and policy-tested against dependencies, source, and permissions. | `@claim:no-face-recognition` |
| F-1-9 | The compact hero keeps its audience, action, and all privacy/offline/price facts within 390×844 and 1440×900. | Browser tests `mobile layout keeps actions inside the viewport` and `desktop first screen keeps its audience and primary action visible`; local screenshots |
| F-1-10 | Each public route sets route-specific title, description, canonical, Open Graph, and Twitter data. | Browser test `every public route publishes its own title, description, canonical, and social metadata` |
| F-1-11 | The public sample handoff is listed in `sitemap.xml`. | `public/sitemap.xml`; local `200 /print/sample-family-archive` check |
| F-1-12 | The static HTTP 404 has the same semantic shell, navigation, footer, and poster identity. | Browser test `unknown routes return 404 and hashed assets are immutable`; `repair-artifacts/polish-3-local/not-found-desktop.png` |
| F-1-13 | The process explanation says counts, opening a sample, and changed files instead of technical validation/hash jargon. | `.factory/copy-audit.md`; local landing screenshot |
| F-1-14 | `main archive`, `independent copy`, and `recovery file list` are the only public terms for these concepts. | Policy test `uses main archive, independent copy, and recovery file list consistently` |
| F-1-15 | The walkthrough says both folders are counted and tested the same way. | `.factory/copy-audit.md`; local landing screenshot |
| F-1-16 | The disclosure control says `Enter license token` and reveals the token field. | Browser keyboard coverage; `@claim:paid-license` |
| F-1-17 | README says archive data stays on the computer. | `.factory/copy-audit.md` |
| F-1-18 | README describes the same repeatable sample users see. | `.factory/copy-audit.md`; `@claim:repeatable-sample` |
| F-1-19 | README calls the optional helpers terminal downloads. | `.factory/copy-audit.md` |
| F-1-20 | Visitor copy explains an unchanged download; SHA-256 appears only in the developer note. | `.factory/copy-audit.md`; `@claim:installer-checksum` |
| F-1-21 | Folder choice wording says connected drive or network folder. | README and browser picker; `@claim:independent-folders` |
| F-1-22 | README names the website/desktop drive-identification difference directly. | README copy audit; browser picker |
| F-1-23 | README says `Build the deployable static site`. | `.factory/copy-audit.md` |
| F-1-24 | Privacy copy calls Sociobot the license service, not an API. | `@claim:license-privacy` |
| F-1-25 | The unsupported unsigned-preview statement was removed rather than left as an untested promise. | `@claim:platform-download`; exact-copy search |

## Review 2 and historical findings

| Finding | Change retained or made | Evidence |
|---|---|---|
| F-2-1 | Only `/print/sample-family-archive` is public; real previews stay in `/check`, and unknown print paths are HTTP 404s. | Browser test `a real handoff stays inside the check route and unknown print paths are real 404s`; local `404 /print/not-a-real-check` |
| F-2-2 | Result h1 and status derive from all missing, changed, and unreadable entries. | Browser test `a multi-item result names the true issue count in its heading and status` |
| F-2-3 | The remaining short terms in README and walkthrough were removed. | Policy test `uses main archive, independent copy, and recovery file list consistently` |
| F-2-4 | A fresh visitor reaches populated sample data with no account UI, redirect, or auth cookie. | `@claim:demo-ready` |
| F-2-5 | Unsupported signing state copy was removed. | `@claim:platform-download`; exact-copy search |
| F-2-6 | The v-tag release behavior is registered and tested. | `@claim:release-tag-trigger` |
| F-2-7 | The Tauri macOS arm64/x64, Windows, and Linux matrix is registered and tested. | `@claim:release-platform-builds` |
| F-2-8 | Installer assets, `SHA256SUMS`, and `latest.json` are registered and tested. | `@claim:release-attachments` |
| F-2-9 | Recovery-file-list import validates local JSON, reads a restored folder, and compares saved paths, sizes, and sampled fingerprints locally. | `@claim:recovery-import`; `@claim:recovery-import-private` |
| F-2-10 | The walkthrough heading names the desktop check from folder choice to report. | `.factory/copy-audit.md`; local landing screenshot |
| F-2-11 | README says `matching installer`. | `.factory/copy-audit.md` |
| F-2-12 | Purchase copy says Dodo handles questions or requests about the order. | `@claim:payment-policy`; Terms route check |
| V8-1 | The historical multi-item heading defect uses the true count. | Browser test `a multi-item result names the true issue count in its heading and status` |
| Controller-3-1 | The suite clears an orphaned FAC preview only, starts an owned fresh server, and closes isolated offline contexts without closing the shared browser. | Reproduction: start `tests/serve-site.mjs`, run `npm run clean:test-server` (`stale server cleared`), then `npm run test:e2e -- --grep @claim:offline-reload` → 1 passed; `tests/stop-preview-server.mjs` and `playwright.config.ts` |

## Verification record

- Local full suite: `npm test` — 27 Vitest and 33 Playwright tests passed after the clean-server repair.
- Browser smoke: `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 repair-artifacts/polish-3-local` passed with no console errors, one h1, `lang=en`, a main landmark, and complete image alt text. Screenshots: `repair-artifacts/polish-3-local/screenshot-desktop.png`, `screenshot-mobile.png`, `demo-mobile.png`, and `not-found-desktop.png`.
- Local route status: `/`, `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive` returned 200; `/print/not-a-real-check` and `/missing-stop` returned designed 404s.
- Local mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.5 s, CLS 0, and TBT 0 ms. Evidence: `repair-artifacts/polish-3-local/lighthouse-mobile.json`.
- Clean clone `/tmp/family-archive-check-polish-3-clean.eDF6Sr` at `2d63f0e4e861d66fa48e81f68fde8250f2f381f6` passed all 31 declared claim commands independently, then passed its aggregate 27-unit/33-browser suite, typecheck, lint, both builds, native tests, and both clippy configurations. Per-claim logs are `/tmp/family-archive-check-polish-3-<claim-id>.log`.
- Deployed-live evidence is recorded in `.factory/handoff.md` after the final verification pass.
