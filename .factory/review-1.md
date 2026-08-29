# Adversarial first-read review 1 — Family Archive Check

Reviewed 2026-08-29 against the live site at `https://family-archive-check.sociobot.in` and commit `d565fa46fd169091c0b465e23cab616a1157baf6`.

## Verdict: FAIL

There are 25 findings: 8 major and 17 minor. There are no blocking findings: the first screen answers the three required questions, the demo works in one click, all listed claim commands pass, routing works, and the visual identity is distinct. The review still fails because PASS requires zero findings and no untested claim.

## Findings

### Major

#### F-1-1 — The paid-license claim test checks words, not the paid results

- Exact claim/location: `.factory/claims.json`, `paid-license`: “A $29 household license enables unlimited checks and saved profiles.”
- Evidence: `tests/e2e/claims.spec.ts` verifies the checkout URL, price copy, “License active,” and benefits copy. It never performs a check over 500 files or saves and reopens a folder profile. The separate `free-limit` unit test receives an already-active Boolean and does not prove that license verification unlocks the behavior.
- Impact: a broken entitlement or saved-profile implementation could pass while the purchase promise remains false.
- Fix: after a recorded successful license response, run a 501-file check, save a profile, reload, and verify that the profile can be used. Assert the unlicensed boundary in the same flow.

#### F-1-2 — The handoff-sheet test does not assert a handoff sheet

- Exact claim/location: `.factory/claims.json`, `handoff-sheet`: “Opens a printable recovery handoff sheet.” Its sandbox says to assert the recovery steps.
- Evidence: the test only checks the URL, demo banner, and that one `<main>` exists. It does not assert the recovery heading, four steps, archive locations, check result, or Print action.
- Impact: an empty page with one main landmark would satisfy the declared claim test.
- Fix: assert “How to recover this family archive,” all four numbered steps, both sample locations, the result summary, and “Print this sheet.”

#### F-1-3 — The “each helper” checksum claim executes only the shell helper

- Exact claim/location: README: “Both helpers download the current release, verify its SHA-256 checksum, and place it in Downloads.” Claim `installer-checksum` says each command-line helper does this.
- Evidence: the test runs `public/install.sh` in a temporary home. It only applies regular-expression and source-order checks to `public/install.ps1`.
- Impact: PowerShell can fail at runtime while the claim test remains green.
- Fix: execute `install.ps1` under PowerShell in Windows CI with a temporary Downloads directory; test both a valid checksum and rejection of a tampered download.

#### F-1-4 — The demo-isolation regression test does not check real storage

- Exact claim/location: `.factory/claims.json`, `demo-isolation`: “Demo data stays separate from real folder data.”
- Evidence: the automated test only confirms that the sample filename disappears after navigating to `/check`. It does not seed real storage, mutate/reset the demo, or compare storage before and after.
- Impact: a later demo write to the real namespace would not be caught.
- Fix: seed a real-profile sentinel, enter `/demo`, export and reset, leave the demo, and assert exact sentinel/profile equality plus the absence of `demo:` writes to real keys.
- Current live behavior: manual verification passed; the seeded real-profile record and sentinel were unchanged. This finding is test coverage, not a current data leak.

#### F-1-5 — Payment and refund statements are unlisted claims

- Exact quote/location: landing purchase section: “Sociobot is the merchant of record. Refunds are handled there.”
- Evidence: no `.factory/claims.json` entry names merchant-of-record or refund handling. The live checkout link returned 200 and redirected through Dodo, but that does not verify the policy statements.
- Impact: visitors may rely on payment and refund responsibility when deciding to buy.
- Fix: add a claim backed by billing-product metadata and checkout policy assertions, or remove these sentences. Plain rewrite if verified: “Sociobot takes the payment and handles refunds.”

#### F-1-6 — The free-feature statement is an unlisted gating claim

- Exact quote/location: README, “The free app checks up to 500 files. A $29 one-time household license enables unlimited checks and saved folder profiles. Recovery exports and accessibility are never paid features.” The third sentence is not registered.
- Evidence: no claim entry proves that exports and accessibility remain available without a license.
- Impact: a paywall regression can violate a documented promise without failing the claim suite.
- Fix: add `free-exports` and `accessibility-not-gated` entries with observable unlicensed tests, or remove the sentence.

