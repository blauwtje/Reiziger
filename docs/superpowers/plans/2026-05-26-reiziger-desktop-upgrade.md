# Reiziger Desktop Layout Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Reiziger web UI from a single-pane tab layout to a two-pane desktop shell matching the Claude Design prototype, with a fixed left rail and a scrollable right board.

**Architecture:** App.tsx becomes a two-pane shell (TopNav + left rail + right board). State is lifted into a `usePlanSearch` hook consumed by App. The left rail renders context-sensitive content per tab (RailSearch for planning tabs, RailMij for Mij). The right board renders ResultsBoard (upgraded to a 5-column grid with Flap time cells and inline ModalityGlyph icons), with rows expanding to show JourneyDetail.

**Tech Stack:** React 18, Vite, Tailwind v4 (`@tailwindcss/vite`). No new deps. All design tokens are CSS custom properties in `web/src/index.css` under `@theme`. Mode SVG glyphs are inlined in `ModalityGlyph.tsx` as JSX (they use `currentColor` stroke so they need to be inline SVGs, not `<img>`).

---

## File Map

**New files:**
- `web/src/components/Flap.tsx` — split-flap time cell with seam line
- `web/src/components/ModalityGlyph.tsx` — inline SVG mode icon + ModalityRow helper
- `web/src/plan/usePlanSearch.ts` — hook holding all plan search state + actions
- `web/src/plan/RailSearch.tsx` — left rail search form UI (Van/Naar/Aankomst/Plan)
- `web/src/plan/JourneyDetail.tsx` — expandable leg-by-leg journey breakdown
- `web/src/mij/RailMij.tsx` — Mij tab left rail (wraps RulesPanel)

**Modified files:**
- `web/src/index.css` — add `shadow-flap` and `shadow-card` utilities
- `web/src/App.tsx` — rewrite: two-pane shell, TopNav, tab state, usePlanSearch
- `web/src/plan/ResultsBoard.tsx` — rewrite: 5-column grid, Flap, ModalityRow, expand-to-detail
- `web/src/plan/PlanPanel.tsx` — **delete** (replaced by usePlanSearch + RailSearch)

---

## Task 1: Add CSS utilities to index.css

**Files:**
- Modify: `web/src/index.css`

- [ ] **Step 1: Add shadow utilities after the existing `@layer base` block**

In `web/src/index.css`, append after the closing `}` of the `@layer base` block (after line 56):

```css
@layer utilities {
  .shadow-flap {
    box-shadow:
      0 1px 0 rgba(255,255,255,0.04) inset,
      0 -1px 0 rgba(0,0,0,0.6) inset,
      0 2px 6px rgba(0,0,0,0.5);
  }
  .shadow-card {
    box-shadow:
      0 1px 0 rgba(255,255,255,0.02) inset,
      0 8px 24px rgba(0,0,0,0.45);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/index.css
git commit -m "style: add shadow-flap and shadow-card utilities"
```

---

## Task 2: Create Flap.tsx

**Files:**
- Create: `web/src/components/Flap.tsx`

The Flap component renders a monospace time string (e.g. "16:42") in a dark chip with a hairline seam across the middle, mimicking a physical split-flap display cell.

- [ ] **Step 1: Create the file**

Create `web/src/components/Flap.tsx` with this content:

```tsx
type FlapSize = 'sm' | 'md' | 'lg' | 'xl';
type FlapTone = 'fg' | 'signal' | 'late';

const SIZE: Record<FlapSize, string> = {
  sm: 'text-sm px-2 py-1',
  md: 'text-xl px-2.5 py-1.5',
  lg: 'text-3xl px-3.5 py-2.5',
  xl: 'text-5xl px-4 py-3',
};

const TONE: Record<FlapTone, string> = {
  fg:     'text-fg',
  signal: 'text-signal',
  late:   'text-late',
};

export function Flap({
  time,
  size = 'lg',
  tone = 'fg',
}: {
  time: string;
  size?: FlapSize;
  tone?: FlapTone;
}) {
  return (
    <span
      className={`relative inline-block ${SIZE[size]} font-mono tabular-nums leading-none bg-ink-800 border border-line rounded-md shadow-flap ${TONE[tone]}`}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-px bg-ink-950/60 pointer-events-none"
      />
      {time}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/Flap.tsx
git commit -m "feat: add Flap split-flap time cell component"
```

