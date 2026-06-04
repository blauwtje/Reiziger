# Reiziger — Design System

> **Reiziger** is a Dutch public-transit journey planner (trein, bus, tram, metro, ferry). A single-user web app for planning trips **by arrival time** and setting **custom minimum transfer times** at specific interchanges. Visual language is a dark, **split-flap departure board** — real station signage, not a generic dark-mode dashboard.

The product is one surface: a planner. There is no marketing site, no mobile app, no docs site. This design system therefore contains one UI kit (`ui_kits/web/`) covering the planner itself.

---

## Sources

No codebase or Figma was attached for this brief — only a written specification (Dutch product description + token list + stack notes). The design system below is derived from that spec. Stack of record:

- **React 18 + Vite + Tailwind v4**
- Theme tokens live in `web/src/index.css` via the Tailwind v4 `@theme` directive. There is **no `tailwind.config`**. New components must consume tokens (`bg-ink-900`, `text-signal`, `text-bus`, `font-mono`) — never hard-coded hex.

> **Re-attach for higher fidelity.** If a real codebase / Figma exists, attach via Import — this system was assembled from spec alone and the UI kit screens are best-guess recreations of the planner described.

---

## Index

| File | What it holds |
| --- | --- |
| `README.md` | This file — context, content & visual foundations, iconography. |
| `colors_and_type.css` | All tokens — colors, type scale, radii, shadows, motion. Source of truth for `@theme`. |
| `SKILL.md` | Agent-Skill manifest. Lets this system be invoked as a skill. |
| `fonts/` | Google Fonts notice — Hanken Grotesk + DM Mono are loaded from the CDN, no local TTFs needed (see Caveats). |
| `assets/` | Logo lockups, modality glyphs, generic illustrations, dot-grid SVG. |
| `preview/` | Cards rendered into the **Design System** tab — colors, type, components, motion. |
| `ui_kits/web/` | The Reiziger planner UI kit — `index.html` (clickable prototype) and JSX components. |

---

## Content fundamentals

**Language.** UI copy is **Dutch**. Where helpful, an English gloss appears in parentheses for non-Dutch developers reading source. Keep both versions clipped — no marketing fluff.

**Voice.** Quiet, factual, second-person where it matters. Reiziger talks like a station board, not a chatbot. Verbs first; the user does things — *Zoek*, *Plan*, *Toevoegen*, *Aanpassen*. Avoid emotive copy, no exclamation marks, no "Let's…", no first-person ("we", "ik").

**Address form.** **`je` / `jouw`** throughout (informal, modern Dutch product convention). Never `u`.

**Casing.** Sentence case for everything — headings, buttons, labels. The only **ALL-CAPS** is the eyebrow `.label` style (uppercase + tracked +0.08em), used for column headers on the board (*VERTREK · AANK · DUUR · OVERSTAP · SPOOR*). Modality and station names are written exactly as NS / OV publishes them — *Den Haag Centraal*, *Utrecht Vaartsche Rijn*, *Schiphol Airport*.

**Numbers & times.**
- Times: 24-hour, leading zero, mono — `08:42`, `17:05`. Never `8:42am`.
- Durations: mono, units lowercased — `1u 24m`, `42m`.
- Platforms: just the digit/letter, mono — `7a`, `12`.
- Delays: signed mono with color — `+4` (warn) `+12` (late).
- Currency rarely appears, but: `€ 12,40` (Dutch decimal).

**Specific examples (use these phrasings):**
- Empty journey list → *"Geen reizen gevonden. Pas je tijd of overstapminimum aan."*
- Disruption banner → *"Werkzaamheden Utrecht — Amersfoort, hele dag."*
- Late chip → *"+8 min — vertrek Spoor 4b"*
- CTA on planner → *"Plan reis"* (never *"Zoeken"*, never *"Submit"*)
- Save shortcut → *"Bewaar reis"* / *"Opgeslagen"*
- Setting → *"Minimale overstaptijd: 6 min"*

**Emoji.** None. Ever. The board doesn't smile.

**Vibe.** A platform information screen at Utrecht Centraal at 22:30 — calm, lit, useful, slightly mechanical.

---

## Visual foundations

### Palette philosophy

Three layers of meaning, each tightly scoped:

