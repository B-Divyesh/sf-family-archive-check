# Adversarial first-read review 4 — Family Archive Check

Reviewed 2026-08-30 against `https://family-archive-check.sociobot.in` and clean-clone commit `e1106c00b28e9bd221aaf82284a7015a4c0732c8`.

## Verdict: FAIL

There are two findings: one blocking and one minor. The first screen, one-click demo, storage isolation, offline behavior, all 32 listed claim commands, aggregate test suite, build, routing, accessibility, and earlier repairs otherwise pass. PASS is not available because the mandated phone check receives an incompatible Linux desktop installer and two external landing actions do not identify their external destination.

## Findings

### Blocking

#### F-4-1 — Phones are told that a Linux x86_64 installer is for their device

- Exact quote/location: live landing install section on both an iPhone 13 and Pixel 5 context: “v0.1.9 is ready. Choose the installer for this device.” The action is “Download for Linux” and targets `Family.Archive.Check_0.1.9_amd64.AppImage`.
- Evidence: fresh device contexts at the required phone width returned that same Linux action for iOS and Android. `src/main.ts:558` treats every platform that does not match `Win` or `Mac` as Linux. The `platform-download` claim test covers only a mocked `MacIntel` context; it never checks Windows, Linux, iOS, or Android.
- Why this blocks acceptance: the review is explicitly phone-first. The page makes a false device-specific claim and directs phone visitors to an unusable desktop binary. The passing claim test does not exercise the failing branch.
- Concrete fix: detect iOS and Android before desktop platforms. On mobile, replace the action with “Open this page on macOS, Windows, or Linux to install” and a plainly labeled desktop-release link. Parameterize `@claim:platform-download` for macOS, Windows, Linux, iOS, and Android; assert the correct asset for each desktop and no incompatible download for either phone.

### Minor

#### F-4-2 — Two landing actions do not say that they leave the product site

- Exact locations: “Buy household license — $29” goes to `api.sociobot.in`; “Download for Linux” goes to a GitHub release asset. On the live landing page both have an empty `rel`, no destination note, and no accessible “external site” text. The footer link correctly includes “(external site),” and the `/check` purchase link does too.
- Why this matters: a visitor cannot tell before activation that either action leaves the product origin. This is inconsistent with the site-structure contract and with the product's own footer/check-screen treatment.
- Concrete fix: add a visible short destination note or accessible “(external site)” text and `rel="external"` to both actions. Preserve the result-naming verbs.

## Cold first read

Fresh Chromium contexts opened the deployed home page without scrolling at 390×844 and 1440×900. A separate device pass used iPhone 13 and Pixel 5 profiles.

| Question | Answer from the first screen | Exact supporting text |
|---|---|---|
| What does it do? | Checks that every family photo and video has a copy. | “Check every family photo and video has a copy” |
| For whom? | Household archivists preparing to hand an archive to family. | “For household archivists who need a clear answer before handing photos and videos to family.” |
| What should I click first? | Open the finished sample check. | “Try it with sample data” and “See a finished two-folder check.” |

All three answers and the complete Private, Offline, and Price facts fit before the fold. The facts ended at y=672/844 on mobile and y=735/900 on desktop. This gate passes. F-4-1 occurs later in the landing install section.

## Copy audit

Counts treat a hyphenated term, file name, version, route, or URL as one word and ignore standalone punctuation. No sentence exceeds 22 words and no banned marketing adjective appears.

### Landing page sentences

