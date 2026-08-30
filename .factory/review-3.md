# Adversarial first-read review 3 — Family Archive Check

Reviewed 2026-08-30 against `https://family-archive-check.sociobot.in` and clean-clone commit `4c2cc445cdef25f4f3ceddec7452231a6b702d27`.

## Verdict: FAIL

There is one minor finding and no blocking finding. The cold first read, one-click demo, privacy sandbox, all declared claim commands, routing, accessibility, links, and historical repairs pass. This is still a fail: the landing presents one exact quantitative product fact that has no matching claim entry. PASS requires zero findings and no untested public claim.

## Findings

### Minor

#### F-3-1 — The landing’s 48-sample count is not a registered claim

- Exact quote/location: landing walkthrough, step 2: “Reading 48 samples.”
- Evidence: the text is a concrete quantitative statement. `.factory/claims.json` has `repeatable-sample`, but its claim is only “The same archive selects the same repeatable media sample on each check,” and its `where` field is “README and folder-check”; it does not name the 48-item count or this landing location. The tagged Rust test happens to assert 48 while testing repeatability, but the public count has no claim entry of its own.
- Why this matters: a visitor may use the visible count to understand how much checking is performed. A later change to the count or landing copy could be unreviewed as a public promise.
- Concrete fix: add a distinct `media-sample-count` claim, for example “Checks at most 48 media files per folder,” with `where: "landing walkthrough and check status"` and an exact tagged test using more than 48 valid media files. Or remove “Reading 48 samples” from the landing walkthrough.

## Cold first read

Fresh Chromium contexts opened the deployed home page without scrolling at 390×844 and 1440×900.

| Question | Answer from the first screen | Exact supporting text |
|---|---|---|
| What does it do? | Checks that a household photo/video archive has an independent copy. | “Check every family photo and video has a copy” |
| For whom? | Household archivists before handing photos and videos to family. | “For household archivists who need a clear answer before handing photos and videos to family.” |
| What should I click first? | Try the finished sample check. | “Try it with sample data” and “See a finished two-folder check.” |

All three answers are available in the initial viewport. The complete Private, Offline, and Price facts end at approximately y=672 on the mobile viewport and y=735 on the desktop viewport. This gate passes.

## Copy audit

Word counts treat hyphenated terms, file names, URLs, and version strings as one word. No reviewed sentence exceeds 22 words. No banned marketing adjective appears. `F-3-1` is the only copy/claim flag.

### Landing page sentences

| Words | Sentence | Result |
|---:|---|---|
| 9 | Check every family photo and video has a copy. | — |
| 15 | For household archivists who need a clear answer before handing photos and videos to family. | — |
| 5 | See a finished two-folder check. | — |
| 5 | Files stay on this device. | `local-only` |
| 6 | Works offline after the first visit. | `offline-reload` |
| 4 | Free for 500 files. | `free-limit` |
| 4 | Household license: $29 once. | `paid-license` |
| 5 | One missing video needs attention. | `demo-ready` |
| 6 | The main archive has six items. | `demo-ready` |
| 5 | The independent copy has five. | `demo-ready` |
| 8 | Pick the main archive and one independent copy. | — |
| 14 | The app counts every file, opens a sample, and checks whether matching files changed. | `complete-file-count`, `media-readable`, `compare-copies` |
| 11 | Save a recovery file list (JSON) and print plain recovery steps. | `file-list-export`, `handoff-sheet` |
| 2 | Choose folders. | — |
| 5 | The app only reads them. | `read-only` |
| 3 | Reading 48 samples. | **F-3-1** |
| 10 | The app counts and tests both folders the same way. | `complete-file-count`, `repeatable-sample` |
| 8 | Keep the recovery file list beside the archive. | — |
| 13 | The app does not move, rename, edit, upload, or identify people in media. | `read-only`, `local-only`, `no-face-recognition` |
| 8 | Keep an independent backup and test recovery yourself. | Product limitation, not a capability claim |
| 10 | Only an exported recovery file list writes a new file. | `file-list-export`, `read-only` |
| 10 | Pay $29 once for unlimited checks and saved folder profiles. | `paid-license` |
| 12 | Dodo Payments takes your payment and handles questions or requests about your order. | `payment-policy` |
| 3 | v0.1.9 is ready. | `platform-download` |
| 7 | Choose the installer for this device. | `platform-download` |
| 6 | Check family photo copies before handoff. | Product one-liner |
| 9 | Version 0.1.9 · Generated art disclosed in the design notes. | Provenance link to `.factory/design.md` |

