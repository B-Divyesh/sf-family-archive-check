# Adversarial first-read review 2 — Family Archive Check

Reviewed 2026-08-30 against the live site at `https://family-archive-check.sociobot.in` and clean-clone commit `154eab54fbc57be419b148646b002390eb7dadf2`.

## Verdict: FAIL

There are 12 findings: 3 blocking, 6 major, and 3 minor. The first screen and demo pass, and all 26 declared claim commands pass. The product still fails because a real handoff route breaks on reload, two earlier findings remain unfixed or half-fixed, several public claims are absent from `.factory/claims.json`, one landing heading is vague, two phrases are not plain, and the exported recovery file cannot be imported for a later recovery check.

## Findings

### Blocking

#### F-2-1 — Real and unknown handoff routes are broken

- Exact location: a real browser check opens `/print/<generated-check-id>` with h1 “How to recover this family archive,” but the title remains “Check folders — Family Archive Check.” Reloading that URL returns HTTP 200 with h1 “This page was not found,” the same wrong title, and a canonical URL for the nonexistent result. A cold `/print/not-a-real-check` behaves the same way.
- Source: `public/staticwebapp.config.json` rewrites every `/print/*` path to the SPA. `src/main.ts` keeps `currentResult` only in memory, falls back to `notFound()` when it is absent, and maps an unknown print route to `/check` metadata.
- Why this blocks: the site-structure contract requires deep links and reloads to keep the right state, and unknown URLs must be real 404s. A visitor can generate a handoff link, reload it, and lose the sheet behind a false HTTP 200 error page.
- Concrete fix: expose only `/print/sample-family-archive` as a public static route. Keep real-result printing inside `/check`, or persist the current result in a private, namespaced session store and restore it by ID. Remove the broad `/print/*` rewrite so unknown print URLs receive the designed HTTP 404. Add tests for the real print title, reload, an unknown print ID, canonical metadata, and status.

#### F-2-2 — The earlier multi-issue result heading defect remains live

- Reopens historical finding: `V8-1` from `.factory/handoff.md`.
- Exact quote/location: after a live check with two missing files, the h1 says “One archive item needs attention,” while the status immediately below says “2 items need attention.”
- Source: `src/main.ts` hard-codes `One archive item needs attention` for every non-ready result.
- Why this blocks: the history rule makes any unfixed earlier finding blocking. The page’s primary heading contradicts the result count.
- Concrete fix: derive the h1 from the issue count, using “One archive item needs attention” for one and “2 archive items need attention” for two. Add an end-to-end test with at least two discrepancies that asserts both the h1 and status.

#### F-2-3 — Earlier terminology finding F-1-14 is only half-fixed

- Reopens historical finding: `F-1-14` from `.factory/review-1.md`.
- Exact quotes/locations: README says “It compares a main folder with a copy on another drive,” and live `/check` says “Choose and read main folder,” while the landing page and terminology table use “main archive” and “independent copy.” The landing walkthrough also says “Export file list,” while the product term is “recovery file list.”
- Source: `README.md:5` and the landing walkthrough in `src/main.ts`.
- Why this blocks: the history rule makes a half-fixed earlier finding blocking. A first-time reader is still asked to map multiple names to the same inputs and output.
- Concrete fix: use “It compares a main archive with an independent copy on another drive.” Change the walkthrough control to “Export recovery file list.” Add a copy-policy test that rejects the shortened terms.

### Major

#### F-2-4 — “Works without an account” is an unlisted claim

- Exact quote/location: README, “The sample works without an account and contains one missing video.”
- Why this matters: `demo-ready` lists the finished sample and missing video, but no claim entry states or asserts that no account is required.
- Concrete fix: extend the `demo-ready` claim text and test to assert a fresh visitor reaches the populated demo without authentication, redirects, account controls, or auth cookies. Otherwise remove “without an account.”

#### F-2-5 — The unsigned-installer statement is an unlisted claim

- Exact quote/location: landing download section and README, “Your computer may warn you because this preview app is not yet signed.”
- Why this matters: `platform-download` checks a recorded release link and renders this sentence, but it does not verify the signing state of any macOS or Windows artifact. The claim is not named in `.factory/claims.json`.
- Concrete fix: add an `unsigned-preview` claim with release-artifact signature checks on macOS and Windows CI, or remove the signing statement.

