# Polish round 1 — finding closure

Released candidate reviewed: `d565fa46fd169091c0b465e23cab616a1157baf6`  
Review source: `0619d465dd1713426debac7f13c8f0bf18cfa894` / `.factory/review-1.md`  
Repair commits: `c0e0dc7a640158dddfddc127d6dd372941e1152a`, `59b906b`, `ecccc9d`  
Live site checked cold: <https://family-archive-check.sociobot.in>

## Every finding

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Replaced the label-only license test with a native IPC fixture containing 501 matching files. It proves the unlicensed boundary, recorded license verification, completed licensed check, profile save, reload, and profile reuse. | `@claim:paid-license`; clean-clone claim pass; GitHub full-suite job; live `/check`. |
| F-1-2 | The handoff claim now asserts the recovery heading, exactly four steps, both archive locations, result summary, and Print action. | `@claim:handoff-sheet`; [live demo screenshot](repair-artifacts/polish-1-demo-live.png); live `/print/sample-family-archive`. |
| F-1-3 | Added executable valid/tampered cases for both helpers. The PowerShell harness runs on `windows-latest` in quality and release workflows. | `@claim:installer-checksum`; GitHub Windows job `99138064392` passed; `tests/installers.ps1`. |
| F-1-4 | Demo result state is separate from real check state. Reset and exit only replace/discard the in-memory demo fixture. The regression test seeds a real profile and sentinel, exports/resets/exits, then compares storage exactly. | `@claim:demo-isolation`; live `/?demo=1` sentinel re-check passed. |
| F-1-5 | Corrected the responsible party to Dodo Payments and registered the statement. | `@claim:payment-policy` follows the live Sociobot checkout redirect and asserts Dodo's Merchant of Record/returns policy; live purchase and terms copy checked. |
| F-1-6 | Registered and behaviorally tested free recovery exports and unlicensed accessibility. | `@claim:free-exports`; `@claim:accessibility-not-gated`. |
| F-1-7 | The demo claim now asserts the landing preview and demo both report six main items and five copied items. | `@claim:demo-ready`; [live demo screenshot](repair-artifacts/polish-1-demo-live.png). |
| F-1-8 | Reworded the boundary in plain language and registered a dependency/source/permission policy test. | `@claim:no-face-recognition`; camera permission remains disabled. |
| F-1-9 | Widened the desktop copy rail, tightened hero rhythm, and made the mobile header one row. The full price fact ends at y=735/900 desktop and y=672/844 mobile. Result entrance motion now keeps full opacity so contrast never dips during animation. | `desktop first screen…`; `mobile layout…`; accessibility test repeated three times; [desktop](repair-artifacts/polish-1-desktop-live.png); [mobile](repair-artifacts/polish-1-mobile-live.png). |
| F-1-10 | Added per-route title, description, canonical, Open Graph title/description/URL, and Twitter title/description updates. | `every public route publishes…`; live cold checks on `/`, `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive`. |
| F-1-11 | Added `/print/sample-family-archive` to `sitemap.xml`. | Build artifact inspection; live route returns 200. |
| F-1-12 | Rebuilt the static 404 with the standard skip link, FAC wordmark, main navigation, one-liner, legal links, Param Factory attribution, version, metadata, and original poster styling. | `unknown routes return 404…`; [live 404 screenshot](repair-artifacts/polish-1-not-found-live.png); live unknown route returns 404. |
| F-1-13 | Replaced “validates…hashes” with “counts every file, opens a sample, and checks whether matching files changed.” | `.factory/copy-audit.md`; live old-copy absence check. |
| F-1-14 | Standardized the exported output as “recovery file list,” with JSON introduced once. Renamed the downloaded file accordingly. | `@claim:file-list-export`; `@claim:handoff-sheet`; repository-wide old-copy search. |
| F-1-15 | Rewrote the walkthrough to “The app counts and tests both folders the same way.” | `.factory/copy-audit.md`; live old-copy absence check. |
| F-1-16 | Renamed the disclosure control to “Enter license token.” | Live purchase section and keyboard focus check. |
| F-1-17 | Replaced “local-first” with “keeps archive data on your computer.” | README copy audit. |
| F-1-18 | Replaced “deterministic sample” with “the same repeatable sample of photos and videos.” | README copy audit. |
| F-1-19 | Replaced “Command-line download helpers” with “download the app from a terminal.” | README copy audit. |
| F-1-20 | Visitor copy now says the helpers confirm the download is unchanged; SHA-256 remains only in a developer note. | README copy audit; `@claim:installer-checksum`. |
| F-1-21 | Replaced “mounted location” with “another connected drive or network folder.” | README and `/check` live copy. |
| F-1-22 | Replaced “browser fallback” with a direct website/desktop limitation. | README and `/check` live copy. |
| F-1-23 | Replaced internal work-order wording with “Build the deployable static site.” | README copy audit. |
| F-1-24 | Replaced “billing API” with “Sociobot’s license service.” | README privacy copy; `@claim:license-privacy`. |
| F-1-25 | Replaced signing implementation jargon with the consequence: the computer may warn because the preview is not signed. | `@claim:platform-download`; live download section. |

## Cumulative verification

- Every one of 21 `.factory/claims.json` commands passed separately in clean clone `/tmp/fac-polish-clean.cX1f3k`.
- Clean-clone aggregate: 14 Vitest tests, 25 Playwright tests, 4 Rust tests, TypeScript, Rust format, non-desktop clippy, desktop clippy, site build, and app build passed.
- Playwright axe: zero serious or critical violations on every public route and the 404, locally and live.
- `/opt/fleet/lib/verify-url.sh`: no console errors; title, `lang`, one `h1`, `main`, image alt, and button names passed locally and live. See `repair-artifacts/polish-1-verify-*`.
- Lighthouse mobile: local 99/100/100/100 and live 100/100/100/100 for performance/accessibility/best practices/SEO. Live LCP 1.2 s, CLS 0, TBT 40 ms.
- Bundles: initial JS 38.69 KB raw across three chunks (13.80 KB gzip); CSS 16.03 KB raw (4.33 KB gzip); mobile hero 40.94 KB.
- Final deployment `96dbf482-cb1c-44c4-914e-14b910e63b75` succeeded. Cold desktop/mobile, demo/reset/exit/storage, all route metadata, handoff content, 404 shell/status, reviewed copy, and console checks were repeated on the custom domain.

No review finding remains open.
