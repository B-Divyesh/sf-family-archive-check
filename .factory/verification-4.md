# Independent verification 4 — FAIL

## Scope and verdict

- Tested commit: `6517f9915f7244731dc32dbe1a71dc96277a9b87` (`docs: record desktop release verification`).
- Tested URL: `https://family-archive-check.sociobot.in`.
- Date: 2026-08-29 UTC.
- Verdict: **FAIL**. The core archive-check flow works, all 21 declared claim tests pass after installation, and the live site matches the candidate. The candidate nevertheless violates explicit accessibility and claims requirements, and it lacks the brief's required filesystem/codec validation evidence.
- Product code was not changed.

## Release-blocking findings

### Major — focus indicators miss the required 3:1 contrast

The global focused-control outline is `#D49B2A` on the `#F4EBD8` paper background. Its measured WCAG contrast ratio is **2.08:1**, below the attached accessibility contract's **3:1** minimum for visible focus. A live Chromium check on `/check` confirmed the focused “Choose and read main folder” button uses `rgb(212, 155, 42) solid 4px` with a 3 px offset against the paper background. The issue affects keyboard focus on light sections even though focus order works and axe does not report it.

### Major — a repeated mobile touch target is narrower than 44 px

At 390×844, the footer **Terms** link measures **35.8×44 CSS px** on `/`, `/demo`, `/check`, `/privacy`, `/terms`, and `/print/sample-family-archive`; the standalone `/404.html` version measures 37.3×44 px. The contract requires touch/click targets of at least 44×44 px. The CSS sets only `min-height: 44px` on footer links, so this is reproducible on every route.

### Major — public “repeatable sample” and complete-count claims are not registered and proved

Public copy says “It tests the same repeatable sample of photos and videos” (`README.md`) and “The app counts every file” (landing “Read and compare” step). No entry in `.factory/claims.json` states either promise, and no tagged claim test compares two scans to prove identical sample selection or asserts complete enumeration. The untagged Rust test `scan_hashes_at_most_forty_eight_media_files` proves only the maximum sampled count. The attached claims contract says an unlisted claim fails review.

### Major — the brief's storage/filesystem and valid-codec test matrix is absent

The researched brief requires APFS, NTFS, exFAT, and common image/video codec testing. Repository scanner tests run only on the host temporary filesystem. They reject empty/truncated extensions and decode one valid PNG, but do not scan APFS, NTFS, or exFAT fixtures and do not prove valid HEIC/HEIF or common video containers. Release CI compiles on macOS, Windows, and Linux but does not run mounted-volume or valid-codec integration tests. Because storage and readability are the core safety job, this missing acceptance evidence blocks release.

### Low — singular result copy is grammatically wrong

A real browser-folder check containing one matching file renders “**1 paths match across both folders.**” The result should use singular “path.” This does not break the workflow.

## First-read gate — PASS

A cold 1440×900 live visit answers all three questions on the first screen:

- What it does: “Check every family photo and video has a copy.”
- For whom: “For household archivists who need a clear answer before handing photos and videos to family.”
- What to click first: “Try it with sample data,” followed by “See a finished two-folder check.”

The action opens `/?demo=1` in one click. The populated result shows six main files, five copy files, missing `2024/01-New-year/fireworks.mp4`, and the persistent “Demo — sample data, nothing is saved” banner with Reset demo and Start for real. The same required first-screen facts fit at 390×844; the price row ends at y=671.6 px.

## Declared claims

`.factory/claims.json` exists with 21 entries. The literal first pre-install attempt could not resolve local `@playwright/test`, as expected before dependencies exist. After the required clean install (`npm ci`: 65 packages, 0 vulnerabilities), every listed command was run individually and all 21 passed:

`demo-ready`, `file-list-export`, `handoff-sheet`, `local-only`, `offline-reload`, `compare-copies`, `media-readable`, `independent-folders`, `free-limit`, `read-only`, `capture-year`, `paid-license`, `platform-download`, `demo-isolation`, `license-privacy`, `installer-checksum`, `payment-policy`, `free-exports`, `accessibility-not-gated`, `no-face-recognition`, and `no-tracking`.

The initial dependency-resolution result was not treated as a failed product assertion; the installed clean-clone claim matrix had zero failures.

## Build and automated gates