#### F-2-6 — The release-trigger statement is an unlisted claim

- Exact quote/location: README, “`.github/workflows/release.yml` runs for `v*` tags.”
- Why this matters: no claim entry or tagged test protects this documented release behavior.
- Concrete fix: add `release-tag-trigger` to `.factory/claims.json` and a policy test that parses the workflow and asserts the `v*` tag trigger, or remove the sentence.

#### F-2-7 — The platform-build statement is an unlisted claim

- Exact quote/location: README, “It builds unsigned Tauri installers for macOS arm64 and x86_64, Windows, and Linux.”
- Why this matters: `platform-download` proves only one recorded detected-platform link. It does not prove the stated build matrix or signing state.
- Concrete fix: add `release-platform-builds` with a test of the matrix and completed release artifacts for every named target, or remove the sentence.

#### F-2-8 — The release-attachment statement is an unlisted claim

- Exact quote/location: README, “The workflow attaches installers, `SHA256SUMS`, and `latest.json` to the GitHub Release.”
- Why this matters: no manifest entry tests all three published artifact classes.
- Concrete fix: add `release-attachments` with a tagged test that inspects a fixture or published release and asserts the installers, `SHA256SUMS`, and `latest.json`, or remove the sentence.

#### F-2-9 — The recovery file list cannot be used for a later comparison

- Exact location: the product exports a machine-readable “recovery file list (JSON),” and the handoff sheet says “Compare the new folder with the recovery file list,” but no screen imports that file.
- Why this matters: during an actual recovery, a normal person cannot ask the app to verify a restored folder against the saved baseline. The most reusable recovery artifact stops at export.
- Concrete fix: add “Import recovery file list,” validate the local JSON, let the user choose a restored folder, and report missing, changed, and unreadable entries against the saved paths, sizes, and sampled fingerprints. Include a one-click demo fixture, keep processing local, and register import and privacy claims. AI and sync are not needed.

### Minor

#### F-2-10 — The walkthrough heading is vague and makes an unmeasured speed claim

- Exact quote/location: landing h2, “A short check, from folders to handoff.”
- Why this matters: “short” is not measured, and the heading does not plainly name the section as a product walkthrough.
- Concrete rewrite: “See the desktop check from folder choice to report.”

#### F-2-11 — “Matching release” is installer jargon

- Exact quote/location: README, “The product site detects macOS, Windows, or Linux and links to the matching release.”
- Why this matters: a visitor installs an app; they should not have to interpret release-management terminology.
- Concrete rewrite: “The product site detects macOS, Windows, or Linux and links to the matching installer.”

#### F-2-12 — “Returns” is ambiguous for a software license

- Exact quote/location: landing purchase section, “Dodo Payments takes the payment and handles order-related questions and returns.”
- Why this matters: “returns” does not say whether it means refunds, cancellations, or returning software.
- Concrete rewrite: “Dodo Payments takes your payment and handles questions or requests about the order.”

## Cold first read

Fresh Chromium contexts opened the live home page at 390×844 and 1440×900 with `scrollY = 0`.

- What it does, in my words: checks whether a main family photo and video archive has an independent copy.
- For whom: a household archivist preparing to hand the archive to family.
- First click: “Try it with sample data,” which says it will show a finished two-folder check.

The exact text that answered these questions was “Check every family photo and video has a copy,” “For household archivists who need a clear answer before handing photos and videos to family,” and “Try it with sample data.” All three facts also fit before the fold: mobile ends at y=672/844 and desktop at y=735/900. This gate passes.

## Copy audit

Counts treat hyphenated terms, URLs, versions, and file names as one word. Landing average: 7.9 words across 28 sentences. README average: 9.9 words across 41 sentences. Nothing exceeds 22 words, and no banned marketing word appears.

### Landing sentences

