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
  );
}

function TransitLeg({ l }: { l: ShapedLeg }) {
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
