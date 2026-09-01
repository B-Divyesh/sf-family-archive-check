# Adversarial first-read review 5 — Family Archive Check

Reviewed 2026-09-01 against `https://family-archive-check.sociobot.in` and clean-clone commit `e32c0ff25d9a02179fad10cd941c14ce7f87a1db`.

## Verdict: PASS

Finding count: **0**. The review checked the cold first read, copy, demo isolation, all declared claims, earlier findings, routing, metadata, links, privacy traffic, accessibility, and product scope. No untested declared claim or unlisted public claim-like statement was found.

## Cold first read

Fresh browser contexts opened `/` at 390×844 and 1440×900 without scrolling.

| Question | Answer from the first screen | Exact text |
|---|---|---|
| What does this do? | Checks that each family photo and video has a copy. | “Check every family photo and video has a copy” |
| Who is it for? | Household archivists preparing to hand photos and videos to family. | “For household archivists who need a clear answer before handing photos and videos to family.” |
| What should I click first? | Opens a completed sample check. | “Try it with sample data” and “See a finished two-folder check.” |

The complete Private, Offline, and Price facts were visible before the fold in both contexts. This check passes.

## Copy audit

Word counts treat hyphenated terms, URLs, file names, paths, and versions as one word. No landing or README sentence exceeds 22 words. No sentence uses a banned marketing adjective. `main archive`, `independent copy`, and `recovery file list` are used consistently.

### Landing sentences

| Words | Sentence | Check |
|---:|---|---|
| 9 | Check every family photo and video has a copy. | Plain job headline; `compare-copies`, `media-readable` |
| 15 | For household archivists who need a clear answer before handing photos and videos to family. | Plain audience and situation |
| 5 | See a finished two-folder check. | `demo-ready` |
| 5 | Files stay on this device. | `local-only` |
| 6 | Works offline after the first visit. | `offline-reload` |
| 4 | Free for 500 files. | `free-limit` |
| 4 | Household license: $29 once. | `paid-license` |
| 11 | Two archive cases travel on separate rails through a verification gate. | Image alt text |
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
| 12 | The app does not move, rename, edit, upload, or identify people in media. | `read-only`, `local-only`, `no-face-recognition` |
| 8 | Keep an independent backup and test recovery yourself. | Clear limitation and instruction |
| 10 | Only an exported recovery file list writes a new file. | `file-list-export`, `read-only` |
| 10 | Pay $29 once for unlimited checks and saved folder profiles. | `paid-license` |
| 12 | Dodo Payments takes your payment and handles questions or requests about your order. | `payment-policy` |
| 10 | Open this page on macOS, Windows, or Linux to install. | Phone branch of `platform-download` |
| 7 | Checking the latest release for this device. | Desktop transient state |
| 4 | Downloads are being published. | Fallback state |
| 7 | The release page shows current progress. | Fallback state |
| 6 | Check family photo copies before handoff. | Footer description |
| 9 | Version 0.1.11 · Generated art disclosed in the design notes. | Version and provenance |

### Landing headings, labels, and actions

| Text | Type | Check |
|---|---|---|
| Recovery check · desktop app | Label | Names product class |
| Check every family photo and video has a copy | h1 | Plain job headline, 9 words |
| Try it with sample data | Primary action | Result-naming action |
| Private / Offline / Price | Facts | Plain labels |
| Sample check · 28 August 2026 | Label | Identifies preview |
| One missing video needs attention | h2 | Names the result |
| Open this sample check | Action | Result-naming action |
| Three steps | Label | Names quantity |
| How the check works | h2 | Names section |
| Choose two folders / Read and compare / Export the recovery file list | h3s | Name steps |
| Inside the desktop app | Label | Names context |
| See the desktop check from folder choice to report | h2 | Names walkthrough |
| Read-only by default / Your folders stay unchanged | Label / h2 | Names privacy boundary |
| Household license / Check archives larger than 500 files | Label / h2 | Names paid scope |
| Buy household license — $29 / Enter license token | Actions | Result-naming; off-site action announces external destination |
| Desktop app / Install for full folder checks | Label / h2 | Names install section |
| Download for macOS, Windows, or Linux; View desktop releases | Actions | Result-naming; phone branch offers no installer |