| Words | Sentence | Flag |
|---:|---|---|
| 15 | For household archivists who need a clear answer before handing photos and videos to family. | — |
| 5 | See a finished two-folder check. | — |
| 5 | Files stay on this device. | — |
| 6 | Works offline after the first visit. | — |
| 4 | Free for 500 files. | — |
| 4 | Household license: $29 once. | — |
| 11 | Two archive cases travel on separate rails through a verification gate. | —; image alt |
| 6 | The main archive has six items. | — |
| 5 | The independent copy has five. | — |
| 8 | Pick the main archive and one independent copy. | — |
| 14 | The app counts every file, opens a sample, and checks whether matching files changed. | — |
| 11 | Save a recovery file list (JSON) and print plain recovery steps. | — |
| 2 | Choose folders. | — |
| 5 | The app only reads them. | — |
| 10 | The app counts and tests both folders the same way. | — |
| 8 | Keep the recovery file list beside the archive. | — |
| 13 | The app does not move, rename, edit, upload, or identify people in media. | — |
| 8 | Keep an independent backup and test recovery yourself. | — |
| 10 | Only an exported recovery file list writes a new file. | — |
| 10 | Pay $29 once for unlimited checks and saved folder profiles. | — |
| 11 | Dodo Payments takes the payment and handles order-related questions and returns. | F-2-12 |
| 3 | v0.1.9 is ready. | —; covered by `platform-download` |
| 13 | Your computer may warn you because this preview app is not yet signed. | F-2-5 |
| 7 | Checking the latest release for this device. | —; transient state |
| 4 | Downloads are being published. | —; fallback state |
| 6 | The release page shows current progress. | —; fallback state |
| 6 | Check family photo copies before handoff. | — |
| 10 | Version 0.1.9 · Generated art disclosed in the design notes. | — |

### Landing headings, labels, and actions

| Words | Text | Type | Flag |
|---:|---|---|---|
| 4 | Recovery check · desktop app | label | — |
| 9 | Check every family photo and video has a copy | h1 | — |
| 5 | Try it with sample data | action | — |
| 1 each | Private / Offline / Price | fact labels | — |
| 5 | Sample check · 28 August 2026 | label | — |
| 5 | One missing video needs attention | h2 | — |
| 4 | Open this sample check | action | — |
| 2 | Three steps | label | — |
| 4 | How the check works | h2 | — |
| 3 | Choose two folders | h3 | — |
| 3 | Read and compare | h3 | — |
| 5 | Export the recovery file list | h3 | — |
| 4 | Inside the desktop app | label | — |
| 7 | A short check, from folders to handoff | h2 | F-2-10 |
| 3 | 1 · Main archive | walkthrough label | — |
| 2 | Choose folder | walkthrough control | — |
| 2 | 2 · Check | walkthrough label | — |
| 3 | Reading 48 samples | walkthrough status | —; the `repeatable-sample` sandbox asserts 48 |
| 2 | 3 · Report | walkthrough label | — |
| 4 | 1 item needs attention | walkthrough result | — |
| 3 | Export file list | walkthrough control | F-2-3 |
| 3 | Read-only by default | label | — |
| 4 | Your folders stay unchanged | h2 | — |
| 2 | Household license | label | — |
| 6 | Check archives larger than 500 files | h2 | — |
| 4 | Buy household license — $29 | action | — |
| 3 | Enter license token | action | — |
| 4 | Desktop app · unsigned preview | label | F-2-5 |
| 5 | Install for full folder checks | h2 | — |
| 3 | Download for Linux | action | — |
| 2 | View releases | fallback action | — |
| 3 | View release page | fallback action | — |

All real buttons and links use result-naming verbs. “Export file list” is a noninteractive walkthrough control, but it still teaches inconsistent product terminology.

### README sentences

