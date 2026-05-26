import type { ShapedItinerary, ShapedLeg, LocationHit } from '../types';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { fmtTime, fmtDuration, fmtMin, bufferTone } from '../lib/format';
import { Flap } from '../components/Flap';
import { ModalityGlyph } from '../components/ModalityGlyph';
import { api } from '../api';
import { exportIcs } from '../lib/ics';

export function JourneyDetail({
  id,
  it,
  origin,
  dest,
}: {
  id?: string;
  it: ShapedItinerary;
  origin: LocationHit;
  dest: LocationHit;
}) {
  return (
    <div id={id} className="border-t border-line bg-ink-900/40 animate-reveal">
      {/* 6-cell summary strip */}
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto_auto] border-b border-line/60">
        <SummaryCell label="Vertrek" value={<Flap time={fmtTime(it.startTime)} size="md" tone="signal" />} sub={origin.name} />
        <SummaryCell label="Aankomst" value={<Flap time={fmtTime(it.endTime)} size="md" />} sub={dest.name} />
        <SummaryCell label="Duur" value={<span className="font-mono text-xl font-medium">{fmtDuration(it.durationSec)}</span>} sub={it.transfers === 0 ? 'Direct' : `${it.transfers}× overstap`} />
        <SummaryCell label="CO₂" value={<span className="font-mono text-xl font-medium">{it.co2Grams}g</span>} sub="vs. auto ~12× meer" />
        <SummaryCell label="Prijs" value={
          <span className="font-mono text-xl font-semibold">
            {it.discountFareEuros !== null ? `€ ${it.discountFareEuros.toFixed(2).replace('.', ',')}` : '—'}
          </span>
        } sub={it.fareEuros !== it.discountFareEuros ? <span className="line-through">€ {it.fareEuros?.toFixed(2).replace('.', ',')}</span> : undefined} />
        {/* Action panel */}
        <div className="px-4 py-3 flex flex-col gap-2 justify-center border-l border-line/60">
          <SaveButton it={it} origin={origin} dest={dest} />
          <button
            type="button"
            onClick={() => exportIcs(it, origin, dest)}
            className="flex items-center gap-1.5 rounded-md border border-line bg-transparent px-2.5 py-1.5 text-xs text-fg-dim hover:text-fg transition whitespace-nowrap"
            title="Download .ics"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Naar agenda
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Legs */}
        <ol className="space-y-0">
          {it.legs.map((l, i) =>
            l.transit ? (
              <TransitLeg key={i} l={l} />
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
    </div>
  );
}

function SummaryCell({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="px-5 py-3 border-r border-line/60 last:border-r-0 flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-fg-faint">{label}</span>
      {value}
      {sub && <span className="text-xs text-fg-dim">{sub}</span>}
    </div>
  );
}

function TransitLeg({ l }: { l: ShapedLeg }) {
  const delayMin = Math.round(l.departureDelaySec / 60);
  return (
    <li className="flex items-start gap-3 py-3 border-b border-line/40 last:border-0">
      <div className="flex flex-col items-end gap-1 w-14 shrink-0 pt-0.5">
        <span className="font-mono text-sm text-fg">{fmtTime(l.startTime)}</span>
        {l.fromPlatform && <span className="font-mono text-[10px] text-fg-faint">sp {l.fromPlatform}</span>}
      </div>
      <ModalityGlyph mode={l.mode} size={18} />
      <div className="flex-1 min-w-0 text-sm">
        <span className={`mr-2 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ${modeChip(l.mode)}`}>
          {l.routeShortName ?? l.mode}
        </span>
        <span className="text-fg">{l.fromName}<span className="text-fg-faint mx-1">→</span>{l.toName}</span>
        {l.realTime && <span className="ml-2 text-[10px] uppercase tracking-wider text-ok">live</span>}
        {delayMin > 0 && <span className="ml-1.5 font-mono text-[11px] text-late">+{delayMin}m</span>}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="font-mono text-sm text-fg-dim">{fmtTime(l.endTime)}</span>
        {l.toPlatform && <span className="font-mono text-[10px] text-fg-faint">sp {l.toPlatform}</span>}
      </div>
    </li>
  );
}

function WalkLeg({ l }: { l: ShapedLeg }) {
  const durationMin = Math.round((l.endTime - l.startTime) / 60000);
  return (
    <li className="flex items-center gap-3 py-1.5 text-xs text-fg-faint">
      <span className="w-14 shrink-0" />
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-fg-faint/50">
        <circle cx="12" cy="5" r="1"/>
        <path d="M9 20l3-6 3-2 1-5"/>
        <path d="M6 15l2-3 4 3"/>
      </svg>
      <span>Loop {l.fromName} → {l.toName} · {durationMin} min</span>
    </li>
  );
}

function SaveButton({ origin, dest }: { it: ShapedItinerary; origin: LocationHit; dest: LocationHit }) {
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (saved) return;
    try {
      const profile = await api.profile();
      const newRoute = {
        id: crypto.randomUUID(),
        label: `${origin.name} → ${dest.name}`,
        fromGtfsId: 'gtfsId' in origin ? origin.gtfsId : `addr:${origin.lat},${origin.lon}`,
        fromName: origin.name,
        toGtfsId: 'gtfsId' in dest ? dest.gtfsId : `addr:${dest.lat},${dest.lon}`,
        toName: dest.name,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6] as number[],
      };
      await api.updateProfile({ savedRoutes: [...profile.savedRoutes, newRoute] });
      setSaved(true);
    } catch { /* ignore */ }
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={saved}
      className="flex items-center gap-1.5 rounded-md bg-signal px-2.5 py-1.5 text-xs font-semibold text-ink-950 hover:bg-signal-soft transition disabled:opacity-60 whitespace-nowrap"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      {saved ? 'Bewaard' : 'Bewaar reis'}
    </button>
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
