# Perfection loop round 4 — complete finding closure

- Released candidate repaired: `5a55302d2482979ae06cf180ada91d4be1d2b5ca`
- Cumulative review source: `f5446a408897c6ad9576eec277c6b098b3618b64` / `.factory/review-4.md`
- Repair implementation: `12f1aaf9525562f941658f50063ab5fd4d3e75d4`
- Deployment: `d3937221-9f52-4f01-b37f-1f3f713c7f0e`
- Live URL checked cold: <https://family-archive-check.sociobot.in>

## Review 4 findings

| Finding | Change made | Evidence |
|---|---|---|
| F-4-1 | Detection now checks iOS, iPadOS, Android, and the browser mobile hint before desktop platforms. Phones and unknown platforms get “Open this page on macOS, Windows, or Linux to install” plus a desktop-release-page link. They never get a binary. macOS, Windows, and Linux retain direct matching assets. | `@claim:platform-download` uses five fresh contexts and asserts three correct assets plus zero phone downloads/API requests. Live cold checks repeated all five branches in `repair-artifacts/polish-4-live/cold-check.json`. Screenshots: `repair-artifacts/polish-4-live/iphone-13-download.png` and `repair-artifacts/polish-4-live/pixel-5-download.png`. |
| F-4-2 | The landing purchase link and every release/download state now use `rel="external"` and append “(external site)” to the accessible name. | `@claim:paid-license` asserts the purchase link; `@claim:platform-download` asserts every release link. The live five-platform audit found the exact accessible links with no console errors. |

## Review 3 finding

| Finding | Change retained and reverified | Evidence |
|---|---|---|
| F-3-1 | The interface still says “Checking up to 48 media files,” and the limit remains a distinct registered claim. | `@claim:media-sample-count`; clean-clone native scan of 60 valid images samples exactly 48. |

## Review 2 findings

| Finding | Change retained and reverified | Evidence |
|---|---|---|
| F-2-1 | Real handoff previews stay at `/check`; only the sample has a public print URL; unknown print paths are real 404s. | Browser test `a real handoff stays inside the check route and unknown print paths are real 404s`; live route/404 audit in `repair-artifacts/polish-4-live/cold-check.json`. |
| F-2-2 | Result headings derive from the true issue count. | Browser test `a multi-item result names the true issue count in its heading and status`. |
| F-2-3 | `main archive`, `independent copy`, and `recovery file list` remain the sole public terms. | Unit policy test `uses main archive, independent copy, and recovery file list consistently`; `.factory/copy-audit.md`. |
| F-2-4 | The populated sample opens without an account, authentication redirect, or auth cookie. | `@claim:demo-ready`; live `/?demo=1` check. |
| F-2-5 | The unsupported unsigned-installer sentence remains absent. | Copy-policy/full browser pass; live landing audit. |
| F-2-6 | The release workflow retains its `v*` tag trigger. | `@claim:release-tag-trigger`. |
| F-2-7 | The workflow retains macOS arm64/x64, Windows, and Linux Tauri targets. | `@claim:release-platform-builds`; live v0.1.9 asset resolution for all three platforms. |
| F-2-8 | The workflow retains installers, `SHA256SUMS`, and `latest.json` release attachments. | `@claim:release-attachments`. |
| F-2-9 | Recovery file lists still import locally and compare a restored folder. | `@claim:recovery-import`; `@claim:recovery-import-private`. |
| F-2-10 | The walkthrough heading remains “See the desktop check from folder choice to report.” | `.factory/copy-audit.md`; live landing screenshot from `verify-url.sh`. |
| F-2-11 | README continues to say “matching installer.” | README copy audit. |
| F-2-12 | Purchase copy plainly says Dodo handles questions or requests about the order. | `@claim:payment-policy`; live landing and `/terms`. |

## Review 1 findings

