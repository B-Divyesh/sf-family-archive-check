# Family Archive Check — review 1 handoff

## Status

Adversarial first-read review 1 is complete. Verdict: **FAIL** with 25 findings (8 major, 17 minor) and no blocking finding. Product code was not modified.

The product is clear on first read, its demo and sandbox work, all 16 declared claim commands pass, the full test/build gates pass, and live routing/accessibility/identity checks pass. The failure is due to incomplete claim coverage, plain-language issues, clipped first-screen facts, stale per-route metadata, a sitemap omission, and an inconsistent 404 shell.

## Review artifact

- `.factory/review-1.md` contains the full finding list, exact copy audit and counts, claim results, live evidence, history verification, and required fixes.

## Verification performed

- Fresh live Chromium contexts at 390×844 and 1440×900.
- Live demo: one-click entry, populated sample, export, reset, start-for-real, seeded real-storage sentinel, request log, and offline reload.
- All 16 exact `.factory/claims.json` commands from clean clone `/tmp/family-archive-check-review-1-clean`: 16/16 passed.
- Clean-clone `npm test`: 13 unit tests and 20 Playwright tests passed.
- Clean-clone `npm run build`: `dist/site` and `dist/app` produced.
- Live crawl: all discovered links returned 200 after redirects; missing route returned 404.
- Live Axe: zero violations on `/`, `/demo`, `/check`, `/privacy`, `/terms`, `/print/sample-family-archive`, and the deployed 404.
- `/opt/fleet/lib/verify-url.sh`: passed with no console errors.
- Earlier handoff focus and contrast fixes: confirmed in live behavior and code.

## Next steps

Address F-1-1 through F-1-25, add the missing behavioral/claim tests, deploy, and rerun the full review from scratch. Do not treat the passing declared commands as acceptance until the shallow and unlisted claim coverage is repaired.