---

## Task 3: Create ModalityGlyph.tsx

**Files:**
- Create: `web/src/components/ModalityGlyph.tsx`

SVGs use `stroke="currentColor"` so they must be inline (not `<img>`). OTP mode names are uppercase (RAIL, BUS, TRAM, SUBWAY, FERRY, WALK); SUBWAY maps to the metro glyph.

- [ ] **Step 1: Create the file**

Create `web/src/components/ModalityGlyph.tsx`:

```tsx
import { Fragment } from 'react';

const COLOR: Record<string, string> = {
  RAIL:   'text-rail',
  BUS:    'text-bus',
  TRAM:   'text-tram',
  SUBWAY: 'text-metro',
  FERRY:  'text-ferry',
  WALK:   'text-fg-faint',
};

const PATHS: Record<string, JSX.Element> = {
  RAIL: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="6" width="20" height="18" rx="3"/>
      <path d="M6 18h20"/>
      <rect x="9" y="9" width="6" height="6" rx="1"/>
      <rect x="17" y="9" width="6" height="6" rx="1"/>
      <circle cx="11" cy="21" r="1"/>
      <circle cx="21" cy="21" r="1"/>
      <path d="M9 26l-2 2M23 26l2 2"/>
    </svg>
  ),
  BUS: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="6" width="20" height="18" rx="3"/>
      <path d="M6 13h20M6 19h20"/>
      <rect x="9" y="9" width="4" height="3" rx="0.5"/>
      <rect x="15" y="9" width="4" height="3" rx="0.5"/>
      <rect x="21" y="9" width="2" height="3" rx="0.5"/>
      <circle cx="11" cy="21" r="1.2"/>
      <circle cx="21" cy="21" r="1.2"/>
      <path d="M9 26l-1 2M23 26l1 2"/>
    </svg>
  ),
  TRAM: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 3v3M9 6h14"/>
      <rect x="7" y="8" width="18" height="16" rx="2"/>
      <path d="M7 17h18"/>
      <rect x="10" y="11" width="4" height="4" rx="0.5"/>
      <rect x="18" y="11" width="4" height="4" rx="0.5"/>
      <circle cx="11" cy="21" r="1"/>
      <circle cx="21" cy="21" r="1"/>
      <path d="M5 27h22"/>
    </svg>
  ),
  SUBWAY: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 5h16a2 2 0 0 1 2 2v18a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V7a2 2 0 0 1 2-2z"/>
      <path d="M6 17h20"/>
      <rect x="9" y="8" width="14" height="6" rx="1"/>
      <path d="M11 22h10"/>
      <circle cx="11" cy="20" r="0.6" fill="currentColor"/>
      <circle cx="21" cy="20" r="0.6" fill="currentColor"/>
    </svg>
  ),
  FERRY: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 22c2 2 4 2 6 0s4-2 6 0 4 2 6 0 4-2 6 0"/>
      <path d="M5 18l3-6h16l3 6"/>
      <path d="M8 18V8h7M15 8h6l3 4M8 11h6"/>
      <circle cx="11" cy="15" r="1"/>
      <circle cx="17" cy="15" r="1"/>
      <circle cx="22" cy="15" r="1"/>
    </svg>
  ),
  WALK: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="6" r="2.5"/>
      <path d="M14 14l3-3 3 1 3 5M17 11l-3 6 4 3v6M14 17l-4 2 1 5"/>
    </svg>
  ),
};

export function ModalityGlyph({ mode, size = 18 }: { mode: string; size?: number }) {
  const svg = PATHS[mode] ?? PATHS.WALK;
  const color = COLOR[mode] ?? 'text-fg-faint';
  return (
    <span className={`inline-block shrink-0 ${color}`} style={{ width: size, height: size }}>
      {svg}
    </span>
  );
}

export function ModalityRow({ modes }: { modes: string[] }) {
  const transit = modes.filter((m) => m !== 'WALK');
  return (
    <span className="inline-flex items-center gap-1.5">
      {transit.map((m, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="w-2 h-px bg-line shrink-0" />}
          <ModalityGlyph mode={m} size={16} />
        </Fragment>
      ))}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/ModalityGlyph.tsx
git commit -m "feat: add ModalityGlyph inline SVG icons and ModalityRow"
```

