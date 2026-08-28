# Independent product verification

## Verdict: FAIL — release blocked

- Candidate: `9c6bc1476de73b03cde87334250ad12715f53097`
- Live URL: `https://family-archive-check.sociobot.in`
- Verified: 28 August 2026 (UTC)
- Artifact: Tauri 2 desktop app with a hosted browser fallback

The deployed site is byte-for-byte consistent with the candidate's generated site assets, and the normal demo path works. The candidate still fails the acceptance contract. Its claim commands do not run independently from a clean clone, malformed media can receive a false “Ready for handoff” result, the desktop first screen hides the primary action below the fold, and `/check` has an axe-critical form-label failure.

## First-read test

Cold interpretation: this checks whether every family photo has a copy. It is for household archivists preparing to hand photos and videos to family. The intended first click is **Try it with sample data**.

Result: **FAIL on desktop; pass on 390 px mobile.** At 1440×900, the audience sentence begins at y=834.7 and extends below the viewport. The primary action begins at y=969.2, so the first screen does not show what to click. The mobile action is visible at y=618 in a 390×844 viewport. Evidence: [desktop first viewport](verification-artifacts/desktop-first-viewport.webp).

## Required claim tests from a clean clone

After confirming a clean worktree at the candidate commit, `npm ci` completed. Every command was then run exactly as listed in `.factory/claims.json`, before any build output existed.

| Claim | Exact command | Initial result |
|---|---|---|
| `demo-ready` | `npm run test:e2e -- --grep @claim:demo-ready` | **FAIL** — Playwright web server timed out after 30 seconds because `dist/site` did not exist |
| `manifest-export` | `npm run test:e2e -- --grep @claim:manifest-export` | **FAIL** — same server timeout |
| `handoff-sheet` | `npm run test:e2e -- --grep @claim:handoff-sheet` | **FAIL** — same server timeout |
| `local-only` | `npm run test:e2e -- --grep @claim:local-only` | **FAIL** — same server timeout |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | **FAIL** — same server timeout |
| `compare-copies` | `npm run test:unit -- --testNamePattern @claim:compare-copies` | PASS — 1 passed, 3 skipped |
| `read-only` | `cargo test --manifest-path src-tauri/Cargo.toml claim_read_only` | **FAIL initially** — missing documented Tauri system library `glib-2.0`; passed after installing the Linux prerequisites |
| `paid-license` | `npm run test:e2e -- --grep @claim:paid-license` | **FAIL** — same server timeout |
| `platform-download` | `npm run test:e2e -- --grep @claim:platform-download` | **FAIL** — same server timeout |

Exit summary: `demo-ready=1 manifest-export=1 handoff-sheet=1 local-only=1 offline-reload=1 compare-copies=0 read-only=101 paid-license=1 platform-download=1`.

This alone is release-blocking under the claims contract. The shared e2e cause is `playwright.config.ts` starting `npm run preview`, which only serves a pre-existing `dist/site`; individual claim commands do not build it first. After `npm test` created the site build, the aggregate suite passed, but that does not make the listed clean-clone commands valid.

## Release-blocking defects

### Critical — corrupt media is reported ready for handoff

I selected separate folders that each contained a zero-byte file named `corrupt.jpg`. The live product reported:

- “Both archive copies are ready”
- “Ready for handoff”
- one sampled file hash compared
- zero unreadable entries
- no items to review

Evidence: [false ready result](verification-artifacts/corrupt-empty-reported-ready.webp).

Both scanners treat a successful byte-read operation as readable without validating the media. In Rust, reading an empty file returns `Ok(0)` and is accepted. In the browser, `arrayBuffer()` on corrupt or empty content also succeeds. The comparison claim test injects an unreadable record directly into the comparator, so it never proves that either scanner detects corrupt media. This contradicts the core researched job of confirming readable, recoverable copies.

### High — the same folder can be both “independent” copies

I chose the exact same browser directory for the main archive and independent copy. The product reported “Both archive copies are ready” and “2 paths match,” with both locations shown as `normal-main`. There is no same-path guard or warning. A user can therefore receive a recovery-ready verdict without an independent copy.

### High — the desktop first-screen acceptance gate fails

At the common 1440×900 viewport, the audience sentence is clipped and the sample action is entirely below the fold. This directly fails the mandatory first-read contract even though the copy itself is plain once scrolled into view.

### High — `/check` has an axe-critical accessibility failure

Fresh axe-core 4.10.2 runs on both desktop and 390 px mobile report rule `label` as **critical**, with two nodes:

- `#primary-input`
- `#backup-input`

Both file inputs lack a label or accessible name. Keyboard testing also reaches both visually clipped 1×1 inputs between the visible folder buttons and “Load sample project,” producing invisible focus stops. The repository's own sequential accessibility test did not expose this live failure.

## Other findings

### Medium — relied-on claims are absent from the claims manifest or not tested at their stated boundary

Examples include the README claim that both install helpers verify SHA-256 and save to Downloads, the privacy claim that a license check sends only the token, EXIF/date coverage, and the exact 500-file free boundary. The paid-license claim test checks price and a mocked valid license but not 500 versus 501 files. Demo/real-data separation has an untagged test but no corresponding manifest entry. The manifest's `compare-copies` test proves comparator behavior, not scanner readability.

### Medium — hashed production assets are not cached immutably

The live HTML, hashed JS, CSS, images, and service worker all return `Cache-Control: public, must-revalidate, max-age=30`. Hashed assets should have a long-lived immutable policy. Offline behavior still works through the service worker.