| Words | Sentence | Flag |
|---:|---|---|
| 13 | Check that family photos and videos have a readable, independent copy before handoff. | — |
| 14 | Family Archive Check is a desktop app that keeps archive data on your computer. | — |
| 11 | It compares a main folder with a copy on another drive. | F-2-3 |
| 17 | It tests the same repeatable sample of photos and videos, then reports missing, changed, and unreadable files. | — |
| 13 | It also exports a recovery file list (JSON) and a printable handoff sheet. | — |
| 14 | It does not host photos, identify faces, sync files, or change the selected folders. | — |
| 2 | Open https://family-archive-check.sociobot.in/demo. | — |
| 11 | The sample works without an account and contains one missing video. | F-2-4 |
| 8 | Demo data stays separate from real folder data. | — |
| 14 | The product site detects macOS, Windows, or Linux and links to the matching release. | F-2-11 |
| 13 | Your computer may warn you because this preview app is not yet signed. | F-2-5 |
| 9 | You can also download the app from a terminal: | — |
| 14 | Both helpers confirm that the download is unchanged, then place the installer in Downloads. | — |
| 6 | Open the downloaded installer to finish. | — |
| 13 | Developer note: each helper verifies the published SHA-256 checksum before saving the installer. | —; appropriate developer detail |
| 5 | Choose the main archive folder. | — |
| 11 | Choose an independent copy on another connected drive or network folder. | — |
| 4 | Select Check both folders. | — |
| 6 | Review missing, changed, and unreadable items. | — |
| 11 | Export the recovery file list (JSON) and print the handoff sheet. | — |
| 10 | The installed app blocks folders on the same storage device. | — |
| 17 | The website can spot the same folder name, but only the desktop app can confirm separate drives. | — |
| 8 | The free app checks up to 500 files. | — |
| 12 | A $29 one-time household license enables unlimited checks and saved folder profiles. | — |
| 8 | Recovery exports and accessibility are never paid features. | — |
| 11 | Requirements: Node.js 22.12.x, Rust stable, and the Tauri 2 system dependencies. | —; developer section |
| 11 | The scanner tests valid JPEG, PNG, HEIC, MP4, and MOV fixtures. | — |
| 13 | CI also scans those fixtures on APFS, NTFS, and exFAT volumes; see .factory/storage-matrix.md. | —; developer section |
| 5 | Build the deployable static site: | — |
| 4 | Build both web targets: | — |
| 6 | Run the native app during development: | — |
| 5 | .github/workflows/release.yml runs for v* tags. | F-2-6 |
| 13 | It builds unsigned Tauri installers for macOS arm64 and x86_64, Windows, and Linux. | F-2-7 |
| 11 | The workflow attaches installers, SHA256SUMS, and latest.json to the GitHub Release. | F-2-8 |
| 6 | The scanner reads chosen folders locally. | — |
| 7 | The website sends no archive data away. | — |
| 13 | The product verification endpoint forwards only the pasted token to Sociobot’s license service. | — |
| 10 | It allows 10 requests per client address in 10 minutes. | — |
| 10 | After that, it returns HTTP 429 with a Retry-After value. | — |
| 8 | See /privacy and /terms on the product site. | — |
| 9 | The source code is available under the MIT License. | —; directly confirmed by `LICENSE` |

README headings are “Family Archive Check” (3), “Try the sample” (3), “Install” (1), “Use the app” (3), “Develop and test” (3), “Release” (1), and “Privacy and license” (3). Each names its section.

### Terminology

| Concept | Terms found | Result |
|---|---|---|
| Original collection | main archive; main folder | Inconsistent, F-2-3 |
| Independent collection | independent copy; copy | Inconsistent, F-2-3 |
| Comparison run | check | Consistent |
| Exported JSON record | recovery file list; file list | Inconsistent, F-2-3 |
| Printed instructions | handoff sheet | Consistent |
| Paid entitlement | household license | Consistent |
| Isolated example | demo / sample data | Consistent distinction |

## Demo and sandbox

- One click on the first-screen action opened `/?demo=1`.
- The first 390×844 demo screen already showed the persistent “Demo — sample data, nothing is saved” banner, the populated attention result, six main files, five copy files, and the missing `2024/01-New-year/fireworks.mp4`.
- Export downloaded `family-archive-file-list-2026-08-28.json`; it contained check ID `sample-family-archive` and the missing MP4.
- Reset demo restored the original result and missing file. Start for real opened `/check`, showed the empty picker, and removed sample content.
- A seeded `family-archive-check:profiles` record and `review-2:sentinel` remained byte-for-byte unchanged through entry, export, reset, and exit. No `demo:` key appeared.
- A clean direct `/demo` visit, service-worker reload, and offline reload requested only the product origin and set no cookies. Offline reload kept the demo result and banner.

The demo gate passes.

## Declared claim tests

The repository was cloned locally into `/tmp/fac-review-2-clean.c4tT0n`; the clone was clean at `154eab54fbc57be419b148646b002390eb7dadf2`. After `npm ci`, every exact `test` field ran independently.