---

## Task 4: Create usePlanSearch.ts

**Files:**
- Create: `web/src/plan/usePlanSearch.ts`

Extracts all plan search state that was previously inline in PlanPanel.tsx.

- [ ] **Step 1: Create the file**

Create `web/src/plan/usePlanSearch.ts`:

```ts
import { useState } from 'react';
import { api } from '../api';
import type { ShapedItinerary, StopHit } from '../types';

function defaultArrive(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function usePlanSearch() {
  const [origin, setOrigin] = useState<StopHit | null>(null);
  const [dest, setDest] = useState<StopHit | null>(null);
  const [arriveBy, setArriveBy] = useState(defaultArrive());
  const [itineraries, setItineraries] = useState<ShapedItinerary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch = Boolean(origin && dest && arriveBy) && !loading;

  async function search() {
    if (!origin || !dest) return;
    setLoading(true);
    setError(null);
    setItineraries(null);
    try {
      const r = await api.plan(origin.gtfsId, dest.gtfsId, arriveBy);
      r.sort((a, b) => b.startTime - a.startTime);
      setItineraries(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function swap() {
    const tmp = origin;
    setOrigin(dest);
    setDest(tmp);
  }

  return {
    origin, setOrigin,
    dest, setDest,
    arriveBy, setArriveBy,
    itineraries,
    loading,
    error,
    canSearch,
    search,
    swap,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/plan/usePlanSearch.ts
git commit -m "feat: extract usePlanSearch hook from PlanPanel"
```

---

## Task 5: Create RailSearch.tsx

**Files:**
- Create: `web/src/plan/RailSearch.tsx`

Left rail search form. Receives all state from `usePlanSearch` via props. Pure presentation.

- [ ] **Step 1: Create the file**

Create `web/src/plan/RailSearch.tsx`:

```tsx
import type { StopHit } from '../types';
import { StopSearch } from '../components/StopSearch';

interface Props {
  origin: StopHit | null;
  dest: StopHit | null;
  arriveBy: string;
  onOriginChange: (s: StopHit | null) => void;
  onDestChange: (s: StopHit | null) => void;
  onArriveByChange: (v: string) => void;
  onSwap: () => void;
  onSearch: () => void;
  loading: boolean;
  canSearch: boolean;
}

export function RailSearch({
  origin, dest, arriveBy,
  onOriginChange, onDestChange, onArriveByChange,
  onSwap, onSearch, loading, canSearch,
}: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pb-4 border-b border-line shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-0.5">
          Plan een reis
        </div>
        <div className="text-sm text-fg-dim">Aankomst op jouw bestemming</div>
      </div>

      <div className="flex flex-col gap-3.5 p-4 overflow-y-auto">
        <StopSearch
          label="Van"
          value={origin}
          onChange={onOriginChange}
          placeholder="Vertrekstation of halte…"
        />

        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 h-px bg-line" />
          <button
            onClick={onSwap}
            title="Wissel van/naar"
            className="rounded-md border border-line bg-ink-850 p-1.5 text-fg-dim hover:text-fg transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3v18M3 7l4-4 4 4M17 21V3M21 17l-4 4-4-4"/>
            </svg>
          </button>
        </div>

        <StopSearch
          label="Naar"
          value={dest}
          onChange={onDestChange}
          placeholder="Bestemmingsstation of halte…"
        />

        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">
            Aankomst
          </label>
          <input
            type="datetime-local"
            value={arriveBy}
            onChange={(e) => onArriveByChange(e.target.value)}
            className="w-full rounded-lg border border-line bg-ink-850 px-3 py-2.5 font-mono text-sm text-fg outline-none focus:border-signal/60 focus:ring-2 focus:ring-signal/20"
          />
        </div>

        <button
          onClick={onSearch}
          disabled={!canSearch}
          className="w-full rounded-lg bg-signal px-5 py-3 font-semibold text-ink-950 shadow-[0_0_24px] shadow-signal/20 transition hover:bg-signal-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Plannen…' : 'Plan reis'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/plan/RailSearch.tsx
git commit -m "feat: add RailSearch left rail search form"
```