#### F-1-7 — The landing sample counts are unlisted quantitative claims

- Exact quote/location: live preview: “The main archive has six items. The independent copy has five.”
- Evidence: `demo-ready` checks the heading, missing filename, and demo banner, but not either count.
- Impact: the landing preview can disagree with the demo while every declared claim passes.
- Fix: expand the registered demo claim and assert the 6/5 counts on the preview and demo, or remove the numeric preview.

#### F-1-8 — The face-identification boundary is an unlisted privacy claim

- Exact quote/location: landing privacy section: “It does not identify faces or replace a backup tool.”
- Evidence: no claim entry covers the face-identification statement.
- Impact: this is a privacy-relevant product boundary that visitors can rely on.
- Fix: register a policy test that rejects face-recognition/ML dependencies and requests, or remove the face-identification clause. Keep the backup limitation as a separately testable statement.

### Minor

#### F-1-9 — The three required facts do not fully fit in the first viewport

- Exact location: 390×844 and 1440×900 cold landing viewports.
- Evidence: on mobile the Price value continues below the 844 px fold; on desktop the Price row starts at y=894 and is clipped by the 900 px viewport.
- Impact: the mandatory first-screen privacy/offline/price set requires scrolling on both tested sizes.
- Fix: reduce hero vertical padding/action spacing or compact the fact rows so the complete Price line ends inside the initial viewport.

#### F-1-10 — Non-home routes publish home-page metadata

- Exact location: `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive`.
- Evidence: route titles change, but every route keeps canonical `https://family-archive-check.sociobot.in/`, the home description, and home Open Graph/Twitter title and description.
- Impact: shared links and search indexing describe and canonicalize real routes as the landing page.
- Fix: update canonical, description, Open Graph, and Twitter metadata on every render; use the current absolute route and route-specific plain copy.

#### F-1-11 — The sitemap omits a public product route

- Exact location: `public/sitemap.xml` omits `/print/sample-family-archive`, which is a working, public demo route.
- Impact: the “every route” sitemap contract is not met.
- Fix: add the sample handoff route, or mark it non-indexable and document why it is intentionally excluded.

#### F-1-12 — The deployed 404 does not use the standard site shell

- Exact location: an unknown URL returns `public/404.html` with header “Family Archive Check” and footer “Privacy · Terms.”
- Evidence: it lacks the skip link, FAC wordmark treatment, Demo/Check folders navigation, product one-liner, Param Factory attribution, and version/build line present on every SPA route.
- Impact: the error route feels like a separate mini-site and fails the consistent header/footer requirement.
- Fix: give the static 404 the same semantic header, skip link, navigation, footer content, and identity tokens as the app shell while retaining the real 404 status.

#### F-1-13 — The process explanation uses unexplained technical jargon

- Exact quote/location: landing, How it works: “The app counts files, validates media samples, and compares hashes.”
- Impact: “validates” and “hashes” do not tell a non-technical family organizer what is checked.
- Fix: “The app counts every file, opens a sample, and checks whether matching files changed.”

#### F-1-14 — One output has three names, and two are jargon

- Exact locations: “Hand over the record,” “recovery manifest,” “JSON recovery manifest,” and “portable JSON recovery manifest.”
- Impact: “record,” “manifest,” and “JSON manifest” appear to be different outputs; “manifest” and “JSON” are unexplained.
- Fix: use “recovery file list” everywhere. Rewrite the heading as “Export the recovery file list” and introduce the format once as “a recovery file list (JSON).”

#### F-1-15 — A walkthrough sentence does not name the check

- Exact quote/location: landing walkthrough: “See both folders use the same checks.”
- Impact: “same checks” is vague without surrounding visuals.
- Fix: “The app counts and tests both folders the same way.”

#### F-1-16 — The license disclosure button names an action it does not perform