| Words | Sentence | Result |
|---:|---|---|
| 9 | Check every family photo and video has a copy. | `compare-copies`, `media-readable` |
| 15 | For household archivists who need a clear answer before handing photos and videos to family. | Plain audience/situation |
| 5 | See a finished two-folder check. | `demo-ready` |
| 5 | Files stay on this device. | `local-only` |
| 6 | Works offline after the first visit. | `offline-reload` |
| 4 | Free for 500 files. | `free-limit` |
| 4 | Household license: $29 once. | `paid-license` |
| 11 | Two archive cases travel on separate rails through a verification gate. | Useful image alt |
| 5 | One missing video needs attention. | `demo-ready` |
| 6 | The main archive has six items. | `demo-ready` |
| 5 | The independent copy has five. | `demo-ready` |
| 8 | Pick the main archive and one independent copy. | Instruction |
| 14 | The app counts every file, opens a sample, and checks whether matching files changed. | `complete-file-count`, `media-readable`, `compare-copies` |
| 11 | Save a recovery file list (JSON) and print plain recovery steps. | `file-list-export`, `handoff-sheet` |
| 2 | Choose folders. | Instruction |
| 5 | The app only reads them. | `read-only` |
| 6 | Checking up to 48 media files. | `media-sample-count` |
| 10 | The app counts and tests both folders the same way. | `complete-file-count`, `repeatable-sample` |
| 8 | Keep the recovery file list beside the archive. | Instruction |
| 13 | The app does not move, rename, edit, upload, or identify people in media. | `read-only`, `local-only`, `no-face-recognition` |
| 8 | Keep an independent backup and test recovery yourself. | Product limitation |
| 10 | Only an exported recovery file list writes a new file. | `file-list-export`, `read-only` |
| 10 | Pay $29 once for unlimited checks and saved folder profiles. | `paid-license` |
| 13 | Dodo Payments takes your payment and handles questions or requests about your order. | `payment-policy` |
| 3 | v0.1.9 is ready. | `platform-download` |
| 6 | Choose the installer for this device. | **F-4-1** |
| 7 | Checking the latest release for this device. | Transient state |
| 4 | Downloads are being published. | Fallback state |
| 6 | The release page shows current progress. | Fallback state |
| 6 | Check family photo copies before handoff. | Product one-line description |
| 9 | Version 0.1.9 · Generated art disclosed in the design notes. | Version/provenance |

### Landing headings, labels, and actions

| Words | Text | Type | Result |
|---:|---|---|---|
| 4 | Recovery check · desktop app | Label | Clear |
| 9 | Check every family photo and video has a copy | h1 | Job-first and within limit |
| 5 | Try it with sample data | Action | Result-naming |
| 1 each | Private / Offline / Price | Fact labels | Clear |
| 5 | Sample check · 28 August 2026 | Label | Clear |
| 5 | One missing video needs attention | h2 | Clear |
| 4 | Open this sample check | Action | Result-naming |
| 2 | Three steps | Label | Clear |
| 4 | How the check works | h2 | Clear |
| 3 | Choose two folders | h3 | Clear |
| 3 | Read and compare | h3 | Clear |
| 5 | Export the recovery file list | h3 | Clear |
| 4 | Inside the desktop app | Label | Clear |
| 9 | See the desktop check from folder choice to report | h2 | Clear |
| 3 | Read-only by default | Label | Clear |
| 4 | Your folders stay unchanged | h2 | Clear |
| 2 | Household license | Label | Clear |
| 6 | Check archives larger than 500 files | h2 | Clear |
| 4 | Buy household license — $29 | Action | Result-naming; **F-4-2** |
| 3 | Enter license token | Action | Result-naming |
| 2 | Desktop app | Label | Clear |
| 5 | Install for full folder checks | h2 | Clear |
| 3 | Download for Linux | Action | Result-naming; **F-4-1**, **F-4-2** |
| 2 | View releases | Fallback action | Result-naming |
| 3 | View release page | Fallback action | Result-naming |

### README sentences