---

## Task 6: Create JourneyDetail.tsx

**Files:**
- Create: `web/src/plan/JourneyDetail.tsx`

Shows leg-by-leg breakdown for an expanded itinerary row. Replaces the inline `Timeline` + `Transfers` rendering from the old `ResultsBoard`.

- [ ] **Step 1: Create the file**

Create `web/src/plan/JourneyDetail.tsx`:

```tsx
import type { ShapedItinerary, ShapedLeg, StopHit } from '../types';
import { fmtTime, fmtDuration, fmtMin, bufferTone } from '../lib/format';
import { Flap } from '../components/Flap';
import { ModalityGlyph } from '../components/ModalityGlyph';

export function JourneyDetail({
  it,
  origin,
  dest,
}: {
  it: ShapedItinerary;
  origin: StopHit;
  dest: StopHit;
}) {
  return (
    <div className="border-t border-line bg-ink-900/40 px-6 py-5 animate-reveal">
      {/* Summary */}
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3 mb-5 pb-4 border-b border-line/60">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-fg-faint mb-1.5">Vertrek</div>
          <Flap time={fmtTime(it.startTime)} size="md" tone="signal" />
          <div className="text-xs text-fg-dim mt-1">{origin.name}</div>
        </div>
        <div className="flex items-center self-center mt-4 text-fg-faint font-mono">→</div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-fg-faint mb-1.5">Aankomst</div>
          <Flap time={fmtTime(it.endTime)} size="md" />
          <div className="text-xs text-fg-dim mt-1">{dest.name}</div>
        </div>
        <div className="ml-auto text-right self-center">
          <div className="font-mono text-lg font-medium text-fg">{fmtDuration(it.durationSec)}</div>
          <div className="text-xs text-fg-dim">
            {it.transfers === 0 ? 'Direct' : `${it.transfers} overstap${it.transfers === 1 ? '' : 'pen'}`}
          </div>
        </div>
      </div>

      {/* Legs */}
      <ol className="space-y-0">
        {it.legs.map((l, i) =>
          l.transit ? (
            <TransitLeg key={i} l={l} isLast={i === it.legs.length - 1} />
          ) : (
            <WalkLeg key={i} l={l} />
          ),
        )}
      </ol>

      {/* Transfer buffers */}
      {it.transferDetails.length > 0 && (
        <div className="mt-5 pt-4 border-t border-line/60">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-2">
            Overstapmarge
          </div>
          <div className="space-y-1.5">
            {it.transferDetails.map((t, i) => {
              const tone = bufferTone(t.bufferSec);
              return (
                <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span
                    className={`inline-flex min-w-[60px] items-center justify-center rounded-md px-2 py-0.5 font-mono text-sm ring-1 ${tone.text} ${tone.ring}`}
                  >
                    {fmtMin(t.bufferSec)}
                  </span>
                  <span className="text-fg-dim">in</span>
                  <span className="text-fg">{t.atStopName}</span>
                  <span className="text-fg-faint text-xs">
                    {t.fromRoute ?? '?'} → {t.toRoute ?? '?'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TransitLeg({ l, isLast }: { l: ShapedLeg; isLast: boolean }) {
  const delayMin = Math.round(l.departureDelaySec / 60);
  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-line/40 last:border-0">
      <span className="w-12 shrink-0 pt-0.5 text-right font-mono text-sm text-fg">
        {fmtTime(l.startTime)}
      </span>
      <ModalityGlyph mode={l.mode} size={18} />
      <span className="min-w-0 text-sm flex-1">
        <span className={`mr-2 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ${modeChip(l.mode)}`}>
          {l.routeShortName ?? l.mode}
        </span>
        <span className="text-fg">
          {l.fromName}
          <span className="text-fg-faint mx-1">→</span>
          {l.toName}
        </span>
        {l.realTime && (
          <span className="ml-2 text-[10px] uppercase tracking-wider text-ok">live</span>
        )}
        {delayMin > 0 && (
          <span className="ml-1.5 font-mono text-[11px] text-late">+{delayMin}m</span>
        )}
      </span>
      <span className="shrink-0 font-mono text-sm text-fg-dim">
        {fmtTime(l.endTime)}
      </span>
    </li>
  );
}

function WalkLeg({ l }: { l: ShapedLeg }) {
  const durationMin = Math.round((l.endTime - l.startTime) / 60000);
  return (
    <li className="flex items-center gap-3 py-1.5 text-xs text-fg-faint">
      <span className="w-12 shrink-0" />
      <span className="ml-0.5 h-4 w-px bg-line shrink-0" />
      <span>{durationMin} min lopen / wisselen</span>
    </li>
  );
}

const CHIP: Record<string, string> = {
  RAIL:   'bg-rail/15 text-rail ring-rail/30',
  BUS:    'bg-bus/15 text-bus ring-bus/30',
  TRAM:   'bg-tram/15 text-tram ring-tram/30',
  SUBWAY: 'bg-metro/15 text-metro ring-metro/30',
  FERRY:  'bg-ferry/15 text-ferry ring-ferry/30',
};

function modeChip(mode: string): string {
  return CHIP[mode] ?? 'bg-ink-800 text-fg-dim ring-line';
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/plan/JourneyDetail.tsx
git commit -m "feat: add JourneyDetail leg-by-leg journey breakdown component"
```