1. **Ink** — five near-black surfaces from `#0a0d12` (page) to `#313c4c` (highest chip), separated only by `#28303d` hairlines. Surfaces *layer*; they do not *float*. Almost never a drop-shadow large enough to read as elevation — depth comes from value, not blur.
2. **Signal (amber)** — exactly one accent, `#ffc917`, with `#ffd750` for hover. Reserved for: focus rings, the *now* line, primary CTA, current selection. If two amber things appear in one viewport, one of them is wrong.
3. **Modality** — color tells you the transport type and nothing else. `rail #ffc917 / bus #3f9bff / tram #16c79a / metro #ff6a3d / ferry #8b9bff`. These colors are forbidden anywhere they don't refer to a mode of transport.

Status (`ok / warn / late`) sits next to but separate from modality. Note that `ok == tram` and `warn ≈ signal` by hue — that is fine because context disambiguates (a status pill on a delay row vs a tram-leg badge on a journey).

### Typography

- **Hanken Grotesk** for UI chrome and prose. 400 / 500 / 600 / 700 in use. Slight negative tracking (`-0.01em`) at body, tighter (`-0.02em`) at display.
- **DM Mono** for *all* numeric, schedule and identifier data — times, durations, platforms, train numbers, delays, distances. `font-variant-numeric: tabular-nums` is always on so columns line up.
- The `.label` / eyebrow style is uppercased, +0.08em tracking, `--fg-dim`. Used for board column headers and side-panel section titles.

### Texture

Two motifs, layered, always together — never one without the other:

1. **Dot-grid** — 18px grid, dot color `rgba(238,243,249,0.045)`. Sits on the page background and on the largest panels.
2. **Dual radial glow** — soft amber bloom from the **top-right** (`60% 50% at 92% 0%`, alpha .10) and a soft blue bloom from the **top-left** (alpha .08). These set the warm/cool axis of the board.

Both are baked into the `.tex-board` utility. Use on the page root and on full-bleed surfaces; do not apply to small components.

### Backgrounds & imagery

The product is data, not photography. There are **no hero images, no illustrations of cities, no maps as wallpaper**. Imagery in the system is limited to:

- the Reiziger wordmark / flap glyph,
- modality glyphs (rail / bus / tram / metro / ferry),
- a small SVG schematic of a route line drawn with modality colors.

If imagery is ever introduced, it must be **monochrome on ink**, warm-biased, no people, no stock.

### Animation

One signature motion: the **split-flap "flap-in"**. Result rows, departure times, and platform numbers reveal with `rotateX(-90deg → 0deg)` over 420ms on `cubic-bezier(.6,.02,.2,1)`, staggered 60ms per row. Use sparingly — only on data appearing for the first time, not on hover.

Other motion is austere:

- Hover / press: `--dur-fast` (120ms), opacity or background shift only. **No translate, no scale on press** — the board doesn't bounce.
- Page transitions: instant. The board snaps.
- Easing default: `--ease-out` (`cubic-bezier(.2,.7,.2,1)`).

### Hover & press

- **Buttons (primary / signal):** hover → background goes to `--signal-soft`, no scale. Active → background returns to `--signal`, +1px inset top shadow.
- **Buttons (ghost / row):** hover → `bg-ink-700`. Active → `bg-ink-600`. Selected → `bg-ink-500` + 2px left amber bar.
- **Icon buttons:** hover → icon color from `--fg-dim` to `--fg`. No background.
- **Press shrinks:** absent.

### Borders, dividers, "cards"

- A "card" in Reiziger is a **panel**: `bg-ink-800`, 1px `--ink-line` border, `--r-md` (6px) radius. No drop shadow.
- Dividers are always 1px solid `--ink-line`. There are no dotted, dashed, or doubled borders anywhere.
- Inside a panel, rows are separated by 1px `--ink-line` only — no padding-only separation.
- Radii: chips `--r-sm` (4px), panels `--r-md` (6px), the board itself `--r-lg` (10px), modal `--r-xl` (14px). Pills are *not* used; the board doesn't do pills.

### Shadows

- `--shadow-panel` — a 1px inset top highlight + 24px ambient drop, used **only** on the board container and on modals. Cards inside do not stack shadows.
- `--shadow-flap` — top inset highlight + bottom inset shade — applied to the big split-flap time cells to suggest the seam between flaps. Decorative; do not use as elevation.
- `--glow-signal` — amber ring + outer glow, used on focused inputs and on the *active* journey row.