- Exact quote/location: landing purchase section button: “Have a license? Paste it.”
- Evidence: clicking reveals an input; it does not paste anything.
- Impact: the action result is unclear and the question fragment is not a result-naming verb.
- Fix: “Enter license token.”

#### F-1-17 — README uses “local-first” without explaining it

- Exact quote: “Family Archive Check is a local-first desktop app for household archivists.”
- Impact: “local-first” is product jargon.
- Fix: “Family Archive Check is a desktop app that keeps archive data on your computer.”

#### F-1-18 — README uses “deterministic sample” instead of the user-visible behavior

- Exact quote: “It validates a deterministic sample of media, then reports missing, changed, and unreadable files.”
- Impact: “deterministic” does not help a first-time user understand what is sampled.
- Fix: “It tests the same repeatable sample of photos and videos, then reports missing, changed, and unreadable files.”

#### F-1-19 — README labels the installers as “command-line download helpers”

- Exact quote: “Command-line download helpers are also available:”
- Impact: the phrase is more technical than the task.
- Fix: “You can also download the app from a terminal:”

#### F-1-20 — README names SHA-256 without explaining the outcome

- Exact quote: “Both helpers download the current release, verify its SHA-256 checksum, and place it in Downloads.”
- Impact: “SHA-256 checksum” is unexplained security jargon.
- Fix: “Both helpers confirm that the download is unchanged, then place the installer in Downloads.” Keep the algorithm in a developer note.

#### F-1-21 — README uses “mounted location” in the primary instructions

- Exact quote: “Choose an independent copy on another drive or mounted location.”
- Impact: “mounted location” is platform jargon.
- Fix: “Choose an independent copy on another connected drive or network folder.”

#### F-1-22 — README uses “browser fallback” instead of naming the website

- Exact quote: “The browser fallback detects repeat selections by folder name but cannot identify physical drives.”
- Impact: “fallback” does not say where the limitation applies.
- Fix: “The website can spot the same folder name, but only the desktop app can confirm separate drives.”

#### F-1-23 — README exposes internal factory wording

- Exact quote: “Build the static deploy exactly as the work order expects:”
- Impact: “work order” has no meaning for a repository user.
- Fix: “Build the deployable static site:”

#### F-1-24 — README names an API where the service name is enough

- Exact quote: “A license check sends only the pasted license token to the Sociobot billing API.”
- Impact: “API” is unnecessary implementation language in the privacy explanation.
- Fix: “A license check sends only the pasted token to Sociobot’s license service.”

#### F-1-25 — The unsigned-build warning explains the implementation, not the consequence

- Exact quote/location: live download section and README: “Builds are unsigned until the operator adds signing certificates.”
- Impact: “operator” and “signing certificates” are release-engineering terms; the visitor needs to know what will happen.
- Fix: “Your computer may warn you because this preview app is not yet signed.”

## Cold first read

Fresh Chromium contexts were opened without scrolling at 390×844 and 1440×900.

- What it does: compares a main family photo/video archive with an independent copy and reports what needs attention.
- For whom: a household archivist preparing to hand photos and videos to family.
- First click: “Try it with sample data,” which says it will show a finished two-folder check.

The exact first-screen text that answered these questions was “Check every family photo has a copy,” “For household archivists who need a clear answer before handing photos and videos to family,” and “Try it with sample data.” This requirement passes. The clipped fact rows are recorded separately as F-1-9.

## Copy audit

Word counts treat hyphenated terms, URLs, versions, and file names as one word. No sentence exceeds 22 words. Landing average: 7.0 words across 26 observed sentences. README average: 9.4 words across 36 sentences. No attached-skill banned marketing word appears.

### Landing sentences