| Words | Sentence | Result |
|---:|---|---|
| 13 | Check that family photos and videos have a readable, independent copy before handoff. | Clear |
| 14 | Family Archive Check is a desktop app that keeps archive data on your computer. | `local-only` |
| 12 | It compares a main archive with an independent copy on another drive. | `compare-copies`, `independent-folders` |
| 17 | It tests the same repeatable sample of photos and videos, then reports missing, changed, and unreadable files. | `repeatable-sample`, `compare-copies`, `media-readable` |
| 15 | It also exports and imports a recovery file list (JSON) and a printable handoff sheet. | `file-list-export`, `recovery-import`, `handoff-sheet` |
| 14 | It does not host photos, identify faces, sync files, or change the selected folders. | `local-only`, `no-face-recognition`, `read-only` |
| 2 | Open `https://family-archive-check.sociobot.in/demo`. | Instruction |
| 11 | The sample opens without an account and contains one missing video. | `demo-ready` |
| 8 | Demo data stays separate from real folder data. | `demo-isolation` |
| 14 | The product site detects macOS, Windows, or Linux and links to the matching installer. | `platform-download`; incomplete branch coverage in **F-4-1** |
| 9 | You can also download the app from a terminal. | Instruction |
| 14 | Both helpers confirm that the download is unchanged, then place the installer in Downloads. | `installer-checksum` |
| 6 | Open the downloaded installer to finish. | Instruction |
| 13 | Developer note: each helper verifies the published SHA-256 checksum before saving the installer. | `installer-checksum`; appropriate developer detail |
| 5 | Choose the main archive folder. | Instruction |
| 11 | Choose an independent copy on another connected drive or network folder. | `independent-folders` |
| 4 | Select **Check both folders**. | Instruction |
| 6 | Review missing, changed, and unreadable items. | `compare-copies`, `media-readable` |
| 11 | Export the recovery file list (JSON) and print the handoff sheet. | `file-list-export`, `handoff-sheet` |
| 11 | Import the recovery file list to check a restored folder later. | `recovery-import` |
| 10 | The installed app blocks folders on the same storage device. | `independent-folders` |
| 17 | The website can spot the same folder name, but only the desktop app can confirm separate drives. | `independent-folders` |
| 8 | The free app checks up to 500 files. | `free-limit` |
| 12 | A $29 one-time household license enables unlimited checks and saved folder profiles. | `paid-license` |
| 8 | Recovery exports and accessibility are never paid features. | `free-exports`, `accessibility-not-gated` |
| 11 | Requirements: Node.js 22.12.x, Rust stable, and the Tauri 2 system dependencies. | Developer instruction |
| 11 | The scanner tests valid JPEG, PNG, HEIC, MP4, and MOV fixtures. | `common-media-codecs` |
| 13 | CI also scans those fixtures on APFS, NTFS, and exFAT volumes; see `.factory/storage-matrix.md`. | `filesystem-matrix` |
| 5 | Build the deployable static site. | Developer instruction |
| 4 | Build both web targets. | Developer instruction |
| 6 | Run the native app during development. | Developer instruction |
| 5 | `.github/workflows/release.yml` runs for `v*` tags. | `release-tag-trigger` |
| 12 | It builds Tauri installers for macOS arm64 and x86_64, Windows, and Linux. | `release-platform-builds` |
| 11 | The workflow attaches installers, `SHA256SUMS`, and `latest.json` to the GitHub Release. | `release-attachments` |
| 6 | The scanner reads chosen folders locally. | `local-only`, `read-only` |
| 7 | The website sends no archive data away. | `local-only` |
| 13 | The product verification endpoint forwards only the pasted token to Sociobot’s license service. | `license-privacy` |
| 10 | It allows 10 requests per client address in 10 minutes. | `license-rate-limit` |
| 10 | After that, it returns HTTP 429 with a `Retry-After` value. | `license-rate-limit` |
| 8 | See `/privacy` and `/terms` on the product site. | Instruction |
| 9 | The source code is available under the MIT License. | Directly confirmed |

README headings — “Try the sample,” “Install,” “Use the app,” “Develop and test,” “Release,” and “Privacy and license” — name their sections. Public terminology remains consistent: `main archive`, `independent copy`, `check`, `recovery file list`, `handoff sheet`, and `household license`.

## Demo and sandbox behavior