The hero-image alt text, “Two archive cases travel on separate rails through a verification gate.” (11 words), describes the illustration’s purpose. Transient release copy is also plain and under the cap: “Checking the latest release for this device.” (7), “Downloads are being published.” (4), and “The release page shows current progress.” (7).

Landing headings name their sections: “How the check works,” “See the desktop check from folder choice to report,” “Your folders stay unchanged,” “Check archives larger than 500 files,” and “Install for full folder checks.” Buttons name outcomes: “Try it with sample data,” “Open this sample check,” “Buy household license — $29,” “Enter license token,” and “Download for Linux.” The terms `main archive`, `independent copy`, and `recovery file list` are consistent.

### README sentences

| Words | Sentence | Result |
|---:|---|---|
| 13 | Check that family photos and videos have a readable, independent copy before handoff. | — |
| 14 | Family Archive Check is a desktop app that keeps archive data on your computer. | `local-only` |
| 11 | It compares a main archive with an independent copy on another drive. | `compare-copies` |
| 17 | It tests the same repeatable sample of photos and videos, then reports missing, changed, and unreadable files. | `repeatable-sample`, `compare-copies`, `media-readable` |
| 15 | It also exports and imports a recovery file list (JSON) and a printable handoff sheet. | `file-list-export`, `recovery-import`, `handoff-sheet` |
| 14 | It does not host photos, identify faces, sync files, or change the selected folders. | `local-only`, `no-face-recognition`, `read-only` |
| 2 | Open https://family-archive-check.sociobot.in/demo. | — |
| 10 | The sample opens without an account and contains one missing video. | `demo-ready` |
| 8 | Demo data stays separate from real folder data. | `demo-isolation` |
| 14 | The product site detects macOS, Windows, or Linux and links to the matching installer. | `platform-download` |
| 9 | You can also download the app from a terminal: | — |
| 14 | Both helpers confirm that the download is unchanged, then place the installer in Downloads. | `installer-checksum` |
| 6 | Open the downloaded installer to finish. | — |
| 11 | Developer note: each helper verifies the published SHA-256 checksum before saving the installer. | `installer-checksum`; appropriate developer detail |
| 5 | Choose the main archive folder. | — |
| 11 | Choose an independent copy on another connected drive or network folder. | `independent-folders` |
| 4 | Select Check both folders. | — |
| 6 | Review missing, changed, and unreadable items. | `compare-copies`, `media-readable` |
| 11 | Export the recovery file list (JSON) and print the handoff sheet. | `file-list-export`, `handoff-sheet` |
| 10 | The installed app blocks folders on the same storage device. | `independent-folders` |
| 17 | The website can spot the same folder name, but only the desktop app can confirm separate drives. | `independent-folders` |
| 8 | The free app checks up to 500 files. | `free-limit` |
| 12 | A $29 one-time household license enables unlimited checks and saved folder profiles. | `paid-license` |
| 8 | Recovery exports and accessibility are never paid features. | `free-exports`, `accessibility-not-gated` |
| 11 | Requirements: Node.js 22.12.x, Rust stable, and the Tauri 2 system dependencies. | Developer instruction |
| 12 | The scanner tests valid JPEG, PNG, HEIC, MP4, and MOV fixtures. | `common-media-codecs` |
| 14 | CI also scans those fixtures on APFS, NTFS, and exFAT volumes; see `.factory/storage-matrix.md`. | `filesystem-matrix` |
| 5 | Build the deployable static site: | Developer instruction |
| 4 | Build both web targets: | Developer instruction |
| 6 | Run the native app during development: | Developer instruction |
| 5 | `.github/workflows/release.yml` runs for `v*` tags. | `release-tag-trigger` |
| 11 | It builds Tauri installers for macOS arm64 and x86_64, Windows, and Linux. | `release-platform-builds` |
| 11 | The workflow attaches installers, `SHA256SUMS`, and `latest.json` to the GitHub Release. | `release-attachments` |
| 6 | The scanner reads chosen folders locally. | `local-only` |
| 7 | The website sends no archive data away. | `local-only` |
| 13 | The product verification endpoint forwards only the pasted token to Sociobot’s license service. | `license-privacy` |
| 10 | It allows 10 requests per client address in 10 minutes. | `license-rate-limit` |
| 10 | After that, it returns HTTP 429 with a `Retry-After` value. | `license-rate-limit` |
| 8 | See `/privacy` and `/terms` on the product site. | — |
| 9 | The source code is available under the MIT License. | Directly verified |