| Words | Sentence | Flag |
|---:|---|---|
| 15 | For household archivists who need a clear answer before handing photos and videos to family. | — |
| 5 | See a finished two-folder check. | — |
| 5 | Files stay on this device. | — |
| 6 | Works offline after the first visit. | — |
| 4 | Free for 500 files. | — |
| 4 | Household license: $29 once. | — |
| 11 | Two archive cases travel on separate rails through a verification gate. | — |
| 6 | The main archive has six items. | F-1-7 |
| 5 | The independent copy has five. | F-1-7 |
| 8 | Pick the main archive and one independent copy. | — |
| 10 | The app counts files, validates media samples, and compares hashes. | F-1-13 |
| 9 | Export a recovery manifest and print plain recovery steps. | F-1-14 |
| 2 | Choose folders. | — |
| 5 | The app only reads them. | — |
| 7 | See both folders use the same checks. | F-1-15 |
| 6 | Keep the manifest beside the archive. | F-1-14 |
| 10 | The app does not move, rename, edit, or upload media. | — |
| 10 | It does not identify faces or replace a backup tool. | F-1-8 |
| 8 | Only an exported manifest writes a new file. | F-1-14 |
| 10 | Pay $29 once for unlimited checks and saved folder profiles. | F-1-1 |
| 6 | Sociobot is the merchant of record. | F-1-5 |
| 4 | Refunds are handled there. | F-1-5 |
| 3 | v0.1.5 is ready. | — |
| 8 | Builds are unsigned until signing certificates are added. | F-1-25 |
| 6 | Check family photo copies before handoff. | — |
| 9 | Version 0.1.5 · Generated art disclosed in the design notes. | — |

The transient release states also contain “Checking the latest release for this device…” (7), “Downloads are being published.” (4), and “The release page shows current progress.” (7). They are below the limit and plain enough.

### Landing headings, labels, and actions

| Words | Text | Type | Flag |
|---:|---|---|---|
| 4 | Recovery check · desktop app | label | — |
| 7 | Check every family photo has a copy | h1 | — |
| 5 | Try it with sample data | primary action | — |
| 1 each | Private / Offline / Price | fact labels | — |
| 5 | Sample check · 28 August 2026 | label | — |
| 5 | One missing video needs attention | h2 | — |
| 4 | Open this sample check | action | — |
| 2 | Three steps | label | — |
| 4 | How the check works | h2 | — |
| 3 | Choose two folders | h3 | — |
| 3 | Read and compare | h3 | — |
| 4 | Hand over the record | h3 | F-1-14 |
| 4 | Inside the desktop app | label | — |
| 7 | A short check, from folders to handoff | h2 | — |
| 3 | Read-only by default | label | — |
| 4 | Your folders stay unchanged | h2 | — |
| 2 | Household license | label | — |
| 6 | Check archives larger than 500 files | h2 | — |
| 4 | Buy household license — $29 | action | — |
| 5 | Have a license? Paste it | button | F-1-16 |
| 4 | Desktop app · unsigned preview | label | — |
| 5 | Install for full folder checks | h2 | — |
| 3 | Download for Linux | action | — |
| 2 | Verify license | button | — |
| 2 | View releases | fallback action | — |
| 3 | View release page | fallback action | — |

### README sentences

