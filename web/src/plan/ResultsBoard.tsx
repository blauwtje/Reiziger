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
            ? <span className="font-mono text-[10px] text-ok">op tijd</span>
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
