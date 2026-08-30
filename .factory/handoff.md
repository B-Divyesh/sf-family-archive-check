# Family Archive Check — adversarial review 4 handoff

## Status

Review verdict: **FAIL** with one blocking and one minor finding. No product code was modified.

- Blocking `F-4-1`: iPhone 13 and Pixel 5 contexts are told “Choose the installer for this device” and receive the Linux x86_64 AppImage. The platform claim test covers only mocked macOS.
- Minor `F-4-2`: the landing purchase and detected download actions do not identify their external destinations.

See `.factory/review-4.md` for exact evidence, complete copy/claim/history audits, and concrete fixes.

## Verification performed

- Clean clone: `/tmp/fac-review4-clean.YwyVnv` at `e1106c00b28e9bd221aaf82284a7015a4c0732c8`.
- All 32 exact `.factory/claims.json` commands passed independently; logs are `/tmp/fac-review4-claim-<id>.log`.
- `npm test` passed: 27 Vitest and 33 Playwright tests.
- `npm run build` passed and produced `dist/site` and `dist/app`.
- Live cold checks covered 390×844, 1440×900, iPhone 13, and Pixel 5 contexts.
- Live demo entry, Reset, export, Start for real, seeded-storage isolation, request logging, and offline reload passed.
- Live Axe returned zero violations on all public routes and the designed 404.
- All internal links returned their expected status; product-specific checkout behavior passed its claim test.

## Next steps

1. Add an explicit mobile state that does not offer a desktop installer.
2. Expand `@claim:platform-download` across macOS, Windows, Linux, iOS, and Android.
3. Mark both off-site landing actions as external in visible or accessible copy.
4. Rerun review 4 from clean browser contexts and a clean clone.