README headings (“Try the sample,” “Install,” “Use the app,” “Develop and test,” “Release,” and “Privacy and license”) name their sections. No inconsistent archive/output term, unexplained marketing phrase, or non-result-naming button was found.

## Demo and privacy sandbox

- One click on the hero action went to `/?demo=1`. The first screen already showed the attention result, six main files, five independent-copy files, and `2024/01-New-year/fireworks.mp4` as missing.
- The persistent banner read “Demo — sample data, nothing is saved,” with working **Reset demo** and **Start for real** controls.
- Export produced `family-archive-file-list-2026-08-28.json`, with `checkId: sample-family-archive` and the missing MP4.
- I seeded `family-archive-check:profiles` plus a sentinel before entering demo. The complete real local-storage map was byte-for-byte equal after demo entry, export, reset, and Start for real. No `demo:` key appeared; the real screen was blank and had no sample path.
- Demo-flow Playwright requests were product-origin assets only; no cookie was set. A fresh demo context reloaded successfully while offline after the service worker had installed, preserving the demo result and banner.
- The home page’s only external runtime request was the documented GitHub Releases request. No tracker, external font, external script, or runtime AI request appeared. No AI feature is missing: the brief’s folder comparison/readability job is deterministic and privacy-sensitive; sync is an explicit non-goal.

## Claims

The repository was cloned fresh to `/tmp/family-archive-check-review-3-clean.03xIYz` at `4c2cc445cdef25f4f3ceddec7452231a6b702d27`, followed by `npm ci --include=dev`. Every exact `test` command in `.factory/claims.json` was run independently. All 31 passed.

| Claim | Result | Claim | Result |
|---|---|---|---|
| demo-ready | PASS | file-list-export | PASS |
| handoff-sheet | PASS | local-only | PASS |
| offline-reload | PASS | compare-copies | PASS |
| media-readable | PASS | repeatable-sample | PASS |
| complete-file-count | PASS | common-media-codecs | PASS |
| filesystem-matrix | PASS | independent-folders | PASS |
| free-limit | PASS | read-only | PASS |
| capture-year | PASS | paid-license | PASS |
| platform-download | PASS | demo-isolation | PASS |
| license-privacy | PASS | license-rate-limit | PASS |
| installer-checksum | PASS | payment-policy | PASS |
| free-exports | PASS | accessibility-not-gated | PASS |
| no-face-recognition | PASS | no-tracking | PASS |
| release-tag-trigger | PASS | release-platform-builds | PASS |
| release-attachments | PASS | recovery-import | PASS |
| recovery-import-private | PASS |  |  |

`F-3-1` remains because a test incidentally asserting 48 is not an entry that identifies the landing’s count as a public claim.

## History verification

I read `.factory/review-1.md`, `.factory/review-2.md`, `.factory/polish-1.md`, `.factory/polish-2.md`, `.factory/polish-3.md`, and the preceding handoff. Every historical finding was rechecked against both live behavior and current code.