| Claim | Exact command | Result |
|---|---|---|
| `demo-ready` | `npm run test:e2e -- --grep @claim:demo-ready` | PASS |
| `file-list-export` | `npm run test:e2e -- --grep @claim:file-list-export` | PASS |
| `handoff-sheet` | `npm run test:e2e -- --grep @claim:handoff-sheet` | PASS |
| `local-only` | `npm run test:e2e -- --grep @claim:local-only` | PASS |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS |
| `compare-copies` | `npm run test:unit -- --testNamePattern @claim:compare-copies` | PASS |
| `media-readable` | `npm run test:unit -- --testNamePattern @claim:media-readable` | PASS |
| `repeatable-sample` | `cargo test --manifest-path src-tauri/Cargo.toml claim_repeatable_sample` | PASS |
| `complete-file-count` | `cargo test --manifest-path src-tauri/Cargo.toml claim_complete_file_count` | PASS |
| `common-media-codecs` | `cargo test --manifest-path src-tauri/Cargo.toml claim_common_media_codecs` | PASS |
| `filesystem-matrix` | `npm run test:storage-matrix` | PASS |
| `independent-folders` | `npm run test:unit -- --testNamePattern @claim:independent-folders` | PASS |
| `free-limit` | `npm run test:unit -- --testNamePattern @claim:free-limit` | PASS |
| `read-only` | `cargo test --manifest-path src-tauri/Cargo.toml claim_read_only` | PASS |
| `capture-year` | `cargo test --manifest-path src-tauri/Cargo.toml claim_capture_year` | PASS |
| `paid-license` | `npm run test:e2e -- --grep @claim:paid-license` | PASS |
| `platform-download` | `npm run test:e2e -- --grep @claim:platform-download` | PASS |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS |
| `license-privacy` | `npm run test:unit -- --testNamePattern @claim:license-privacy` | PASS |
| `license-rate-limit` | `npm run test:unit -- --testNamePattern @claim:license-rate-limit` | PASS |
| `installer-checksum` | `npm run test:unit -- --testNamePattern @claim:installer-checksum` | PASS |
| `payment-policy` | `npm run test:e2e -- --grep @claim:payment-policy` | PASS |
| `free-exports` | `npm run test:e2e -- --grep @claim:free-exports` | PASS |
| `accessibility-not-gated` | `npm run test:e2e -- --grep @claim:accessibility-not-gated` | PASS |
| `no-face-recognition` | `npm run test:unit -- --testNamePattern @claim:no-face-recognition` | PASS |
| `no-tracking` | `npm run test:e2e -- --grep @claim:no-tracking` | PASS |

Summary: 26/26 exact commands passed. No listed claim test failed. Findings F-2-4 through F-2-8 are public statements that still lack their own manifest entries.

The clean-clone aggregate also passed `npm test` (23 Vitest and 29 Playwright tests), `npm run typecheck`, `npm run lint`, and `npm run build`. The build produced `dist/site` and `dist/app`. Site JavaScript totals 39,248 bytes raw, about 14 KB gzip.

## History verification

Files reviewed: `.factory/review-1.md`, `.factory/polish-1.md`, and `.factory/handoff.md`.