### README sentences

| Words | Sentence | Check |
|---:|---|---|
| 13 | Check that family photos and videos have a readable, independent copy before handoff. | Clear summary |
| 14 | Family Archive Check is a desktop app that keeps archive data on your computer. | `local-only` |
| 12 | It compares a main archive with an independent copy on another drive. | `compare-copies`, `independent-folders` |
| 17 | It tests the same repeatable sample of photos and videos, then reports missing, changed, and unreadable files. | `repeatable-sample`, `compare-copies`, `media-readable` |
| 15 | It also exports and imports a recovery file list (JSON) and a printable handoff sheet. | `file-list-export`, `recovery-import`, `handoff-sheet` |
| 14 | It does not host photos, identify faces, sync files, or change the selected folders. | `local-only`, `no-face-recognition`, `read-only` |
| 2 | Open `https://family-archive-check.sociobot.in/demo`. | Instruction |
| 11 | The sample opens without an account and contains one missing video. | `demo-ready` |
| 8 | Demo data stays separate from real folder data. | `demo-isolation` |
| 14 | The product site detects macOS, Windows, or Linux and links to the matching installer. | `platform-download` |
| 9 | You can also download the app from a terminal. | Instruction |
| 14 | Both helpers confirm that the download is unchanged, then place the installer in Downloads. | `installer-checksum` |
| 6 | Open the downloaded installer to finish. | Instruction |
| 13 | Developer note: each helper verifies the published SHA-256 checksum before saving the installer. | `installer-checksum`; developer detail |
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
| 11 | Requirements: Node.js 22.12.x, Rust stable, and the Tauri 2 system dependencies. | Developer requirement |
| 11 | The scanner tests valid JPEG, PNG, HEIC, MP4, and MOV fixtures. | `common-media-codecs` |
| 13 | CI also scans those fixtures on APFS, NTFS, and exFAT volumes; see `.factory/storage-matrix.md`. | `filesystem-matrix` |
| 5 | Build the deployable static site. | Developer instruction |
| 4 | Build both web targets. | Developer instruction |
| 6 | Run the native app during development. | Developer instruction |
| 5 | `.github/workflows/release.yml` runs for `v*` tags. | `release-tag-trigger` |
| 12 | It builds Tauri installers for macOS arm64 and x86_64, Windows, and Linux. | `release-platform-builds` |
| 15 | Before publication, it checks that the AppImage includes recovery-file import and the tagged source commit. | `release-recovery-import` |
| 11 | The workflow attaches installers, `SHA256SUMS`, and `latest.json` to the GitHub Release. | `release-attachments` |
| 6 | The scanner reads chosen folders locally. | `local-only`, `read-only` |
| 7 | The website sends no archive data away. | `local-only` |
| 13 | The product verification endpoint forwards only the pasted token to Sociobot’s license service. | `license-privacy` |
| 10 | It allows 10 requests per client address in 10 minutes. | `license-rate-limit` |
| 10 | After that, it returns HTTP 429 with a `Retry-After` value. | `license-rate-limit` |
| 8 | See `/privacy` and `/terms` on the product site. | Instruction |
| 9 | The source code is available under the MIT License. | Confirmed by `LICENSE` |

README headings name their sections: Family Archive Check, Try the sample, Install, Use the app, Develop and test, Release, and Privacy and license. All buttons and links use result-naming verbs. No copy finding is recorded.

## Demo and sandbox