- One click on “Try it with sample data” reached `/?demo=1`; the first screen already showed the attention result, 6/5 file counts, realistic archive locations, and missing `2024/01-New-year/fireworks.mp4`.
- The persistent banner said “Demo — sample data, nothing is saved” and exposed working **Reset demo** and **Start for real** controls.
- Reset restored the original missing-video fixture. Export produced `family-archive-file-list-2026-08-28.json` with check ID `sample-family-archive` and the missing path.
- Before demo entry, real `family-archive-check:profiles` data and a review sentinel were seeded. Their complete local-storage values were byte-for-byte unchanged after entry, reset, export, and Start for real. The real check had no sample data.
- The direct `/demo` route installed its service worker and reloaded successfully while offline with the banner and result intact.
- The demo flow made product-origin requests plus the documented home-page GitHub Releases request; no cookie, tracker, external font, external script, license call, or AI call appeared. The isolated claim test that begins directly at `/demo` observed same-origin traffic only.

## Claims

The repository was freshly cloned to `/tmp/fac-review4-clean.YwyVnv` at the reviewed commit and installed from its lockfile. Every `test` field in `.factory/claims.json` ran independently; all 32 passed. Logs are `/tmp/fac-review4-claim-<id>.log`.

| Claim | Result | Claim | Result |
|---|---|---|---|
| demo-ready | PASS | file-list-export | PASS |
| handoff-sheet | PASS | local-only | PASS |
| offline-reload | PASS | compare-copies | PASS |
| media-readable | PASS | repeatable-sample | PASS |
| media-sample-count | PASS | complete-file-count | PASS |
| common-media-codecs | PASS | filesystem-matrix | PASS |
| independent-folders | PASS | free-limit | PASS |
| read-only | PASS | capture-year | PASS |
| paid-license | PASS | platform-download | PASS, but under-scoped; see F-4-1 |
| demo-isolation | PASS | license-privacy | PASS |
| license-rate-limit | PASS | installer-checksum | PASS |
| payment-policy | PASS | free-exports | PASS |
| accessibility-not-gated | PASS | no-face-recognition | PASS |
| no-tracking | PASS | release-tag-trigger | PASS |
| release-platform-builds | PASS | release-attachments | PASS |
| recovery-import | PASS | recovery-import-private | PASS |

No exact manifest command failed. No public claim-like sentence lacks a related manifest entry. F-4-1 remains because the platform claim's single mocked macOS case does not verify the live phone behavior or the other named platforms.

The same clean clone passed `npm test` (27 Vitest and 33 Playwright tests) and `npm run build`; `dist/site` and `dist/app` were produced. Site JavaScript totals 44,165 raw bytes across initial chunks and about 15 KB gzip.

## Earlier finding verification

Every earlier review, polish report, and the preceding handoff was read. Each earlier finding was checked against current live behavior and source/tests.