### Transparency & blur

Reserved for two situations:

1. Disruption banners across the top — `bg-ink-900/85` + `backdrop-blur(10px)` so the dot-grid faintly shows through.
2. The settings drawer overlay — solid scrim `rgba(0,0,0,0.6)` + `backdrop-blur(6px)`.

Otherwise surfaces are opaque. The board does not float over content.

### Layout rules

- The planner is a fixed two-pane shell: left rail (search + saved trips) ~360px, right pane = the board.
- The right pane has a **fixed column grid** for results: `VERTREK | AANK | DUUR | OVERSTAP | SPOOR | →` (mono-aligned). Columns never reflow on hover.
- Page max width = `1440px`, centered on > 1600px screens with `--ink-900` letterbox.
- Density is **compact**. Row height for results = 56px. Touch targets stay ≥ 40px on inputs.
- Sticky elements: search header, board column-header row.

### Color vibe of imagery

If a photographic asset is ever introduced (rare), it should read **night, warm, mechanical** — long-exposure platform shots, dim amber sodium light, no people, slight grain. Cool blue accent only as reflection on rail. No saturated daylight. No film stock.

---

## Iconography

**No codebase was provided**, so no proprietary icon set was extracted. **Substitute: [Lucide](https://lucide.dev)** loaded from CDN. Stroke-only, 1.75px stroke (`stroke-width="1.75"`), 24×24 default — visually consistent with a station-board aesthetic. Modality glyphs (rail / bus / tram / metro / ferry) are hand-shaped 1-color SVGs in `assets/glyphs/` so they read correctly at 14–18px and can carry modality color via `currentColor`. **Flag — confirm whether Reiziger ships a custom glyph set; if so, send them and we will swap.**

Usage rules:

- Icons render in `--fg-dim` by default, `--fg` on hover, `--signal` when active/selected.
- Modality glyphs always carry their modality color (`text-rail`, `text-bus`, `text-tram`, `text-metro`, `text-ferry`).
- Never use color-filled raster icons. Never use emoji. Never substitute unicode arrows for nav icons — *but* unicode `→ ↗ ↘ — · ›` are acceptable as **typographic glyphs in copy** (e.g. *Den Haag → Utrecht* or *Spoor 7a · vertrek 08:42*).
- Status pills carry a small dot, not an icon — `●` colored by status token.

### Files copied / linked

| Asset | Source | Path |
| --- | --- | --- |
| Lucide icon set | CDN | `https://unpkg.com/lucide@latest/dist/umd/lucide.js` |
| Modality glyphs | Hand-shaped for this kit | `assets/glyphs/{rail,bus,tram,metro,ferry,walk}.svg` |
| Reiziger wordmark | Hand-shaped for this kit | `assets/logo/reiziger-wordmark.svg`, `reiziger-mark.svg` |
| Dot-grid texture | CSS only, see `colors_and_type.css` | `.tex-board` |

> **Flag:** logo and modality glyphs are placeholders — clean, on-brand stand-ins. Send the real brand assets and we'll swap.

---

## Caveats / open questions for the user

1. **No source provided.** No Figma, no GitHub, no screenshots. Everything below the spec was inferred from your written brief. If you have *anything* — even one screenshot of the planner pane — attach it and I will re-fit the UI kit to it.
2. **Fonts.** Hanken Grotesk + DM Mono are loaded from Google Fonts CDN, not bundled as TTFs in `fonts/`. If you need them embedded for offline / privacy, send the licensed files and I will drop them in.
3. **Icon set.** Lucide is a stand-in. Confirm whether you have a proprietary glyph set.
4. **Logo.** The wordmark + flap-mark in `assets/logo/` are hand-shaped for this kit. They are *not* a brand. Send the real lockup.
5. **Modality colors vs status.** `ok` (`#16c79a`) and `tram` are the same hue; `warn` (`#ffb020`) is one notch off `signal` (`#ffc917`). This is intentional per your spec but worth flagging if accessibility audits flag it.
6. **Dutch copy.** All sample strings are in Dutch with the informal `je`. Confirm address form (`je` vs `u`) — I assumed `je`.

---

**Strong ask: send the real planner — even a screenshot — and the Reiziger logo. With those two things this system snaps from "evocative" to "production".**