| Earlier finding | Live/code confirmation | Status |
|---|---|---|
| F-1-1 | Licensed fixture exercises 501-file check, verification, save, reload, and profile reuse. | Fixed |
| F-1-2 | Sample handoff includes its heading, four steps, locations, result, and Print action. | Fixed |
| F-1-3 | Shell checks execute; PowerShell valid/tampered harness is present. | Fixed |
| F-1-4 | Seeded real browser storage survived demo export, reset, and exit exactly. | Fixed |
| F-1-5 | Checkout redirects to Dodo; policy claim test passes. | Fixed |
| F-1-6 | Unlicensed recovery export and accessibility tests pass. | Fixed |
| F-1-7 | Landing and demo display and test the 6/5 counts. | Fixed |
| F-1-8 | No-people-identification wording and policy test are present. | Fixed |
| F-1-9 | First-screen action and all facts fit at both required viewports. | Fixed |
| F-1-10 | Every public route has route-specific title, description, canonical, OG, and Twitter metadata. | Fixed |
| F-1-11 | `/print/sample-family-archive` is in the sitemap. | Fixed |
| F-1-12 | Unknown URLs return the designed 404 with the standard shell. | Fixed |
| F-1-13 | The process wording now explains counts, opening a sample, and changed files. | Fixed |
| F-1-14 | Public copy uses main archive, independent copy, and recovery file list consistently. | Fixed |
| F-1-15 | Walkthrough says both folders are counted and tested the same way. | Fixed |
| F-1-16 | “Enter license token” reveals the intended field. | Fixed |
| F-1-17 | README says data stays on the computer. | Fixed |
| F-1-18 | README says the same repeatable sample. | Fixed |
| F-1-19 | README calls terminal downloads plainly. | Fixed |
| F-1-20 | Visitor copy explains the unchanged download; algorithm detail stays developer-facing. | Fixed |
| F-1-21 | Folder wording says connected drive or network folder. | Fixed |
| F-1-22 | README directly distinguishes website and desktop drive checks. | Fixed |
| F-1-23 | README says build the deployable static site. | Fixed |
| F-1-24 | README says Sociobot’s license service. | Fixed |
| F-1-25 | Unsupported unsigned-preview copy is absent. | Fixed |
| F-2-1 | Real handoff stays in `/check`; only sample handoff is public; unknown print URL is HTTP 404. | Fixed |
| F-2-2 / V8-1 | Multi-item headings derive from the actual issue count. | Fixed |
| F-2-3 | README and walkthrough use the one public terminology set. | Fixed |
| F-2-4 | Sample reaches a finished result with no account UI, redirect, or auth cookie. | Fixed |
| F-2-5 | Unsupported signing claim is absent. | Fixed |
| F-2-6 | Release tag trigger is registered and tested. | Fixed |
| F-2-7 | Full desktop build matrix is registered and tested. | Fixed |
| F-2-8 | Release attachments are registered and tested. | Fixed |
| F-2-9 | Local recovery-list import and restored-folder comparison work. | Fixed |
| F-2-10 | Walkthrough heading names the desktop check and report. | Fixed |
| F-2-11 | README says matching installer. | Fixed |
| F-2-12 | Purchase copy says Dodo handles questions or requests about the order. | Fixed |
| Controller-3-1 | Test setup clears only stale FAC servers and Playwright owns a fresh preview server. | Fixed |

## Structure, links, accessibility, and identity

- Live `/`, `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive` returned 200. `/missing-review-3` and `/print/not-a-real-check` returned designed HTTP 404s.
- Each public route has one h1, one main landmark, `lang="en"`, route-specific metadata, a canonical URL, OG/Twitter data, favicon, social image, and visible Privacy/Terms footer links. Back/forward routing focuses and announces the new h1 in code; all routes use the same header/footer shell.
- All landing links returned 200 after redirects, including the checkout, release asset, Sociobot, and internal links. The 404 has a way home.
- Live Axe scans at 390px found no serious or critical violations on `/`, `/demo`, `/check`, `/privacy`, `/terms`, the sample handoff, or the designed 404. Standard routes produced no console errors. Touch targets, focus states, semantic landmarks, skip link, and reduced-motion rules are present.
- The paper/ink art-deco transit-poster system, original rail-and-archive-case art, stepped geometry, serif/body pairing, and restrained route-marker motion match `.factory/design.md` and are distinct from a generic SaaS template.

## What would make this perfect

Resolve F-3-1 by registering and testing the exact 48-media-sample statement or removing it from the landing. Then repeat this review from a clean browser context and clone. With that one public claim accounted for, the observed product is otherwise at a PASS-adjacent state.
