# Reiziger UI — Design Implementation Spec
_2026-05-27 · Approach B: all screens + targeted backend_

## Context

Design source: Claude Design bundle `nLhVTX7lD8ae-AngSaNLPQ` (extracted to `design_bundle/`).
Target stack: React 18 + Vite + Tailwind v4. Tokens in `web/src/index.css` via `@theme`.
No `tailwind.config`. All new components must use token classes (`bg-ink-800`, `text-signal`, `font-mono`, etc.) — no hardcoded hex.

---

## Architecture

No structural changes to the two-pane shell or 4-tab nav. All changes are additive and in-place.

Left rail becomes context-sensitive:
- `plan` tab → `RailSearch` (existing, modified)
- `bewaard` tab → new `RailSaved`
- `mij` tab → `RailMij` (existing, unchanged)

---

## 1. TopNav (`App.tsx`)

Replace the OTP health pill on the right side of the header with:

1. Live date/time clock — formatted as `wo 26 mei · 16:08`, DM Mono 12px, `text-fg-faint`. Updates every minute via `setInterval`.
2. A 1px `border-line` vertical separator.
3. Two icon buttons (alert bell, settings gear) — `34×34px`, `border border-line rounded-md bg-transparent`, icon `text-fg-dim`. No functionality wired; buttons are inert.
4. User-avatar chip — 32px circle, `bg-ink-700 border border-line`, shows first two initials of `profile.name` (fallback `?`), 12px semibold.

The OTP health indicator is removed from the header. The "R" amber badge stays (no real logo asset).

---

## 2. RailSearch (`web/src/plan/RailSearch.tsx`)

Two changes to the search form below the existing `LocationSearch` inputs:

### Date/time field
Replace the `<input type="datetime-local">` with a `FieldButton` showing the formatted value (`vr 28 mei · 18:00` in DM Mono). A hidden native `<input type="datetime-local">` handles the actual value. Clicking the `FieldButton` triggers `.click()` on the hidden input to open the browser's date picker.

Layout: 2-col grid (`grid-cols-2 gap-2`) containing the date/time `FieldButton` and the min. overstap `FieldButton`.

### Min. overstap
Replace the current text label with a `FieldButton` showing `N min`. Clicking opens a small inline stepper panel: `−` / value / `+` buttons in 1-min steps (0–30). Writes to `profile.minTransferSec` via `onProfileChange`. Closes on outside click.

Per-stop rules remain in `MijBoard` only (not duplicated in the rail).

---

## 3. ResultsBoard (`web/src/plan/ResultsBoard.tsx`)

### Board header
Add two ghost buttons on the right of the header row:
- `Bewaar reis` (bookmark icon, `text-fg-dim`) — wires to a new `onSave` prop; for now saves the current origin+dest+arriveBy as a saved route via `api.updateProfile`.
- `Naar agenda` — disabled; tooltip "Gebruik de reisdetail voor agenda-export".

### Result rows
No changes to the 7-column grid structure.

---

## 4. JourneyDetail (`web/src/plan/JourneyDetail.tsx`)

### Summary strip
Add a 6th column — action panel — on the right side of the `grid-cols-[1fr_1fr_1fr_1fr_auto]` strip. The panel contains:
- `Bewaar reis` — signal button; calls `api.updateProfile` to add route to `profile.savedRoutes`.
- `Naar agenda` — ghost button with calendar icon; generates and triggers download of a `.ics` file built client-side from the itinerary data (start time, end time, origin, destination, summary string).

### ICS generation
Pure client-side utility in `web/src/lib/ics.ts`:
```
exportIcs(it: ShapedItinerary, origin: LocationHit, dest: LocationHit): void
```
Builds a minimal VCALENDAR string and triggers a `<a download="reis.ics">` click.

### Walk legs
Replace the current hairline separator row with a proper `WalkLeg` row:
```
Loop {fromName} → {toName} · {N} min
```
Smaller text (`text-xs text-fg-faint`), left-aligned with the existing leg column layout.

---

## 5. BoardToday (`web/src/vandaag/BoardToday.tsx`)

### Header
Add a time-of-day greeting: `Goedemiddag, {profile.name}` (ochtend <12, middag 12–18, avond ≥18). Falls back to `Vandaag` if no profile name. Disruption count stays as subtitle.

### Hero card
Full-width card (`bg-ink-800 rounded-xl border border-line shadow-card`) showing the first saved route active today.

Note: `SavedRoute` has no live trip data (no times, prices). The card shows static route metadata only.

Structure:
- Left section (flex-1): `VOLGENDE REIS · {label}` eyebrow, `{fromName} → {toName}` as the main heading, day-of-week chips.
- Right panel (280px, `bg-ink-850 border-l border-line`): `Plan voor vandaag` signal button that switches to the plan tab with `origin = route.fromGtfsId` and `dest = route.toGtfsId` pre-filled and auto-searches with arrive-by = today 17:30 (or 08:30 if before noon).

