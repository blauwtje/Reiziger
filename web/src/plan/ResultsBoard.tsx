import { Fragment, useEffect, useState } from 'react';
import type { ShapedItinerary, LocationHit, Disruption } from '../types';
import { fmtTime, fmtDuration, fmtMin, bufferTone } from '../lib/format';
import { Flap } from '../components/Flap';
import { ModalityRow } from '../components/ModalityGlyph';
import { JourneyDetail } from './JourneyDetail';
import { api } from '../api';

const GRID = 'grid-cols-[110px_110px_100px_1fr_120px_110px_32px]';

export function ResultsBoard({
  itineraries,
  origin,
  dest,
}: {
  itineraries: ShapedItinerary[];
  origin: LocationHit;
  dest: LocationHit;
}) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);

  useEffect(() => { api.disruptions().then(setDisruptions).catch(() => {}); }, []);

  const timeRange = itineraries.length > 0
    ? `${fmtTime(itineraries[0].startTime)} – ${fmtTime(itineraries[itineraries.length - 1].startTime)}`
    : '';

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

      <DisruptionStrip disruptions={disruptions} />

      {/* Column headers */}
      <div className={`grid ${GRID} gap-x-4 px-6 py-2.5 border-b border-line text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint sticky top-0 bg-ink-950/95 backdrop-blur z-10 shrink-0`}>
        <span>Vertrek</span>
        <span>Aank</span>
        <span>Duur</span>
        <span>Overstap</span>
        <span>Spoor</span>
        <span className="text-right">Prijs</span>
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
              detailId={`journey-detail-${i}`}
              onToggle={() => setExpanded((prev) => (prev === i ? null : i))}
            />
            {expanded === i && (
              <JourneyDetail id={`journey-detail-${i}`} it={it} origin={origin} dest={dest} />
            )}
          </Fragment>
        ))}
      </div>

      <BoardFooter count={itineraries.length} timeRange={timeRange} />
    </div>
  );
}

function DisruptionStrip({ disruptions }: { disruptions: Disruption[] }) {
  if (disruptions.length === 0) return null;
  return (
    <div className="border-b border-line shrink-0">
      {disruptions.map((d) => (
        <div key={d.id} className="flex items-center gap-3 px-6 py-2.5 bg-late-bg/60">
          <span className="shrink-0 rounded px-1.5 py-0.5 bg-late-bg text-late text-[10px] font-bold uppercase tracking-[0.08em]">Storing</span>
          <span className="text-sm text-fg flex-1 truncate">{d.title}</span>
          {d.until && <span className="font-mono text-[11px] text-fg-dim shrink-0">tot {d.until}</span>}
        </div>
      ))}
    </div>
  );
}

function BoardFooter({ count, timeRange }: { count: number; timeRange: string }) {
  return (
    <div className="shrink-0 flex items-center gap-3 px-6 py-3 border-t border-line bg-ink-950/70 text-xs text-fg-faint">
      <span className="font-mono">{count} reizen · {timeRange}</span>
    </div>
  );
}

function ResultRow({
  it, index, isFirst, expanded, detailId, onToggle,
}: {
  it: ShapedItinerary;
  index: number;
  isFirst: boolean;
  expanded: boolean;
  detailId: string;
  onToggle: () => void;
}) {
  const firstTransit = it.legs.find((l) => l.transit);
  const lastTransit = [...it.legs].reverse().find((l) => l.transit);
  const depPlatform = firstTransit?.fromPlatform;
  const arrPlatform = lastTransit?.toPlatform;
  const delayMin = firstTransit ? Math.round(firstTransit.departureDelaySec / 60) : 0;
  const transitModes = it.legs.filter((l) => l.transit).map((l) => l.mode);

  return (
    <div
      className={`grid ${GRID} gap-x-4 items-center px-6 py-4 border-b border-line cursor-pointer select-none transition-colors animate-reveal
        ${isFirst
          ? 'bg-gradient-to-r from-signal/5 via-transparent to-transparent border-l-2 border-l-signal'
          : 'border-l-2 border-l-transparent hover:bg-ink-900/40'}
        ${expanded ? 'bg-ink-900/60' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onToggle}
      role="button"
      aria-expanded={expanded}
      aria-controls={detailId}
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

      {/* Overstap */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <ModalityRow modes={transitModes} />
        {it.transferDetails.length > 0 && (
          <span className="text-xs text-fg-dim truncate">
            via {it.transferDetails.map((t) => t.atStopName).join(', ')}
          </span>
        )}
      </div>

      {/* Spoor */}
      <div className="flex items-center gap-1.5 font-mono text-sm">
        {depPlatform && <span className="px-1.5 py-0.5 rounded bg-ink-700 border border-line text-fg-dim">{depPlatform}</span>}
        {depPlatform && arrPlatform && <span className="text-fg-faint">→</span>}
        {arrPlatform && <span className="px-1.5 py-0.5 rounded bg-ink-700 border border-line text-fg-dim">{arrPlatform}</span>}
        {!depPlatform && !arrPlatform && <span className="text-fg-faint">—</span>}
      </div>

      {/* Prijs */}
      <div className="flex flex-col items-end gap-0.5">
        {it.discountFareEuros !== null ? (
          <>
            <span className="font-mono text-sm font-semibold text-fg">€ {it.discountFareEuros.toFixed(2).replace('.', ',')}</span>
            {it.fareEuros !== it.discountFareEuros && (
              <span className="font-mono text-[10px] text-fg-faint line-through">€ {it.fareEuros?.toFixed(2).replace('.', ',')}</span>
            )}
          </>
        ) : (
          <span className="text-xs text-fg-faint">—</span>
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
