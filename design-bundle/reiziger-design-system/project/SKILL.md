# reiziger-design

Design system for **Reiziger** — a Dutch public-transit journey planner with a dark, split-flap departure-board aesthetic.

## How to use this skill

1. Read `README.md` for content fundamentals, visual foundations, iconography rules, and caveats.
2. Read `colors_and_type.css` for the full token set (mirrors the Tailwind v4 `@theme` block at `web/src/index.css`). All product code must consume tokens — `bg-ink-900`, `text-signal`, `text-bus`, `font-mono` — never hex literals.
3. Use `ui_kits/web/` as a reference for layout, density, and component shape. `index.html` is a clickable prototype; the JSX files are the source.
4. Use `preview/` cards as quick visual references for color, type, motion (split-flap reveal), and components.

## When designing for Reiziger

- **Language is Dutch**, informal `je` form. Sentence case throughout. No emoji.
- **One amber accent.** If you find yourself using `#ffc917` for two things in one viewport, one is wrong.
- **Modality colors are reserved** for marking transport type. Don't use `--bus` blue for a generic info chip.
- **Mono for every number** — times, durations, platforms, delays, train numbers. Tabular-nums on.
- **Signature motion is the split-flap `flap-in`** — use only on data appearing for the first time.
- **No floating cards.** Depth comes from value layering of `--ink-900 → --ink-400`, not from drop shadows.

## Files

| | |
| --- | --- |
| `README.md` | Brand, content, and visual foundations. Read first. |
| `colors_and_type.css` | All design tokens. |
| `assets/` | Logos, modality glyphs. |
| `ui_kits/web/` | Planner UI kit — `index.html` is the live prototype. |
| `preview/` | Cards rendered into the Design System tab. |
