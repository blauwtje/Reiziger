import type { ShapedItinerary, ShapedLeg, LocationHit } from '../types';
import type { ReactNode } from 'react';
import { fmtTime, fmtDuration, fmtMin, bufferTone } from '../lib/format';
import { Flap } from '../components/Flap';
import { ModalityGlyph } from '../components/ModalityGlyph';

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
      {/* 5-cell summary strip */}
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] border-b border-line/60">
        <SummaryCell label="Vertrek" value={<Flap time={fmtTime(it.startTime)} size="md" tone="signal" />} sub={origin.name} />
        <SummaryCell label="Aankomst" value={<Flap time={fmtTime(it.endTime)} size="md" />} sub={dest.name} />
        <SummaryCell label="Duur" value={<span className="font-mono text-xl font-medium">{fmtDuration(it.durationSec)}</span>} sub={it.transfers === 0 ? 'Direct' : `${it.transfers}× overstap`} />
        <SummaryCell label="CO₂" value={<span className="font-mono text-xl font-medium">{it.co2Grams}g</span>} sub="vs. auto ~12× meer" />
        <SummaryCell label="Prijs" value={
          <span className="font-mono text-xl font-semibold">
            {it.discountFareEuros !== null ? `€ ${it.discountFareEuros.toFixed(2).replace('.', ',')}` : '—'}
          </span>
        } sub={it.fareEuros !== it.discountFareEuros ? <span className="line-through">€ {it.fareEuros?.toFixed(2).replace('.', ',')}</span> : undefined} />
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
