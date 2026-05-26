import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { StopHit } from '../types';

interface Props {
  label: string;
  value: StopHit | null;
  onChange: (s: StopHit | null) => void;
  placeholder?: string;
}

export function StopSearch({ label, value, onChange, placeholder }: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<StopHit[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    let cancel = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await api.stops(q.trim());
        if (!cancel) setHits(r);
      } catch {
        if (!cancel) setHits([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    }, 220);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">
        {label}
      </label>
      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-ink-850 px-3 py-2.5">
          <div className="min-w-0">
            <div className="truncate font-medium text-fg">{value.name}</div>
            <div className="font-mono text-[11px] text-fg-faint">{value.gtfsId}</div>
          </div>
          <button
            onClick={() => {
              onChange(null);
              setQ('');
              setOpen(true);
            }}
            className="shrink-0 rounded-md px-2 py-1 text-xs text-fg-dim hover:bg-ink-700 hover:text-fg"
          >
            change
          </button>
        </div>
      ) : (
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? 'Search a stop or station…'}
          className="w-full rounded-lg border border-line bg-ink-850 px-3 py-2.5 text-fg outline-none placeholder:text-fg-faint focus:border-signal/60 focus:ring-2 focus:ring-signal/20"
        />
      )}
      {open && !value && (hits.length > 0 || loading) && (
        <div className="absolute z-30 mt-1.5 max-h-72 w-full overflow-auto rounded-lg border border-line bg-ink-900 shadow-2xl shadow-black/50">
          {loading && <div className="px-3 py-2 text-sm text-fg-faint">searching…</div>}
          {hits.map((s) => (
            <button
              key={s.gtfsId}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-ink-800"
            >
              <span className="truncate text-sm text-fg">{s.name}</span>
              <span className="shrink-0 font-mono text-[10px] text-fg-faint">{s.gtfsId.replace('ovapi:', '')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