Below the card: disruption callout strip if any disruption title matches a saved-route stop name (client-side `includes` check). Shows warn-colored bar: `{disruption.title}` + `Bekijk storing` ghost button.

If no saved routes for today: centered empty state (`Geen vaste reizen voor vandaag · Voeg routes toe via Mij`).

### 2-col grid below hero
- Left column: `Storingen op jouw reizen` — disruptions filtered where `d.title` or `d.area` includes any stop name from today's saved routes. Shows same border-left card style as current.
- Right column: `Jouw vaste reizen` — all `profile.savedRoutes` cards (not just today's). Shows label, from→to, day-of-week chips.

---

## 6. MijBoard (`web/src/mij/MijBoard.tsx`)

Add two new `SettingsBlock` sections after the existing ones:

### Agenda-koppeling
Two rows:
- `Google Agenda` — ghost button `Koppelen →` opens `https://calendar.google.com` in new tab.
- `Apple Agenda` — ghost button `Exporteer .ics` with tooltip "Gebruik de export-knop in reisdetail".

### Abonnementsadvies
Static recommendation block based on `profile.savedRoutes.length`:
- 0 routes: `"Voeg vaste routes toe om een abonnementsadvies te zien."`
- 1–2 routes: suggest `Dal Voordeel` — "40% korting buiten de spits. Geschikt voor jouw reispatroon."
- 3+ routes: suggest `Altijd Voordeel` — "40% korting op alle ritten. Bij 3+ vaste routes meestal voordeliger."

---

## 7. Bewaard tab — new screen

### `RailSaved` (`web/src/bewaard/RailSaved.tsx`)
Shows saved routes from `profile.savedRoutes` as clickable cards:
- Label, `from → to` truncated, day-of-week label, disruption red dot if any disruption matches.
- First card gets `bg-ink-700 border-l-2 border-l-signal` selected style.
- Clicking a card sets it as the active route in a `selectedRouteId` state shared between rail and board.

Below saved routes: `Recent` section — fetches `GET /api/history` and shows last 5 entries as single-line rows (`{date} · {fromName} → {toName} · {dur}`).

### `BoardSaved` (`web/src/bewaard/BoardSaved.tsx`)
Header: `Bewaarde reizen` label, count subtitle.

Content: one card per saved route (`bg-ink-800 rounded-xl border border-line`):
- Same layout as today's hero card but without the price panel.
- `Plan reis →` signal button pre-fills the plan tab (`setTab('plan')` + `plan.setOrigin` + `plan.setDest` + `plan.search()`).

Empty state if `profile.savedRoutes` is empty.

---

## 8. Backend — `/api/history`

### `api/history/store.ts`
```ts
export function listHistory(): HistoryEntry[]
export function addHistory(entry: Omit<HistoryEntry, 'id'>): void
```
Reads/writes `api/data/history.json`. Caps at 50 entries; oldest dropped on overflow. Each entry:
```ts
interface HistoryEntry {
  id: string;          // nanoid
  from: string;        // stop/address id
  fromName: string;
  to: string;
  toName: string;
  when: string;        // ISO datetime
  dur: string;         // formatted "1u 24m"
  date: string;        // display label "vr 28 mei"
}
```

### Routes in `api/server.ts`
```
GET  /api/history         → listHistory()
POST /api/history         → body: Omit<HistoryEntry, 'id'>; calls addHistory(); returns 201
```

### `api/data/history.json`
Added to `.gitignore` alongside `rules.json` and `profile.json`.

### Frontend call
In `web/src/plan/usePlanSearch.ts`, after a successful search returns ≥1 itinerary, call `api.addHistory(...)` (fire-and-forget, no await, errors silently ignored).

Add `addHistory` to `web/src/api.ts`:
```ts
addHistory: (entry) => post('/api/history', entry)
```

---

## Files touched

| File | Change |
|---|---|
| `web/src/App.tsx` | TopNav clock + icons + avatar; Bewaard tab routing; `selectedRouteId` state for Bewaard; pass `setTab`/`plan`/`setOrigin`/`setDest`/`search` down to BoardToday + BoardSaved |
| `web/src/plan/RailSearch.tsx` | FieldButton date/time + min. overstap stepper |
| `web/src/plan/ResultsBoard.tsx` | Board header action buttons |
| `web/src/plan/JourneyDetail.tsx` | Summary strip action panel; improved walk legs |
| `web/src/lib/ics.ts` | New — ICS export utility |
| `web/src/vandaag/BoardToday.tsx` | Greeting + hero card + 2-col grid |
| `web/src/mij/MijBoard.tsx` | Agenda + abonnementsadvies blocks |
| `web/src/bewaard/RailSaved.tsx` | New |
| `web/src/bewaard/BoardSaved.tsx` | New |
| `web/src/api.ts` | `addHistory` method |
| `web/src/types.ts` | `HistoryEntry` type |
| `api/history/store.ts` | New |
| `api/server.ts` | Two new routes |
| `api/data/history.json` | New (git-ignored) |
| `.gitignore` | Add `api/data/history.json` |
