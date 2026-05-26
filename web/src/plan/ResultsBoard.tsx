import { useState } from 'react';
import type { ShapedItinerary, ShapedLeg, StopHit } from '../types';
import { fmtTime, fmtDuration, fmtMin, modeStyle, modeLabel, bufferTone } from '../lib/format';

export function ResultsBoard({
  itineraries,
  origin,
  dest,
}: {
  itineraries: ShapedItinerary[];
  origin: StopHit;
  dest: StopHit;
}) {
  if (itineraries.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-line bg-ink-900/70 px-4 py-8 text-center text-fg-dim">
        No journeys found that arrive in time. Try an earlier arrival, or check your stops.
      </div>
    );
  }
  const [hero, ...rest] = itineraries;
  return (
    <div className="mt-6 space-y-3">
      <Hero it={hero} origin={origin} dest={dest} />
      {rest.length > 0 && (
        <div className="px-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">
          Earlier departures
        </div>
      )}
      {rest.map((it, i) => (
        <Row key={`${it.startTime}-${i}`} it={it} delay={i} />
      ))}
    </div>
  );
}

function Hero({ it, origin, dest }: { it: ShapedItinerary; origin: StopHit; dest: StopHit }) {
  return (
    <div className="animate-flap overflow-hidden rounded-2xl border border-signal/30 bg-gradient-to-b from-ink-850 to-ink-900 p-6 shadow-[0_0_40px] shadow-signal/10">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-signal">Leave as late as</div>
      <div className="mt-1 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div className="font-mono text-6xl font-medium leading-none tabular-nums text-signal">{fmtTime(it.startTime)}</div>
        <div className="pb-1 text-sm text-fg-dim">
          <div>
            from <span className="text-fg">{origin.name}</span>
          </div>
          <div>
            arrive <span className="font-mono text-fg">{fmtTime(it.endTime)}</span> at{' '}
            <span className="text-fg">{dest.name}</span>
          </div>
        </div>
        <div className="ml-auto pb-1 text-right text-sm text-fg-dim">
          <div className="font-mono text-fg">{fmtDuration(it.durationSec)}</div>
          <div>
            {it.transfers} transfer{it.transfers === 1 ? '' : 's'}
          </div>
        </div>
      </div>
      <LegStrip it={it} />
      <div className="mt-5 border-t border-line/70 pt-4">
        <Timeline it={it} />
      </div>
      <Transfers it={it} />
    </div>
  );
}

function Row({ it, delay }: { it: ShapedItinerary; delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="animate-reveal rounded-xl border border-line bg-ink-900/70"
      style={{ animationDelay: `${delay * 55}ms` }}
    >
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left sm:gap-4">
        <div className="font-mono text-2xl tabular-nums text-fg">{fmtTime(it.startTime)}</div>
        <span className="text-fg-faint">→</span>
        <div className="font-mono text-2xl tabular-nums text-fg-dim">{fmtTime(it.endTime)}</div>
        <div className="ml-2 hidden md:block">
          <LegStrip it={it} compact />
        </div>
        <div className="ml-auto text-right text-sm">
          <div className="font-mono text-fg-dim">{fmtDuration(it.durationSec)}</div>
          <div className="text-fg-faint">
            {it.transfers} transfer{it.transfers === 1 ? '' : 's'}
          </div>
        </div>
        <span className={`text-fg-faint transition ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open && (
        <div className="border-t border-line px-5 py-4">
          <Timeline it={it} />
          <Transfers it={it} />
        </div>
      )}
    </div>
  );
}

function LegStrip({ it, compact }: { it: ShapedItinerary; compact?: boolean }) {
  const legs = it.legs.filter((l) => l.transit);
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? '' : 'mt-4'}`}>
      {legs.map((l, i) => {
        const st = modeStyle(l.mode);
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-fg-faint">·</span>}
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${st.chip}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
              {l.routeShortName ?? modeLabel(l.mode)}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function Timeline({ it }: { it: ShapedItinerary }) {
  return (
    <ol className="space-y-1.5">
      {it.legs.map((l, i) => (l.transit ? <TransitStep key={i} l={l} /> : <WalkStep key={i} l={l} />))}
    </ol>
  );
}

function TransitStep({ l }: { l: ShapedLeg }) {
  const st = modeStyle(l.mode);
  const delayMin = Math.round(l.departureDelaySec / 60);
  return (
    <li className="flex items-start gap-3">
      <span className="w-12 shrink-0 pt-0.5 text-right font-mono text-sm text-fg">{fmtTime(l.startTime)}</span>
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${st.dot}`} />
      <span className="min-w-0 text-sm">
        <span className={`mr-2 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ${st.chip}`}>
          {l.routeShortName ?? modeLabel(l.mode)}
        </span>
        <span className="text-fg">
          {l.fromName} <span className="text-fg-faint">→</span> {l.toName}
        </span>
        {l.realTime && <span className="ml-2 text-[10px] uppercase tracking-wider text-ok">live</span>}
        {delayMin > 0 && <span className="ml-1.5 font-mono text-[11px] text-late">+{delayMin}m</span>}
      </span>
    </li>
  );
}

function WalkStep({ l }: { l: ShapedLeg }) {
  return (
    <li className="flex items-center gap-3 text-xs text-fg-faint">
      <span className="w-12" />
      <span className="ml-[3px] h-3 w-px bg-line" />
      <span>{fmtMin((l.endTime - l.startTime) / 1000)} walk / change</span>
    </li>
  );
}

function Transfers({ it }: { it: ShapedItinerary }) {
  if (it.transferDetails.length === 0) {
    return <div className="mt-4 text-sm text-fg-dim">Direct — no transfers.</div>;
  }
  return (
    <div className="mt-5 space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">Transfer buffers</div>
      {it.transferDetails.map((t, i) => {
        const tone = bufferTone(t.bufferSec);
        return (
          <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className={`inline-flex min-w-[68px] items-center justify-center rounded-md px-2 py-1 font-mono ring-1 ${tone.text} ${tone.ring}`}>
              {fmtMin(t.bufferSec)}
            </span>
            <span className="text-fg-dim">at</span>
            <span className="text-fg">{t.atStopName}</span>
            <span className="text-fg-faint">
              {t.fromRoute ?? '?'} <span className="text-fg-faint">→</span> {t.toRoute ?? '?'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
