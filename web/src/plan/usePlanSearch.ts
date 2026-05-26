import { useState } from 'react';
import { api } from '../api';
import type { ShapedItinerary, LocationHit } from '../types';
import { isStopHit } from '../types';

function defaultArrive(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function locationToParam(loc: LocationHit): string {
  if (isStopHit(loc)) return loc.gtfsId;
  return `${loc.lat},${loc.lon}`;
}

export function usePlanSearch({ discounts = [] }: { discounts?: string[] } = {}) {
  const [origin, setOrigin] = useState<LocationHit | null>(null);
  const [dest, setDest] = useState<LocationHit | null>(null);
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
      const r = await api.plan(locationToParam(origin), locationToParam(dest), arriveBy, discounts);
      r.sort((a, b) => b.startTime - a.startTime);
      setItineraries(r);

      if (r.length > 0) {
        const it = r[0];
        const DAY_NL = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
        const MONTH_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
        const d = new Date(it.startTime);
        const dateLabel = `${DAY_NL[d.getDay()]} ${d.getDate()} ${MONTH_NL[d.getMonth()]}`;
        const durMin = Math.round(it.durationSec / 60);
        const durStr = durMin >= 60 ? `${Math.floor(durMin / 60)}u ${durMin % 60}m` : `${durMin}m`;

        api.addHistory({
          from: locationToParam(origin),
          fromName: origin.name,
          to: locationToParam(dest),
          toName: dest.name,
          when: new Date(it.startTime).toISOString(),
          dur: durStr,
          date: dateLabel,
        }).catch(() => {});
      }
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