### Medium — unknown routes return HTTP 200

`/missing-stop` renders the designed client-side not-found screen but responds `HTTP/2 200`, not 404. This is a soft 404.

### Low — some mobile targets are shorter than 44 px

Footer Privacy, Terms, and Param Factory links are 22 px high. The license purchase link and legal-page return link are 19 px high. Visible primary controls meet the 44 px minimum.

### Low — decorative controls and metaphorical copy conflict with the language/semantics contract

The landing walkthrough contains a real, clickable `button` labelled “Choose folder” with `tabindex=-1` and no behavior. “Your archive is cargo, not content” and the not-found “stop/route” language are metaphors despite the plain-words rule.

## Functional evidence

- Demo `/demo`: banner present; six-item main archive versus five-item copy; missing `2024/01-New-year/fireworks.mp4` shown.
- Manifest: downloaded `family-archive-manifest-2026-08-28.json`; check ID `sample-family-archive`; missing path correct. Evidence: [downloaded manifest](verification-artifacts/live-sample-manifest.json).
- Handoff: opens `/print/sample-family-archive` with four concrete recovery steps.
- Sandbox: Reset restores the sample; Start for real opens a blank `/check`; sample path count becomes zero.
- Real folder comparison: one matching photo, one missing video, and one extra photo produced the correct attention result.
- Free-tier boundary: 500 matching files completed as ready. 501 files produced the stated license alert and no result.
- Invalid license: live API returned `{valid:false, reason:"invalid"}` and UI gave a recoverable message. Simulated network failure gave “Try again when you are online.”
- Offline: after `navigator.serviceWorker.ready` and `registration.update()`, an offline reload of `/demo` returned the complete sample with no console errors. Active cache: `family-archive-check-v1`.
- No console/page errors occurred across `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, `/missing-stop`, and `/404.html`.

## Privacy, headers, and rate limiting

- Demo reset/export requested only the document and same-origin JS/CSS.
- A real browser-folder scan and export also made only same-origin requests. No filenames, bytes, or hashes left the origin.
- The landing page additionally requests only GitHub's public release API, as documented by the CSP.
- Live responses include HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, Permissions Policy, and a restrictive CSP allowing only self, GitHub release metadata, and Sociobot license calls.
- Product license verification is rate-limited. In a fresh burst, 30 requests succeeded; request 31 returned `429`, `Retry-After: 3`, and `X-RateLimit-After: 3`. Observed burst allowance: 30 requests before throttling.
- No sign-in exists, so the Entra tenant requirement is not applicable. No analytics, third-party fonts, raw model keys, Azure endpoints, or payment-provider integration appear in the product.

## Accessibility and responsive checks

- One `<h1>`, one `<main>`, route-specific titles, `lang=en`, meaningful image alt text, and zero horizontal overflow were present on all tested routes at 1440×900 and 390×844.
- Axe found no serious/critical issues on all routes except `/check`; `/check` has the critical unlabeled-input issue above.
- Visible controls have a designed 4 px gold focus outline. The hidden file controls are nevertheless keyboard focus traps in practice.
- With reduced motion enabled, no computed animation or transition exceeded 1 ms.
- Internal links crawled from all routes returned 200. The unknown route's 200 is the soft-404 defect above.

## Performance and deployment

- Fresh Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- LCP 1,205 ms; CLS 0; total blocking time 28 ms.
- Initial transfer measured 61,887 bytes, including the GitHub release response and 40,942-byte mobile hero.
- Main JS: 30,562 bytes raw / 10,895 bytes gzip. CSS: 15,342 bytes raw / 4,204 bytes gzip. No webfonts.
- Live `index.html`, JS chunks, CSS, service worker, and both hero images match the locally built candidate byte-for-byte.

## Install/release evidence

- Release `v0.1.1` exists with macOS arm64/x64 DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and valid `latest.json` platform URLs.
- Tag `v0.1.1` resolves to `72171c2370694a217ada2f439563eae2d65b0c3b`; the only candidate diff after that tag is `.factory/handoff.md`, so product code is identical.
- Windows MSI SHA-256 matched `2112898d21b75ce3cd7fd154aa9028147a3d7c245b2d0fa0c9f06dbc57b479ff`.
- Linux AppImage SHA-256 matched `3f99efa32407e177179ff72e8d040d81d1609c0ae0fe98b97079ab2672dd6622` and remained running until the 20-second headless smoke-test timeout.
- Release workflow run `33203929377` completed successfully.

## Local quality gates

- `npm ci` — pass; 0 vulnerabilities.
- `npm test` — pass after its build step; 4 unit and 11 Playwright tests.
- `npm run build` — pass; produced `dist/site` and `dist/app`.
- `npx tsc --noEmit` — pass.
- `cargo test --manifest-path src-tauri/Cargo.toml` — pass after documented system dependencies; 2 tests.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` — pass.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` — pass.
- No lint script is defined.

## Required next actions

1. Make every `.factory/claims.json` command self-contained from a clean clone and rerun all nine.
2. Validate media structure/decodability and add end-to-end corrupt/truncated/empty fixtures for each supported codec.
3. Reject or explicitly warn when the two selected folders are the same; establish an independence check suitable for each platform.
4. Keep the audience sentence and sample action inside the initial desktop viewport.
5. Give the file inputs accessible names and remove them from the hidden keyboard tab sequence; rerun axe independently on each route.
6. List and test every relied-on claim, including the exact free limit, privacy scope, EXIF coverage, and installer checksum behavior.
7. Serve hashed assets with immutable caching and return a true 404 status for unknown URLs.