| Words | Sentence | Flag |
|---:|---|---|
| 13 | Check that family photos and videos have a readable, independent copy before handoff. | — |
| 11 | Family Archive Check is a local-first desktop app for household archivists. | F-1-17 |
| 11 | It compares a main folder with a copy on another drive. | F-1-14 (term mismatch: main folder/main archive) |
| 14 | It validates a deterministic sample of media, then reports missing, changed, and unreadable files. | F-1-18 |
| 13 | It also exports a portable JSON recovery manifest and a printable handoff sheet. | F-1-14 |
| 14 | It does not host photos, identify faces, sync files, or change the selected folders. | F-1-8 |
| 2 | Open https://family-archive-check.sociobot.in/demo. | — |
| 11 | The sample works without an account and contains one missing video. | —; covered by `demo-ready` |
| 8 | Demo data stays separate from real folder data. | F-1-4 |
| 14 | The product site detects macOS, Windows, or Linux and links to the matching release. | — |
| 9 | Builds are unsigned until the operator adds signing certificates. | F-1-25 |
| 6 | Command-line download helpers are also available: | F-1-19 |
| 15 | Both helpers download the current release, verify its SHA-256 checksum, and place it in Downloads. | F-1-3, F-1-20 |
| 6 | Open the downloaded installer to finish. | — |
| 5 | Choose the main archive folder. | — |
| 10 | Choose an independent copy on another drive or mounted location. | F-1-21 |
| 4 | Select Check both folders. | — |
| 6 | Review missing, changed, and unreadable items. | — |
| 10 | Export the JSON recovery manifest and print the handoff sheet. | F-1-14 |
| 10 | The installed app blocks folders on the same storage device. | — |
| 14 | The browser fallback detects repeat selections by folder name but cannot identify physical drives. | F-1-22 |
| 8 | The free app checks up to 500 files. | — |
| 12 | A $29 one-time household license enables unlimited checks and saved folder profiles. | F-1-1 |
| 8 | Recovery exports and accessibility are never paid features. | F-1-6 |
| 11 | Requirements: Node.js 22.12.x, Rust stable, and the Tauri 2 system dependencies. | —; appropriate in developer section |
| 10 | Build the static deploy exactly as the work order expects: | F-1-23 |
| 4 | Build both web targets: | — |
| 6 | Run the native app during development: | — |
| 5 | .github/workflows/release.yml runs for v* tags. | —; appropriate in release section |
| 14 | It builds unsigned Tauri installers for macOS arm64 and x86_64, Windows, and Linux. | —; appropriate in release section |
| 11 | The workflow attaches installers, SHA256SUMS, and latest.json to the GitHub Release. | —; appropriate in release section |
| 6 | The scanner reads chosen folders locally. | — |
| 7 | The website sends no archive data away. | —; covered by `local-only` |
| 14 | A license check sends only the pasted license token to the Sociobot billing API. | F-1-24 |
| 8 | See /privacy and /terms on the product site. | — |
| 9 | The source code is available under the MIT License. | —; directly verified by `LICENSE` |

README headings are “Family Archive Check” (3), “Try the sample” (3), “Install” (1), “Use the app” (3), “Develop and test” (3), “Release” (1), and “Privacy and license” (3). Each names its section without metaphor.

### Terminology check

| Concept | Terms found | Result |
|---|---|---|
| Original collection | main archive; main folder | inconsistent, F-1-14 |
| Independent collection | independent copy | consistent |
| Comparison run | check | consistent |
| Exported file list | record; manifest; JSON recovery manifest; portable JSON recovery manifest | inconsistent/jargon, F-1-14 |
| Printed instructions | handoff sheet | consistent |
| Paid entitlement | household license | consistent |
| Try-out mode/data | demo; sample | acceptable distinction between mode and fixture |

## Demo and sandbox

- One click from the landing primary action opened `/demo`.
- The first 390×844 screen showed the demo banner, “One archive item needs attention,” and the populated result card. The full result showed 6 main files, 5 copy files, and missing `2024/01-New-year/fireworks.mp4`.
- The persistent banner read “Demo — sample data, nothing is saved” and included Reset demo and Start for real.
- Export produced `family-archive-manifest-2026-08-28.json`.
- Reset restored the original result message and sample difference.
- Start for real opened a blank `/check`; the sample filename was absent.
- A seeded `review:real-sentinel` and `family-archive-check:profiles` value were unchanged before and after export, reset, and leaving demo.
- No request occurred during the client-side demo flow. A fresh direct `/demo` visit requested only the product origin.
- After service-worker activation, the live demo reloaded offline with the same h1 and sample state.

The current demo behavior passes. F-1-4 records the weaker automated regression test.

## Declared claim tests

Each exact command from `.factory/claims.json` ran independently in clean clone `/tmp/family-archive-check-review-1-clean`.