| Earlier finding | Live and source confirmation | Status |
|---|---|---|
| F-1-1 paid behavior | The tagged test performs the 501-file boundary, successful verification, check, profile save, reload, and reuse. | Fixed |
| F-1-2 handoff assertions | The tagged test asserts the heading, four steps, locations, summary, and Print action; live sample sheet matches. | Fixed |
| F-1-3 both installer helpers | Shell valid/tampered cases run locally; the Windows workflow executes `tests/installers.ps1`. | Fixed |
| F-1-4 demo isolation | Clean storage comparison and the independent live sentinel check pass. | Fixed |
| F-1-5 payment policy | `payment-policy` follows live checkout to Dodo and checks its policy text. | Fixed |
| F-1-6 free exports/accessibility | Both tagged claims pass without a license. | Fixed |
| F-1-7 preview counts | Landing and demo both show and test 6/5. | Fixed |
| F-1-8 face-identification boundary | Copy is plain; dependency/source/permission policy test passes. | Fixed |
| F-1-9 first-screen facts | All facts end at y=672 mobile and y=735 desktop. | Fixed |
| F-1-10 route metadata | Every route named by the earlier finding updates title, description, canonical, OG, and Twitter metadata. | Fixed; F-2-1 covers a newly exercised real-result route |
| F-1-11 sitemap | The sample print route is listed. | Fixed |
| F-1-12 404 shell | The deployed generic 404 has the standard shell and returns HTTP 404. | Fixed; F-2-1 covers the separate wildcard-print route |
| F-1-13 jargon | The live process sentence uses counts, opening a sample, and changed files. | Fixed |
| F-1-14 terminology | “Recovery file list” is mostly standardized, but README still says “main folder”/“copy” and the walkthrough says “Export file list.” | **Half-fixed; reopened as F-2-3** |
| F-1-15 walkthrough clarity | Live copy says both folders use the same count and test. | Fixed |
| F-1-16 license action | Live action says “Enter license token” and focuses the input. | Fixed |
| F-1-17 “local-first” | README says the app keeps archive data on the computer. | Fixed |
| F-1-18 “deterministic sample” | README says “the same repeatable sample.” | Fixed |
| F-1-19 command-line helper label | README says “download the app from a terminal.” | Fixed |
| F-1-20 visitor-facing SHA-256 | Visitor copy explains the unchanged download; SHA-256 is confined to a developer note. | Fixed |
| F-1-21 “mounted location” | README says “connected drive or network folder.” | Fixed |
| F-1-22 “browser fallback” | README directly contrasts the website and desktop app. | Fixed |
| F-1-23 internal work-order wording | README says “Build the deployable static site.” | Fixed |
| F-1-24 “billing API” | README says “Sociobot’s license service.” | Fixed |
| F-1-25 unsigned-warning wording | The visitor-facing consequence is plain. Its claim registration is a separate issue, F-2-5. | Fixed as copy |
| V8-1 multi-issue h1 | Live two-missing-file result still says “One archive item needs attention”; source is hard-coded. | **Unfixed; reopened as F-2-2** |

The cold-load focus and result-contrast repairs referenced by review 1 also remain fixed. Cold load leaves focus on the body; SPA navigation and Back focus and announce the new h1. Live Axe reports no contrast violation.

## Structure, routing, links, accessibility, and identity

- `/`, `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive` return 200. A generic missing path returns the designed page with HTTP 404. Dynamic print routes fail as described in F-2-1.
- Standard public routes have one h1, one main landmark, `lang="en"`, ordered headings, route-specific titles under 60 characters, descriptions, canonicals, OG/Twitter fields, SVG favicon, and a 180×180 apple-touch icon. The social image is 1200×630.
- SPA navigation and browser Back update the URL, scroll to the top, focus the h1, and announce it through the live region.
- Every discovered site and README link returned 200 after redirects, including checkout, the detected Linux asset, Sociobot, installers, Tauri prerequisites, and the repository.
- Independent Axe scans at 390×844 and 1440×900 found zero violations on `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and the real 404. No route overflowed horizontally.
- `/opt/fleet/lib/verify-url.sh` passed after using a fresh evidence directory: no console errors, one h1, `lang`, main, image alt, and button labels.
- Direct demo traffic is same-origin only. The landing makes the documented GitHub release request. No cookies, third-party fonts, trackers, or runtime AI endpoints appeared.
- The art-deco transit-poster composition, archive cases, rails, paper/ink palette, stepped shapes, generated original art, and restrained route motion are distinct and product-specific. It is not a generic SaaS template.

## Missed leverage

F-2-9 records the missing import-and-compare recovery step. No AI feature is justified: folder enumeration, media parsing, fingerprint comparison, and recovery verification are deterministic and privacy-sensitive. Cloud sync is an explicit non-goal. A local recovery-list import closes the obvious loop without weakening the product’s privacy promise.

## What would make this perfect

Resolve all 12 findings, then rerun this review from a clean browser and clone. The minimum perfect state is: real handoff views survive their supported navigation model and unknown print URLs return real 404s; multi-item results use the true count; one term is used for each input and output; every public claim has a named observable test; the walkthrough and purchase copy are literal; and a saved recovery file list can verify a restored folder. PASS requires zero findings and no untested claim.