---

## Task 7: Rewrite ResultsBoard.tsx

**Files:**
- Modify: `web/src/plan/ResultsBoard.tsx`

New layout: sticky column header + one row per itinerary. Columns: Vertrek · Aank · Duur · Via · Buffer · ›. First row has amber left border (latest safe departure). Any row expands to show JourneyDetail inline.

- [ ] **Step 1: Replace the file entirely**

Write `web/src/plan/ResultsBoard.tsx` with:

```tsx
import { Fragment, useState } from 'react';
import type { ShapedItinerary, StopHit } from '../types';
import { fmtTime, fmtDuration, fmtMin, bufferTone } from '../lib/format';
import { Flap } from '../components/Flap';
import { ModalityRow } from '../components/ModalityGlyph';
import { JourneyDetail } from './JourneyDetail';

export function ResultsBoard({
  itineraries,
  origin,
  dest,
}: {
  itineraries: ShapedItinerary[];
  origin: StopHit;
  dest: StopHit;
}) {
  const [expanded, setExpanded] = useState<number | null>(0);

  if (itineraries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8 py-16">
        <div className="text-fg-faint text-sm">
          Geen reizen gevonden die op tijd aankomen. Probeer een later aankomsttijdstip.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Board header */}
      <div className="px-6 py-4 border-b border-line shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-1">Resultaten</div>
        <div className="text-base font-semibold text-fg">
          {origin.name}
          <span className="text-fg-faint mx-2 font-normal">→</span>
          {dest.name}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[100px_100px_100px_1fr_180px_32px] gap-x-4 px-6 py-2.5 border-b border-line text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint sticky top-0 bg-ink-950/95 backdrop-blur z-10 shrink-0">
        <span>Vertrek</span>
        <span>Aank</span>
        <span>Duur</span>
        <span>Via</span>
        <span>Buffer</span>
        <span />
      </div>

      {/* Rows */}
      <div className="flex-1">
        {itineraries.map((it, i) => (
          <Fragment key={`${it.startTime}-${i}`}>
            <ResultRow
              it={it}
              index={i}
              isFirst={i === 0}
              expanded={expanded === i}
              onToggle={() => setExpanded(expanded === i ? null : i)}
            />
            {expanded === i && (
              <JourneyDetail it={it} origin={origin} dest={dest} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function ResultRow({
  it,
  index,
  isFirst,
  expanded,
  onToggle,
}: {
  it: ShapedItinerary;
  index: number;
  isFirst: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const firstTransit = it.legs.find((l) => l.transit);
  const delayMin = firstTransit ? Math.round(firstTransit.departureDelaySec / 60) : 0;
  const transitModes = it.legs.filter((l) => l.transit).map((l) => l.mode);

  return (
    <div
      className={`grid grid-cols-[100px_100px_100px_1fr_180px_32px] gap-x-4 items-center px-6 py-4 border-b border-line cursor-pointer select-none transition-colors animate-reveal
        ${isFirst
          ? 'bg-gradient-to-r from-signal/5 via-transparent to-transparent border-l-2 border-l-signal'
          : 'border-l-2 border-l-transparent hover:bg-ink-900/40'}
        ${expanded ? 'bg-ink-900/60' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onToggle}
      role="button"
      aria-expanded={expanded}
    >
      {/* Vertrek */}
      <div className="flex flex-col gap-1">
        <Flap time={fmtTime(it.startTime)} size="md" tone={isFirst ? 'signal' : 'fg'} />
        {delayMin > 0 ? (
          <span className="font-mono text-[10px] text-late">+{delayMin}m</span>
        ) : (
          firstTransit?.realTime
            ? <span className="font-mono text-[10px] text-ok pulse">op tijd</span>
            : null
        )}
      </div>

      {/* Aank */}
      <div>
        <Flap time={fmtTime(it.endTime)} size="md" />
      </div>

      {/* Duur */}
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-base font-medium text-fg">{fmtDuration(it.durationSec)}</span>
        <span className="text-xs text-fg-faint">
          {it.transfers === 0 ? 'Direct' : `${it.transfers}× over`}
        </span>
      </div>

      {/* Via */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <ModalityRow modes={transitModes} />
        {it.transferDetails.length > 0 && (
          <span className="text-xs text-fg-dim truncate">
            via {it.transferDetails.map((t) => t.atStopName).join(', ')}
          </span>
        )}
      </div>

      {/* Buffer */}
      <div className="flex flex-col gap-1">
        {it.transferDetails.length === 0 ? (
          <span className="text-xs text-fg-faint">Direct</span>
        ) : (
          it.transferDetails.slice(0, 2).map((t, i) => {
            const tone = bufferTone(t.bufferSec);
            return (
              <span
                key={i}
                className={`font-mono text-[11px] px-1.5 py-0.5 rounded ring-1 w-fit ${tone.text} ${tone.ring}`}
              >
                {fmtMin(t.bufferSec)} · {t.atStopName.split(/[\s,]/)[0]}
              </span>
            );
          })
        )}
      </div>

      {/* Expand chevron */}
      <div className="flex items-center justify-end">
        <svg
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-fg-faint transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
        >
          <path d="M9 6l6 6-6 6"/>
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/plan/ResultsBoard.tsx
git commit -m "feat: upgrade ResultsBoard to grid layout with Flap cells and ModalityRow"
```

---

## Task 8: Create RailMij.tsx

**Files:**
- Create: `web/src/mij/RailMij.tsx`

Wraps the existing `RulesPanel` in a left-rail container. The rail is scrollable so the RulesPanel's sticky rebuild bar appears at the bottom of the scrollable area (not viewport-sticky, which doesn't work inside overflow-auto). Remove the `sticky` behavior by overriding with a bottom padding on the scroll container.

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p web/src/mij
```

Create `web/src/mij/RailMij.tsx`:

```tsx
import { RulesPanel } from '../rules/RulesPanel';

export function RailMij({ onRulesChanged }: { onRulesChanged: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pb-4 border-b border-line shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-0.5">Mij</div>
        <div className="text-sm text-fg-dim">Overstapbuffers &amp; instellingen</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <RulesPanel onChanged={onRulesChanged} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/mij/RailMij.tsx
git commit -m "feat: add RailMij wrapper for RulesPanel in Mij tab"
```

---

## Task 9: Rewrite App.tsx

**Files:**
- Modify: `web/src/App.tsx`

Full rewrite. App becomes a two-pane shell. Contains `TopNav` as an internal function (it's small and App-specific). Uses `usePlanSearch` for all plan state. The health polling stays. `RailSearch` renders in the left rail for plan/vandaag/bewaard tabs; `RailMij` for the mij tab. The right board renders `ResultsBoard` when results exist, a placeholder when idle, and coming-soon panels for unimplemented tabs.

- [ ] **Step 1: Replace App.tsx entirely**

Write `web/src/App.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { api, type Health } from './api';
import { usePlanSearch } from './plan/usePlanSearch';
import { RailSearch } from './plan/RailSearch';
import { ResultsBoard } from './plan/ResultsBoard';
import { RailMij } from './mij/RailMij';

type Tab = 'plan' | 'vandaag' | 'bewaard' | 'mij';

const NAV_TABS: { id: Tab; label: string }[] = [
  { id: 'plan',     label: 'Plannen' },
  { id: 'vandaag',  label: 'Vandaag' },
  { id: 'bewaard',  label: 'Bewaard' },
  { id: 'mij',      label: 'Mij' },
];

export function App() {
  const [tab, setTab] = useState<Tab>('plan');
  const [health, setHealth] = useState<Health | null>(null);
  const plan = usePlanSearch();

  const refreshHealth = () =>
    api.health().then(setHealth).catch(() => setHealth(null));

  useEffect(() => {
    let alive = true;
    const tick = () =>
      api.health()
        .then((h) => alive && setHealth(h))
        .catch(() => alive && setHealth(null));
    tick();
    const t = setInterval(tick, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-ink-950">
      {/* Top nav */}
      <header className="flex h-14 shrink-0 items-center border-b border-line bg-ink-950/95 px-5 backdrop-blur z-20">
        <div className="flex items-center gap-2.5 mr-7">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-signal font-extrabold text-ink-950 shadow-[0_0_20px] shadow-signal/30 text-lg leading-none">
            R
          </span>
          <span className="font-mono text-base font-medium tracking-tight text-fg">reiziger</span>
        </div>

        <nav className="flex items-center gap-0 h-full">
          {NAV_TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative h-full px-4 text-sm transition ${
                  active ? 'font-semibold text-fg' : 'font-medium text-fg-dim hover:text-fg'
                }`}
              >
                {t.label}
                {t.id === 'mij' && health && health.ruleCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-signal/20 px-1.5 text-[11px] text-signal">
                    {health.ruleCount}
                  </span>
                )}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 bg-signal" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 rounded-full border border-line bg-ink-900/70 px-3 py-1.5 text-xs">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              health?.otp.ok
                ? 'bg-ok shadow-[0_0_6px] shadow-ok/60'
                : 'bg-late'
            }`}
          />
          <span className="text-fg-dim">
            {health?.otp.ok ? 'OTP verbonden' : health ? 'OTP offline' : 'verbinden…'}
          </span>
        </div>
      </header>

      {/* Two-pane body */}
      <div className="flex flex-1 min-h-0">
        {/* Left rail */}
        <aside className="w-[380px] shrink-0 border-r border-line flex flex-col min-h-0 bg-ink-950/70">
          {tab !== 'mij' ? (
            <RailSearch
              origin={plan.origin}
              dest={plan.dest}
              arriveBy={plan.arriveBy}
              onOriginChange={plan.setOrigin}
              onDestChange={plan.setDest}
              onArriveByChange={plan.setArriveBy}
              onSwap={plan.swap}
              onSearch={plan.search}
              loading={plan.loading}
              canSearch={plan.canSearch}
            />
          ) : (
            <RailMij onRulesChanged={refreshHealth} />
          )}
        </aside>

        {/* Right board */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {tab === 'plan' ? (
            <>
              {plan.error && (
                <div className="m-6 rounded-xl border border-late/40 bg-late/10 px-4 py-3 text-sm text-late">
                  {plan.error}
                </div>
              )}
              {plan.itineraries !== null && plan.origin && plan.dest ? (
                <ResultsBoard
                  itineraries={plan.itineraries}
                  origin={plan.origin}
                  dest={plan.dest}
                />
              ) : !plan.error ? (
                <BoardIdle />
              ) : null}
            </>
          ) : tab === 'mij' ? (
            <MijBoard />
          ) : (
            <ComingSoon tab={tab} />
          )}
        </main>
      </div>

      <footer className="shrink-0 text-center text-xs text-fg-faint py-2 border-t border-line/50">
        OVapi / NDOV open GTFS + GTFS-RT · routing: OpenTripPlanner · buffers via constrained transfers
      </footer>
    </div>
  );
}

function BoardIdle() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-12 py-20 text-fg-faint">
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-fg-faint/30">
        <rect x="6" y="6" width="20" height="18" rx="3"/>
        <path d="M6 18h20"/>
        <rect x="9" y="9" width="6" height="6" rx="1"/>
        <rect x="17" y="9" width="6" height="6" rx="1"/>
        <circle cx="11" cy="21" r="1"/>
        <circle cx="21" cy="21" r="1"/>
        <path d="M9 26l-2 2M23 26l2 2"/>
      </svg>
      <p className="text-sm">Voer een vertrek- en bestemmingsstation in en klik op <strong className="text-fg-dim">Plan reis</strong>.</p>
    </div>
  );
}

function MijBoard() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-12 py-20 text-fg-faint">
      <p className="text-sm">Beheer je overstapbuffers in het linkerpaneel.</p>
    </div>
  );
}

function ComingSoon({ tab }: { tab: Tab }) {
  const label = tab === 'vandaag' ? 'Vandaag' : 'Bewaard';
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-12 py-20 text-fg-faint">
      <p className="text-sm font-semibold text-fg-dim">{label}</p>
      <p className="text-xs">Nog niet beschikbaar — gebruik Plannen om een reis te zoeken.</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/App.tsx
git commit -m "feat: rewrite App.tsx as two-pane desktop shell with TopNav"
```