- `npm test`: PASS — 14 Vitest tests and 25 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS — 4 tests.
- `cargo check --manifest-path src-tauri/Cargo.toml`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --features desktop --all-targets -- -D warnings`: PASS after installing the documented Linux Tauri prerequisites.
- `npm run build`: PASS; produced `dist/site` and `dist/app`.
- `CI=true npm run tauri build -- --no-bundle`: PASS; produced `src-tauri/target/release/family_archive_check`.
- GitHub quality run `33267738525` for the candidate SHA passed the full suite, production-only install/build, desktop-feature Clippy, and Windows valid/tampered PowerShell installer-helper cases.

The first native build invocation inherited this container's nonstandard `CI=1` and Tauri rejected that Boolean value. Re-running with `CI=true` passed; this was an environment-variable formatting issue, not a source defect.

## End-to-end behavior

- Demo export downloaded `family-archive-file-list-2026-08-28.json` with check ID `sample-family-archive` and the expected missing video path.
- The printable handoff route had one main landmark, four recovery steps, both archive locations, and the correct summary.
- A real browser-folder flow with one equal file completed and reported one matching path plus the expected warning that a browser cannot confirm separate drives.
- Selecting the same folder twice displayed the specific same-folder error and disabled the check action.
- Matching corrupt JPEG fixtures were reported as one unreadable entry and were not marked ready.
- The 500/501 free limit, paid 501-file check, saved profile reuse, read-only scan, capture-year extraction, extra/missing/changed behavior, and independent storage-ID rejection passed their unit/integration tests.
- The downloaded Linux `.deb` installed successfully. Its native Tauri app remained alive during a 15-second Xvfb smoke test and opened the bundled 6-versus-5 demo through the visible Demo action. Automated native GTK folder-picker interaction was not reliable under headless Xvfb, so the scanner boundary is covered by Rust tests and IPC/browser flows rather than an automated native picker run.

## Live accessibility, responsive behavior, and motion

- Axe found zero serious or critical violations on `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, the live 404 response, and `/404.html`.
- `/opt/fleet/lib/verify-url.sh` returned status 200 in 802 ms with title, `lang=en`, one h1, one main, no missing alt text, no unlabeled buttons, and no console errors.
- Keyboard order starts with the visible Skip to main content link; Enter moves focus to `main`. SPA route changes and Back are covered by the passing Playwright suite.
- The site and demo have zero horizontal overflow at 390 px. Content remains available with a 32 px root font (200% text).
- Reduced-motion mode is active and replaces result motion with a finished 0.01 ms transition; no continuing animation remains.
- The two manual accessibility defects are listed above; axe/Lighthouse do not supersede the explicit 44×44 and focus-contrast requirements.

## Privacy, headers, caching, offline, and rate limiting

- A fresh live `/demo` → Reset demo → export → Start for real flow made only same-origin requests, set no cookies, and emitted no console/page errors.
- A cold home visit additionally requested only `https://api.github.com` for public release metadata. No external script, font, analytics, or archive-data request was observed.
- Root response: 200, `Cache-Control: no-cache`, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, camera/microphone/geolocation disabled, and a restrictive CSP with only GitHub release metadata and Sociobot licensing in `connect-src`.
- Hashed JavaScript, CSS, and the mobile hero return `Cache-Control: public, max-age=31536000, immutable`; `/sw.js` returns `no-cache`.
- Offline `/demo` reload passed live. The full suite also passed the stale-service-worker replacement scenario.
- Fresh invalid-license burst: requests 1–30 returned 200; request 31 returned **429** with `Retry-After: 2`. Observed allowance: **30 requests per active window**.

## Deployment, performance, and release

- Live `/`, all referenced hashed JavaScript/CSS, `/sw.js`, `/404.html`, `robots.txt`, `sitemap.xml`, and both installer helpers are byte-for-byte identical to candidate `dist/site`. The deployment matches the candidate; `staticwebapp.config.json` correctly is not publicly served.
- All internal routes return expected status; `/missing-stop` returns a real 404. The product, Sociobot home, and release download links resolve.
- Production site bundle: 38.69 KB raw JavaScript total / 13.80 KB gzip; CSS 16.02 KB raw / 4.32 KB gzip; mobile hero 40.94 KB. No fonts are downloaded.
- Live mobile Lighthouse: performance 98, accessibility 100, best practices 100, SEO 100; LCP 1.379 s, CLS 0, TBT 151 ms, total transfer 63.5 KB.
- Public release `v0.1.6` contains macOS arm64/x64, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and valid `latest.json` platform URLs. Downloaded `Family.Archive.Check_0.1.6_amd64.deb` SHA-256 `4d7c4881a1a26ac27cb55bfaa7dd7a6f0813ce66d3abd55c5e7df9282c021355` exactly matches the published checksum.
- Release tag content differs from the candidate only in `.factory/handoff.md` and `.factory/polish-1.md`; product/runtime bytes are unchanged.

## Required remediation

1. Use a focus-indicator color or two-color treatment with at least 3:1 contrast against both paper and dark surfaces, and add a computed-style contrast regression test.
2. Give every footer link a minimum 44 px width (or an equivalent 44×44 hit area) and test both dimensions on every public route.
3. Register and behaviorally test repeatable sample selection and complete enumeration, or remove those public claims.
4. Add real integration fixtures/evidence for APFS, NTFS, exFAT and valid representative photo/video codecs.
5. Correct singular/plural result copy for one matching path.