- One click on the primary action and direct `/demo` both opened a completed result, not a setup screen.
- The first demo screen showed `ONE ARCHIVE ITEM NEEDS ATTENTION`, six main files, five copy files, both realistic locations, and missing `2024/01-New-year/fireworks.mp4`.
- The persistent banner read `Demo — sample data, nothing is saved` and included working **Reset demo** and **Start for real** controls.
- Reset restored the missing-video fixture. Start for real opened the blank folder check and removed sample content.
- Seeded real `family-archive-check:profiles` and `review5:sentinel` local-storage values remained byte-for-byte unchanged after demo entry, reset, and exit. Direct demo entry began with no local-storage keys or cookies.
- The direct `/demo` request log contained only the product document, JS, and CSS. It contained no tracker, font, license, AI, or other off-origin request.
- `@claim:offline-reload` passed from the clean clone using its separate offline browser context.

## Claims and local verification

The repository was cloned cleanly to `/tmp/family-archive-check-review5-clean.K7oTOd`, checked out at `e32c0ff25d9a02179fad10cd941c14ce7f87a1db`, and installed with `npm ci`. Every exact `test` command in `.factory/claims.json` was run independently. All 33 passed; logs are `/tmp/family-archive-check-review5-<claim-id>.log`.

| Declared claim IDs with PASS results |
|---|
| `demo-ready`, `file-list-export`, `handoff-sheet`, `local-only`, `offline-reload` |
| `compare-copies`, `media-readable`, `repeatable-sample`, `media-sample-count`, `complete-file-count`, `common-media-codecs` |
| `filesystem-matrix`, `independent-folders`, `free-limit`, `read-only`, `capture-year`, `paid-license` |
| `platform-download`, `demo-isolation`, `license-privacy`, `license-rate-limit`, `installer-checksum`, `payment-policy` |
| `free-exports`, `accessibility-not-gated`, `no-face-recognition`, `no-tracking` |
| `release-tag-trigger`, `release-platform-builds`, `release-attachments`, `release-recovery-import` |
| `recovery-import`, `recovery-import-private` |

`npm test` passed (28 Vitest and 34 Playwright tests). `npm run typecheck`, `npm run lint`, and `npm run build` passed. The build produced `dist/site` and `dist/app`; initial site JavaScript is 15.40 KB gzip across chunks and CSS is 4.40 KB gzip.

The landing, README, privacy page, terms, demo, and result UI were cross-checked against `.factory/claims.json`. Each visitor-relevant statement has a matching declared claim or is an instruction, legal limitation, image description, or developer-only instruction. No unlisted claim is recorded.

## Earlier finding confirmation

Every earlier `review-*.md`, `polish-*.md`, and prior handoff was read. The following checks confirm each earlier finding remains fixed in live behavior and source/tests.

