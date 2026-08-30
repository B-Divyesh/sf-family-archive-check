# Family Archive Check — adversarial review 3 handoff

## Status

Review-only work order. No product code changed. `.factory/review-3.md` records a **FAIL** with one minor finding: the visible “Reading 48 samples” statement is not separately registered as a public claim, even though an existing repeatability test happens to assert that count.

## What was verified

- Fresh live mobile (390×844) and desktop (1440×900) first reads answered what the product does, who it is for, and what to click first before scrolling.
- Direct one-click demo, banner, Reset demo, Start for real, JSON export, storage isolation, same-origin demo requests, cookies, and offline reload were checked in fresh Playwright contexts.
- Live routes, metadata, 404s, sitemap routes, links, standard shell, first-load console, and Axe serious/critical checks were checked.
- Every earlier review/polish finding was verified against live behavior and code; all are fixed.
- Fresh clone `/tmp/family-archive-check-review-3-clean.03xIYz` at `4c2cc445cdef25f4f3ceddec7452231a6b702d27`, with `npm ci --include=dev`: all 31 exact commands in `.factory/claims.json` passed independently.

## Next step

Add a `media-sample-count` claim and tagged test for the landing’s 48-sample assertion, or remove that assertion. Rerun the adversarial review after the change.

## How to verify

```sh
npm ci --include=dev
npm test
npm run build
```

Open `/demo` (or `/?demo=1`) to test the isolated sample path.