| Claim | Exact command | Result |
|---|---|---|
| `demo-ready` | `npm run test:e2e -- --grep @claim:demo-ready` | PASS, 1 test |
| `manifest-export` | `npm run test:e2e -- --grep @claim:manifest-export` | PASS, 1 test |
| `handoff-sheet` | `npm run test:e2e -- --grep @claim:handoff-sheet` | PASS, 1 test; inadequate assertion, F-1-2 |
| `local-only` | `npm run test:e2e -- --grep @claim:local-only` | PASS, 1 test |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS, 1 test |
| `compare-copies` | `npm run test:unit -- --testNamePattern @claim:compare-copies` | PASS, 1 test |
| `media-readable` | `npm run test:unit -- --testNamePattern @claim:media-readable` | PASS, 1 test |
| `independent-folders` | `npm run test:unit -- --testNamePattern @claim:independent-folders` | PASS, 1 test |
| `free-limit` | `npm run test:unit -- --testNamePattern @claim:free-limit` | PASS, 1 test |
| `read-only` | `cargo test --manifest-path src-tauri/Cargo.toml claim_read_only` | PASS, 1 Rust test |
| `capture-year` | `cargo test --manifest-path src-tauri/Cargo.toml claim_capture_year` | PASS, 1 Rust test |
| `paid-license` | `npm run test:e2e -- --grep @claim:paid-license` | PASS, 1 test; inadequate behavior coverage, F-1-1 |
| `platform-download` | `npm run test:e2e -- --grep @claim:platform-download` | PASS, 1 test |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS, 1 test; inadequate storage coverage, F-1-4 |
| `license-privacy` | `npm run test:e2e -- --grep @claim:license-privacy` | PASS, 1 test |
| `installer-checksum` | `npm run test:unit -- --testNamePattern @claim:installer-checksum` | PASS, 1 test; PowerShell not executed, F-1-3 |

Summary: 16/16 commands passed. The full clean-clone `npm test` also passed 13 unit and 20 browser tests. `npm run build` produced `dist/site` and `dist/app`; site JS totals about 37 KB raw and 13.3 KB gzip.

## History verification

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files exist. The earlier `.factory/handoff.md` records two repaired findings:

- Cold-load focus: confirmed fixed in code and live. Cold render calls `render()` without route focus; SPA navigation and `popstate` use `announceRoute: true`. The live first five Tab stops were Skip to main content, wordmark, Demo, Check folders, Privacy. Demo navigation and Back focused the new h1.
- Result contrast: confirmed fixed in code and live. The token test passed, computed live result/action colors match the repaired palette, and live Axe found zero violations on every public route and the real 404.

Neither prior issue is reopened.

## Structure, routing, links, accessibility, and identity

- `/`, `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive` returned 200. A missing route returned a designed page with HTTP 404.
- Each tested route has one h1, one main landmark, `lang="en"`, a route title under 60 characters, ordered headings, favicon, apple-touch icon, meta description, Open Graph image, and Twitter card.
- SPA navigation and browser Back update the URL, restore the expected route, scroll to the top, focus the h1, and announce through the live region.
- Every link discovered across public routes returned 200 after redirects, including checkout, Linux release asset, and Sociobot. README product, installer, and Tauri links also returned 200.
- `/opt/fleet/lib/verify-url.sh` passed: 200, title, lang, one h1, main, no missing alt, no unlabeled button, and no console error.
- Live Axe returned zero violations at 390 px on all routes and the deployed 404. There was no horizontal overflow in the tested mobile flows, focus was visible, and reduced motion is handled in CSS.
- The art-deco transit-poster composition, paper/ink palette, clipped ticket shapes, railway check motif, original generated asset, and restrained route motion are product-specific. It is not a generic SaaS template.
- Metadata, sitemap, 404-shell, and first-viewport exceptions are F-1-9 through F-1-12.

## Missed leverage

No additional AI feature is justified. Folder inventory, media-structure checks, hashing, and copy comparison are deterministic tasks; sending archive details to a model would weaken the local privacy proposition. Import is not necessary for the brief’s first useful outcome, recovery export already exists, and cloud sync is an explicit non-goal.

## What would make this perfect

Resolve every finding above, then rerun this review from a fresh browser and clean clone. In particular: prove paid behavior instead of its labels, exercise both installer helpers, make demo isolation a storage-level regression test, register every material public claim, replace technical copy with plain task language, fit all three facts above the fold, publish per-route metadata, include or deliberately exclude the print route in the sitemap, and make the real 404 use the full site shell. PASS requires the next review to find nothing left.