| Finding | Change retained and reverified | Evidence |
|---|---|---|
| F-1-1 | A verified license still enables a 501-file check, saved profile, reload, and reuse after proving the free boundary. | `@claim:paid-license`. |
| F-1-2 | The printable handoff still has its heading, four steps, both locations, result, and Print action. | `@claim:handoff-sheet`; live `/print/sample-family-archive`. |
| F-1-3 | Both terminal installers retain valid/tampered checksum harnesses. | `@claim:installer-checksum`; GitHub quality run `33296946198` includes the Windows harness. |
| F-1-4 | Demo reset/export/exit leaves seeded real storage byte-for-byte unchanged. | `@claim:demo-isolation`; repeated live in `repair-artifacts/polish-4-live/cold-check.json`. |
| F-1-5 | Dodo remains correctly named for payment and order inquiries. | `@claim:payment-policy`. |
| F-1-6 | Recovery exports and accessibility remain available without a license. | `@claim:free-exports`; `@claim:accessibility-not-gated`. |
| F-1-7 | Landing and demo retain the same six-main/five-copy fixture. | `@claim:demo-ready`; live demo. |
| F-1-8 | The no-people-identification boundary remains in copy, permissions, source, and dependencies. | `@claim:no-face-recognition`. |
| F-1-9 | The audience, primary sample action, and all facts fit at 390×844 and 1440×900. | Browser layout tests; repeated across the five live platform contexts. |
| F-1-10 | Every public route retains its own title, description, canonical, Open Graph, and Twitter metadata. | Browser metadata test; six live-route checks in `cold-check.json`. |
| F-1-11 | The public sample handoff remains in the sitemap. | Build inspection and live `/sitemap.xml`. |
| F-1-12 | The designed 404 retains the standard shell and real HTTP 404 status. | Browser 404 test; live `/missing-polish-4` returned 404 with zero serious/critical Axe findings. |
| F-1-13 | Process copy still explains counts, opening a sample, and changed matches in plain words. | `.factory/copy-audit.md`; live landing. |
| F-1-14 | The exported output is consistently called a recovery file list. | Terminology policy test; `@claim:file-list-export`. |
| F-1-15 | The walkthrough still says both folders are counted and tested the same way. | `.factory/copy-audit.md`; live landing. |
| F-1-16 | “Enter license token” still reveals the token field. | Full keyboard browser suite. |
| F-1-17 | README still says archive data stays on the computer. | README copy audit; `@claim:local-only`. |
| F-1-18 | README still describes the same repeatable sample. | `@claim:repeatable-sample`. |
| F-1-19 | README still describes terminal downloads in plain language. | README copy audit. |
| F-1-20 | Visitor copy explains unchanged downloads; SHA-256 remains developer detail. | `@claim:installer-checksum`. |
| F-1-21 | Folder instructions retain “connected drive or network folder.” | `@claim:independent-folders`; live `/check`. |
| F-1-22 | Copy still distinguishes website folder-name checks from desktop drive checks. | `@claim:independent-folders`; live `/check`. |
| F-1-23 | README retains “Build the deployable static site.” | README copy audit. |
| F-1-24 | Privacy copy still says Sociobot’s license service. | `@claim:license-privacy`; live `/privacy`. |
| F-1-25 | The unsupported visitor-facing signing statement remains absent. | Copy audit and live landing. |

## Earlier controller findings

| Finding | Change retained and reverified | Evidence |
|---|---|---|
| V8-1 | Multi-issue result headings use the actual issue count. | Browser multi-item result test. |
| Controller-3-1 | Each Playwright run owns its preview server, and offline tests close only private contexts. | Clean-clone 33-test Playwright pass; `tests/stop-preview-server.mjs`; `@claim:offline-reload`. |

## Final evidence

- All 32 exact claim commands passed independently in clean clone `/tmp/family-archive-check-polish-4-clean.UpRnHW` at `12f1aaf9525562f941658f50063ab5fd4d3e75d4`. Logs: `/tmp/family-archive-check-polish-4-claim-<id>.log`.
- The same clone passed 27 Vitest tests, 33 Playwright tests, typecheck, Rust formatting, site/app builds, eight Rust tests, core clippy, and desktop clippy.
- GitHub quality run [33296946198](https://github.com/B-Divyesh/sf-family-archive-check/actions/runs/33296946198) passed the pushed implementation, including Windows installer and storage-matrix jobs.
- Local and live `verify-url.sh` checks found one h1/main, `lang=en`, complete alt/button names, and no console errors. Playwright Axe found zero serious/critical issues on all routes and the 404.
- Local and live mobile Lighthouse scores were 100/100/100/100. Live LCP was 1.2 s, CLS 0, and TBT 40 ms.
- Site bundles are 44,920 bytes raw JavaScript (15,209 bytes gzip), 16,440 bytes CSS (4,398 bytes gzip), and a 40,942-byte mobile hero.
- Live `index.html` and the primary JavaScript bundle matched the deployed local build byte-for-byte.

Every reported finding is closed. No severity is deferred.
