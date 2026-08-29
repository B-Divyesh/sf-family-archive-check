# Copy audit — polish round 1

Audited 2026-08-29 after the F-1-13 through F-1-25 rewrites. Hyphenated terms, file names, URLs, and version numbers count as one word. No sentence exceeds 22 words. No sentence contains a banned marketing word.

## Landing page sentences

| Words | Sentence |
|---:|---|
| 9 | Check every family photo and video has a copy. |
| 15 | For household archivists who need a clear answer before handing photos and videos to family. |
| 5 | See a finished two-folder check. |
| 5 | Files stay on this device. |
| 6 | Works offline after the first visit. |
| 4 | Free for 500 files. |
| 4 | Household license: $29 once. |
| 5 | One missing video needs attention. |
| 6 | The main archive has six items. |
| 5 | The independent copy has five. |
| 8 | Pick the main archive and one independent copy. |
| 14 | The app counts every file, opens a sample, and checks whether matching files changed. |
| 11 | Save a recovery file list (JSON) and print plain recovery steps. |
| 2 | Choose folders. |
| 5 | The app only reads them. |
| 9 | The app counts and tests both folders the same way. |
| 8 | Keep the recovery file list beside the archive. |
| 12 | The app does not move, rename, edit, upload, or identify people in media. |
| 8 | Keep an independent backup and test recovery yourself. |
| 10 | Only an exported recovery file list writes a new file. |
| 10 | Pay $29 once for unlimited checks and saved folder profiles. |
| 11 | Dodo Payments takes the payment and handles order-related questions and returns. |
| 17 | Your computer may warn you because this preview app is not yet signed. |
| 6 | Check family photo copies before handoff. |
| 9 | Version 0.1.6 · Generated art disclosed in the design notes. |

Transient release copy is also within the limit: “Checking the latest release for this device.” (7), “Downloads are being published.” (4), and “The release page shows current progress.” (7).

## App, demo, legal, and error sentences

All interface sentences were extracted from `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and `/404.html`. The longest are:

| Words | Sentence |
|---:|---|
| 15 | Choose a copy on another connected drive or network folder. |
| 8 | Choosing starts a read-only inventory. |
| 17 | The website can spot the same folder name. Only the desktop app can confirm that folders are on separate drives. |
| 16 | Folder names, file details, sample checks, and recovery file lists stay on your device. |
| 13 | The software is provided under the MIT License without a recovery guarantee. |
| 12 | Dodo Payments handles payment, order questions, and returns. |
| 10 | Compare the new folder with the recovery file list. |

All remaining interface sentences contain 12 words or fewer. Errors say what happened and what to do next. Buttons use result-naming verbs.

## README

The README was checked sentence by sentence. Its longest sentence has 21 words. The earlier jargon was replaced: “local-first,” “deterministic sample,” “mounted location,” “browser fallback,” factory “work order,” and visitor-facing SHA-256 language no longer appear in primary instructions.

## Terminology

| Concept | One term used |
|---|---|
| Original collection | main archive |
| Second independently recoverable collection | independent copy |
| One comparison run | check |
| Exported JSON record | recovery file list |
| Printed recovery instructions | handoff sheet |
| Paid entitlement | household license |
| Isolated example | demo / sample data |

Catalog description: “Check every family photo and video has a readable copy before handoff.” (11 words, 68 characters.)
