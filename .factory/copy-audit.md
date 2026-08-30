# Copy audit — repair 8

Audited 2026-08-30 after the versioned desktop release repair. Hyphenated terms, file names, URLs, and version numbers count as one word. No sentence exceeds 22 words. No sentence contains a banned marketing word.

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
| 6 | Checking up to 48 media files. |
| 10 | The app counts and tests both folders the same way. |
| 8 | Keep the recovery file list beside the archive. |
| 12 | The app does not move, rename, edit, upload, or identify people in media. |
| 8 | Keep an independent backup and test recovery yourself. |
| 10 | Only an exported recovery file list writes a new file. |
| 10 | Pay $29 once for unlimited checks and saved folder profiles. |
| 12 | Dodo Payments takes your payment and handles questions or requests about your order. |
| 6 | Check family photo copies before handoff. |
| 9 | Version 0.1.11 · Generated art disclosed in the design notes. |

Release-state copy is also within the limit: “Checking the latest release for this device.” (7), “Open this page on macOS, Windows, or Linux to install.” (10), “Downloads are being published.” (4), and “The release page shows current progress.” (7).

The purchase and release actions append “(external site)” to their accessible names and use `rel="external"`. Phone visitors see “View desktop releases,” never a desktop download action.

## App, demo, legal, and error sentences

All interface sentences were extracted from `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and `/404.html`. The longest are:

| Words | Sentence |
|---:|---|
| 15 | Choose a copy on another connected drive or network folder. |
| 8 | Choosing starts a read-only inventory. |
| 17 | The website can spot the same folder name. Only the desktop app can confirm that folders are on separate drives. |
| 16 | Folder names, file details, sample checks, and recovery file lists stay on your device. |
| 17 | If you add a license, the app sends only that token through our verification endpoint to Sociobot. |
| 10 | It allows 10 checks per client address in 10 minutes. |
| 8 | After that, it returns a retry time. |
| 15 | The endpoint stores a keyed address hash, counter, and reset time to enforce that limit. |
| 13 | The software is provided under the MIT License without a recovery guarantee. |
| 10 | Dodo Payments handles payment and questions about the order. |
| 10 | Import the recovery file list to compare the restored folder. |

All remaining interface sentences contain 12 words or fewer. Errors say what happened and what to do next. Buttons use result-naming verbs.

## README

The README was checked sentence by sentence. Its longest sentence has 21 words. The earlier jargon was replaced: “local-first,” “deterministic sample,” “mounted location,” “browser fallback,” factory “work order,” and visitor-facing SHA-256 language no longer appear in primary instructions.

| Words | Sentence |
|---:|---|
| 12 | The scanner tests valid JPEG, PNG, HEIC, MP4, and MOV fixtures. |
| 14 | CI also scans those fixtures on APFS, NTFS, and exFAT volumes. |
| 12 | The product verification endpoint forwards only the pasted token to Sociobot’s license service. |
| 15 | Before publication, it checks that the AppImage includes recovery-file import and the tagged source commit. |

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

“Checking up to 48 media files” is registered as `media-sample-count` and proved by a 60-file native scan.

Catalog description: “Check family photos and videos against an independent copy before handoff.” (11 words, 74 characters.)