| Earlier finding | Current confirmation | Status |
|---|---|---|
| F-1-1 | The paid test exercises the 501-file boundary, verification, completed check, profile save, reload, and reuse. | Fixed |
| F-1-2 | The handoff test asserts the heading, four steps, both locations, result, and Print action. | Fixed |
| F-1-3 | The shell helper executes valid/tampered cases; the Windows harness and CI invocation remain present for PowerShell. | Fixed |
| F-1-4 | Seeded real storage survived live demo entry, export, reset, and exit exactly. | Fixed |
| F-1-5 | Payment responsibility is registered and the checkout policy test passes. | Fixed |
| F-1-6 | Unlicensed recovery exports and accessibility tests pass. | Fixed |
| F-1-7 | Landing and demo both show and test 6/5 counts. | Fixed |
| F-1-8 | No people-identification dependency, code, camera permission, or request is present. | Fixed |
| F-1-9 | All three facts end inside both required first viewports. | Fixed |
| F-1-10 | Every public route updates title, description, canonical, OG, and Twitter metadata. | Fixed |
| F-1-11 | The sample handoff route is in the sitemap. | Fixed |
| F-1-12 | Unknown routes return the designed HTTP 404 with the common shell. | Fixed |
| F-1-13 | Process copy explains counts, opening samples, and changed files. | Fixed |
| F-1-14 | Main archive, independent copy, and recovery file list remain consistent. | Fixed |
| F-1-15 | The walkthrough states that both folders are counted and tested the same way. | Fixed |
| F-1-16 | “Enter license token” reveals and focuses the field. | Fixed |
| F-1-17 | README says data stays on the computer. | Fixed |
| F-1-18 | README says the same repeatable sample. | Fixed |
| F-1-19 | README calls the optional commands terminal downloads. | Fixed |
| F-1-20 | Visitor copy describes an unchanged download; SHA-256 stays in the developer note. | Fixed |
| F-1-21 | Folder guidance uses connected drive or network folder. | Fixed |
| F-1-22 | README directly distinguishes website and desktop drive checks. | Fixed |
| F-1-23 | README says “Build the deployable static site.” | Fixed |
| F-1-24 | README says Sociobot’s license service. | Fixed |
| F-1-25 | The unsupported unsigned-preview sentence remains absent. | Fixed |
| F-2-1 | Real handoff preview remains inside `/check`; unknown print paths return the designed 404. | Fixed |
| F-2-2 / V8-1 | Multi-item headings derive from the actual issue count and the regression test passes. | Fixed |
| F-2-3 | Public input/output terminology is consistent. | Fixed |
| F-2-4 | A fresh visitor reaches populated sample data without account UI, redirect, or auth cookie. | Fixed |
| F-2-5 | Unsupported signing copy remains absent. | Fixed |
| F-2-6 | The `v*` release trigger has a registered passing policy test. | Fixed |
| F-2-7 | The four-target desktop build matrix has a registered passing policy test. | Fixed |
| F-2-8 | Installer, checksum, and `latest.json` attachment policy test passes. | Fixed |
| F-2-9 | Recovery-list import and restored-folder comparison work locally and privately. | Fixed |
| F-2-10 | The walkthrough heading names the folder-to-report flow and makes no speed claim. | Fixed |
| F-2-11 | README says “matching installer.” | Fixed |
| F-2-12 | Purchase copy says Dodo handles questions or requests about the order. | Fixed |
| F-3-1 | “Up to 48” has its own claim and a 60-file native test asserting exactly 48 samples. | Fixed |
| Controller-3-1 | Playwright owns its preview server and the offline test closes only its private context; all 33 tests pass. | Fixed |

No earlier finding is reopened under its old ID. F-4-1 is a newly exercised phone branch of the later platform-download feature.

## Structure, routing, links, accessibility, and identity

- `/`, `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive` returned 200. An unknown path returned the designed page with HTTP 404.
- Each public route has a route-specific title, description, canonical, OG/Twitter metadata, `lang="en"`, exactly one h1, one main landmark, and common header/footer legal links. The home title follows “Product — what it does.”
- SPA navigation and browser Back restored the route, scrolled to the top, focused the new h1, and used the polite route announcer.
- Every internal link discovered across all public routes returned 200; the intentionally missing route remained 404. The product-specific checkout passed its claim test, and the detected release URL was present. The unrelated factory footer destination was not contacted because the work order forbids access to non-product resources.
- Live Axe scans at 390 px returned zero violations on all six public routes and the 404. Standard routes logged no console errors; the 404 logged only its expected failed-document 404.
- The 1200×630 social image, 180×180 apple-touch icon, SVG favicon, robots file, complete sitemap, CSP/security headers, reduced-motion rules, focus treatment, and 44 px controls are present.
- The art-deco transit-poster illustration, archive rails, paper/ink palette, stepped geometry, narrow display type, serif text, and route motion follow `.factory/design.md`. The result is recognizably product-specific, not a generic SaaS template.
- F-4-2 is the remaining external-link disclosure failure.

## Missed leverage

No additional feature is justified by the brief. Recovery-file-list import closes the expected export/recovery loop. Cloud sync is an explicit non-goal. Folder inventory, media parsing, and fingerprint comparison are deterministic and privacy-sensitive, so an AI step would add cost and disclosure without improving the core job.

## What would make this perfect

Resolve F-4-1 and F-4-2, then repeat the cold phone, platform, claims, and link checks. Perfect means phones receive no incompatible desktop download, every named desktop platform has an observable claim test, and every off-site landing action discloses its destination. Nothing else remains from this review.
