# Demo sandbox

- URL: `https://family-archive-check.sociobot.in/demo` or `?demo=1`.
- Local URL: `http://127.0.0.1:4173/demo` after `npm run build:site && npm run preview`.
- Desktop: choose **Load sample project** on the first screen.

The sample contains six dated family media entries in the main APFS archive. An exFAT copy has five. `2024/01-New-year/fireworks.mp4` is intentionally missing, so the result exercises the attention state, recovery file list, and handoff sheet.

Demo data is an in-memory fixture held in `demoResult`. Real saved profiles use only the `family-archive-check:profiles` local-storage key. Demo mode never reads or writes that key. **Reset demo** replaces only the in-memory fixture. **Start for real** discards the demo result and opens a blank check.
