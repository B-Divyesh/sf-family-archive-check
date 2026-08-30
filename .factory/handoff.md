# Adversarial review 2 handoff

## Status

**FAIL — review completed at `154eab54fbc57be419b148646b002390eb7dadf2`.**

The full report is `.factory/review-2.md`. Product code was not changed.

## What was done

- Opened the live site cold at 390×844 and 1440×900 and recorded the first-screen interpretation before scrolling.
- Audited every landing and README sentence, heading, label, and action for length, plain wording, terminology, and claim coverage.
- Exercised the one-click demo, JSON export, reset, exit, real-storage sentinel, same-origin request log, cookies, and offline reload.
- Ran all 26 exact `.factory/claims.json` commands independently from clean clone `/tmp/fac-review-2-clean.c4tT0n`.
- Rechecked every finding from review 1, polish 1, and the current handoff in live behavior and source.
- Checked route metadata, deep links, reload, Back/focus behavior, 404 status, sitemap, links, visual identity, mobile overflow, and accessibility.
- Ran aggregate tests, typecheck, lint, both builds, independent live Axe scans, and `verify-url.sh`.

## Verification results

- 26/26 declared claim commands pass.
- `npm test`: 23 Vitest and 29 Playwright tests pass.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass; `dist/site` and `dist/app` are produced.
- Live Axe: zero violations at mobile and desktop on every public route and the 404.
- Live demo isolation, same-origin request log, no cookies, Reset, Start for real, and offline reload pass.
- All crawled links return 200 after redirects.

## Findings left

- Blocking: real `/print/<id>` handoff links break on reload and unknown print IDs return a false HTTP 200 with wrong metadata.
- Blocking: the earlier V8-1 multi-issue h1 defect remains live.
- Blocking: earlier F-1-14 terminology is half-fixed.
- Major: five public statements lack their own claim entries/tests.
- Major: the exported recovery file list cannot be imported for a later recovery comparison.
- Minor: one vague/unmeasured heading and two unclear phrases remain.

## How to verify

```sh
while IFS= read -r test_command; do bash -lc "$test_command" || exit $?; done < <(jq -r '.[].test' .factory/claims.json)
npm test
npm run typecheck
npm run lint
npm run build
```

For the principal live blockers, create a browser check with two missing files and confirm the h1 count. Open its handoff sheet, record `/print/<id>`, reload, and verify that the sheet persists. Open an unknown `/print/<id>` and require the designed HTTP 404 with page-not-found metadata.
