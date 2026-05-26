import { useState } from 'react';
import { api } from '../api';
import type { ShapedItinerary, StopHit } from '../types';
import { StopSearch } from '../components/StopSearch';
import { ResultsBoard } from './ResultsBoard';

function defaultArrive(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PlanPanel() {
  const [origin, setOrigin] = useState<StopHit | null>(null);
  const [dest, setDest] = useState<StopHit | null>(null);
  const [arriveBy, setArriveBy] = useState(defaultArrive());
  const [its, setIts] = useState<ShapedItinerary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch = Boolean(origin && dest && arriveBy) && !loading;

  async function run() {
    if (!origin || !dest) return;
    setLoading(true);
    setError(null);
    setIts(null);
    try {
      const r = await api.plan(origin.gtfsId, dest.gtfsId, arriveBy);
      r.sort((a, b) => b.startTime - a.startTime); // latest safe departure first
      setIts(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="rounded-2xl border border-line bg-ink-900/70 p-5 backdrop-blur sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <StopSearch label="From" value={origin} onChange={setOrigin} placeholder="Origin station or stop…" />
          <StopSearch label="To" value={dest} onChange={setDest} placeholder="Destination station or stop…" />
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">
              Arrive by
            </label>
            <input
              type="datetime-local"
              value={arriveBy}
              onChange={(e) => setArriveBy(e.target.value)}
              className="rounded-lg border border-line bg-ink-850 px-3 py-2.5 font-mono text-sm text-fg outline-none focus:border-signal/60 focus:ring-2 focus:ring-signal/20"
            />
          </div>
          <button
            onClick={() => {
              setOrigin(dest);
              setDest(origin);
            }}
            title="Swap origin and destination"
            className="rounded-lg border border-line bg-ink-850 px-3 py-2.5 text-fg-dim hover:text-fg"
          >
            ⇅
          </button>
          <button
            onClick={run}
            disabled={!canSearch}
            className="ml-auto rounded-lg bg-signal px-5 py-2.5 font-semibold text-ink-950 shadow-[0_0_24px] shadow-signal/20 transition hover:bg-signal-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Planning…' : 'Find departures'}
          </button>
        </div>
      </section>

      {error && (
        <div className="mt-5 rounded-xl border border-late/40 bg-late/10 px-4 py-3 text-sm text-late">{error}</div>
      )}
      {its && origin && dest && <ResultsBoard itineraries={its} origin={origin} dest={dest} />}
    </div>
  );
}