---

## Task 10: Delete PlanPanel.tsx

**Files:**
- Delete: `web/src/plan/PlanPanel.tsx`

PlanPanel is fully replaced by `usePlanSearch` + `RailSearch` + `ResultsBoard`. If any import of PlanPanel remains, the build will error and you'll see the exact location to fix.

- [ ] **Step 1: Delete the file**

```bash
git rm web/src/plan/PlanPanel.tsx
```

- [ ] **Step 2: Verify build compiles**

```bash
cd web && npm run build 2>&1 | tail -20
```

Expected: build succeeds with no errors. If there are import errors, find the file importing `PlanPanel` and remove/update the import.

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor: remove PlanPanel (replaced by usePlanSearch + RailSearch + ResultsBoard)"
```

---

## Task 11: Verify and run

- [ ] **Step 1: Start the dev server**

From the repo root:
```bash
node scripts/dev.mjs
```

Or start just the web:
```bash
cd web && npm run dev
```

- [ ] **Step 2: Smoke-test the UI**

Open `http://localhost:5173` (or whatever port Vite reports).

Check:
- Two-pane layout fills viewport (no centered narrow card)
- TopNav shows reiziger logo + R mark + Plannen/Vandaag/Bewaard/Mij tabs
- Left rail shows the Van/Naar search form
- Clicking "Mij" tab switches left rail to RulesPanel
- Clicking "Vandaag" or "Bewaard" shows the coming-soon placeholder in the right board
- OTP badge in top-right shows correct state
- Search: enter two stops + arrival time → click "Plan reis" → results appear in grid
- Results grid shows columns: Vertrek (Flap) · Aank (Flap) · Duur · Via (ModalityRow) · Buffer
- First result row has amber left border
- Clicking a row expands JourneyDetail with leg list and transfer buffers
- Clicking same row again collapses it

- [ ] **Step 3: Final commit (if any last-minute fixes were needed)**

```bash
git add -p
git commit -m "fix: post-integration tweaks from smoke test"
```
