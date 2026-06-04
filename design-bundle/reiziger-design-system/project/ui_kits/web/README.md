# Reiziger Web UI Kit

A clickable prototype of the Reiziger journey planner. Hi-fi visual recreation of the planner described in the brief — search by arrival time, set per-station minimum transfer times, browse split-flap journey results.

> **No source code was provided.** This UI kit is a best-guess of the planner described in the spec. Screens are interactive but state is in-memory only.

## Run

Open `index.html` in a browser. React 18 + Babel-standalone, no build step.

## Screens

| Screen | What it shows |
| --- | --- |
| **Planner** (default) | Two-pane layout — search rail on the left (from/to, arrival picker, transfer minimums), board on the right with split-flap journey results. Click a result row to open the detail view. |
| **Journey detail** | Selected journey expanded into a leg-by-leg breakdown with modality glyphs, per-leg times, platforms, and a “Min. overstap” editor for each transfer. |
| **Saved trips** | Sidebar tab — recent + saved journeys. Click to re-plan. |

## Components

- `Board.jsx` — the departure-board container (texture, header, column row, result list, flap-in stagger).
- `ResultRow.jsx` — one journey row, fixed grid `VERTREK · AANK · DUUR · OVERSTAP · SPOOR · ›`.
- `JourneyDetail.jsx` — leg list with per-leg modality, time, platform and transfer-minimum editor.
- `SearchRail.jsx` — left pane: from/to fields, arrival-time picker, transfer-minimums list.
- `Chip.jsx` — modality and status chips.
- `Flap.jsx` — the signature split-flap time cell.
- `Logo.jsx` — wordmark/mark helpers.
- `data.js` — sample journey data and constants.

## What's stubbed

- No backend, no NS API. Journey results come from `data.js`.
- "Plan reis" runs the flap-in animation on the existing dataset.
- Auth, account, settings beyond transfer minimums — not present.