| Earlier IDs | Current confirmation |
|---|---|
| F-1-1 | `paid-license` performs the 501-file boundary, recorded verification, completed check, profile save, reload, and reuse. |
| F-1-2 | `handoff-sheet` checks the recovery heading, four steps, locations, result, and Print action. |
| F-1-3 | `installer-checksum` covers valid and tampered shell cases; Windows CI has the PowerShell harness. |
| F-1-4 | `demo-isolation` and this live check preserve seeded real storage through reset and exit. |
| F-1-5 | Payment and order handling are registered in `payment-policy`. |
| F-1-6 | `free-exports` and `accessibility-not-gated` prove unlicensed availability. |
| F-1-7 | Landing and demo display the checked six-main/five-copy fixture. |
| F-1-8 | `no-face-recognition` checks source, dependencies, and camera permissions. |
| F-1-9 | Audience, action, and all three facts fit both required first viewports. |
| F-1-10 | Route-specific title, description, canonical, and social metadata were confirmed live. |
| F-1-11 | `/print/sample-family-archive` is in the live sitemap. |
| F-1-12 | Unknown routes return the designed shared-shell HTTP 404. |
| F-1-13 | Process copy now says count, open a sample, and check changed matches. |
| F-1-14 | Public copy uses main archive, independent copy, and recovery file list. |
| F-1-15 | Walkthrough says both folders are counted and tested the same way. |
| F-1-16 | `Enter license token` reveals the intended field. |
| F-1-17 | README states that archive data stays on the computer. |
| F-1-18 | README states that the sample is repeatable. |
| F-1-19 | README uses the plain terminal-download wording. |
| F-1-20 | Visitor copy says the download is checked for changes; SHA-256 stays developer-facing. |
| F-1-21 | Folder guidance says connected drive or network folder. |
| F-1-22 | README directly distinguishes website and desktop drive checks. |
| F-1-23 | README says build the deployable static site. |
| F-1-24 | Privacy copy says Sociobot’s license service. |
| F-1-25 | The unsupported unsigned-preview statement is absent. |
| F-2-1 | Only the sample handoff has a public print route; unknown print routes are actual 404s. |
| F-2-2 and V8-1 | Result headings derive from the actual issue count. |
| F-2-3 | README, picker, and walkthrough use the same public terminology. |
| F-2-4 | Fresh demo entry has no account controls, redirect, or authentication cookie. |
| F-2-5 | Unsupported signing copy remains absent. |
| F-2-6 | `release-tag-trigger` parses the `v*` release trigger. |
| F-2-7 | `release-platform-builds` checks the four desktop build targets. |
| F-2-8 | `release-attachments` checks installers, `SHA256SUMS`, and `latest.json`. |
| F-2-9 | `recovery-import` and `recovery-import-private` check local restored-folder comparison. |
| F-2-10 | The walkthrough heading names the desktop folder-to-report flow. |
| F-2-11 | README says matching installer. |
| F-2-12 | Purchase copy says Dodo handles questions or requests about the order. |
| F-3-1 | `media-sample-count` proves exactly 48 sampled files from a 60-file native fixture. |
| F-4-1 | `platform-download` covers macOS, Windows, Linux, iOS, and Android; phones receive no desktop installer. |
| F-4-2 | Purchase and release links use `rel=external` and accessible external-destination text. |
| Controller-3-1 | Clean-clone browser runs own their preview server; the offline case owns and closes only its private context. |

No earlier finding is reopened.

## Structure, routing, links, accessibility, and identity

- `/`, `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive` returned HTTP 200. `/review5-missing` returned the designed HTTP 404.
- Each route had one h1 and one main landmark. Titles, descriptions, canonicals, and OG URLs were route-specific. The home title was `Family Archive Check — Check photo backup copies`.
- Header and footer were present across standard routes with skip link, wordmark, Demo, Check folders, Privacy, Privacy, Terms, product description, Param Factory attribution, and version line.
- All internal links found from the landing route returned 200. Product external actions disclose their external destination.
- Browser console checks found no error on standard routes. The expected browser network error for the intentionally requested 404 was not treated as a product-console failure.
- Live Axe scans at 390 px returned zero violations, including zero serious and critical violations, on all six public routes and the 404. Keyboard and focus coverage also passed in the Playwright suite.
- CSP, `Referrer-Policy`, `Permissions-Policy`, favicon, Apple touch icon, `robots.txt`, sitemap, social image, reduced-motion rules, and 44 px controls were confirmed.
- The paper/ink art-deco transit-poster system, original archive-route illustration, rails, stepped geometry, narrow display type, serif body type, and limited route-marker motion match `.factory/design.md`. The layout does not use a generic SaaS-card or gradient-hero pattern.

## Missed leverage

No missing feature is recorded. Importing a recovery file list closes the expected export-and-recovery loop. Cloud sync, photo hosting, and people identification are explicit non-goals. The core comparison is local and deterministic, so an AI request would add privacy and cost obligations without improving the stated job.

## What would make this perfect

This round identifies no remaining change. Continue to rerun the cold phone read, direct demo isolation, all declared claims, and route checks for each release so the zero-finding condition remains confirmed.
