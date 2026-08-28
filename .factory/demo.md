# Demo sandbox

- URL: `https://family-archive-check.sociobot.in/demo` or `?demo=1`.
- Local URL: `http://127.0.0.1:4173/demo` after `npm run build:site && npm run preview`.
- Desktop: choose **Load sample project** on the first screen.

The sample contains six dated family media entries in the main APFS archive. An exFAT copy has five. `2024/01-New-year/fireworks.mp4` is intentionally missing, so the result exercises the attention state, manifest download, and handoff sheet.

Demo data is an in-memory fixture. It does not read real folders or write to the real-data namespace. Navigating to a real check also opens a blank state. **Reset demo** reloads the fixture. **Start for real** discards it and opens a blank check.
