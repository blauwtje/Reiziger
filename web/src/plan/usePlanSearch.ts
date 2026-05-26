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
