# Fonts

Reiziger uses two typefaces, both loaded from Google Fonts CDN:

- **Hanken Grotesk** — UI, headings, prose. Weights 400 / 500 / 600 / 700.
- **DM Mono** — all numeric and schedule data (times, durations, platforms, delays, train IDs). Weight 400 / 500.

Loaded via `@import` at the top of `colors_and_type.css`. No local TTFs are bundled.

> **Flag for user:** if you need fonts embedded (offline use, privacy, print), send the licensed files and we will drop them in and switch the import to `@font-face`.
