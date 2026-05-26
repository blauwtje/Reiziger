import { useEffect, useRef, useState } from 'react';
import type { LocationHit, StopHit, AddressHit } from '../types';
import { api } from '../api';

interface Props {
  label: string;
  value: LocationHit | null;
  onChange: (v: LocationHit | null) => void;
  placeholder?: string;
}

export function LocationSearch({ label, value, onChange, placeholder = 'Station of adres…' }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [stops, setStops] = useState<StopHit[]>([]);
  const [addresses, setAddresses] = useState<AddressHit[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setStops([]); setAddresses([]); return; }
    const id = setTimeout(async () => {
      const [s, a] = await Promise.all([api.stops(query), api.geocode(query)]);
      setStops(s);
      setAddresses(a);
    }, 220);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, []);

  const results: LocationHit[] = [...stops, ...addresses];

  return (
    <div ref={ref} className="relative">
      <label className="flex items-center gap-2.5 rounded-lg border border-line bg-ink-850 px-3 py-2.5 focus-within:border-signal/60 focus-within:ring-2 focus-within:ring-signal/20 transition cursor-text">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-fg-faint w-7 shrink-0">{label}</span>
        {value && !open ? (
          <button
            className="flex-1 text-sm text-left text-fg truncate"
            onClick={() => { setQuery(''); setOpen(true); }}
          >
            {value.name}
          </button>
        ) : (
          <input
            autoFocus={open}
            className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
            placeholder={placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
        )}
        {value && (
          <button onClick={() => { onChange(null); setQuery(''); }} className="text-fg-faint hover:text-fg transition text-xs">✕</button>
        )}
      </label>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-line bg-ink-800 shadow-card overflow-hidden max-h-64 overflow-y-auto">
          {stops.length > 0 && (
            <li className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-fg-faint border-b border-line">Stations & haltes</li>
          )}
          {stops.map((s) => (
            <li key={s.gtfsId}>
              <button
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-ink-700 flex items-center gap-2.5 transition"
                onClick={() => { onChange(s); setOpen(false); setQuery(''); }}
              >
                <span className="text-fg truncate">{s.name}</span>
                {s.code && <span className="font-mono text-xs text-fg-faint">{s.code}</span>}
              </button>
            </li>
          ))}
          {addresses.length > 0 && (
            <li className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-fg-faint border-t border-b border-line">Adressen</li>
          )}
          {addresses.map((a, i) => (
            <li key={i}>
              <button
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-ink-700 flex items-center gap-2 transition"
                onClick={() => { onChange(a); setOpen(false); setQuery(''); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-fg-faint shrink-0"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span className="text-fg truncate">{a.name}</span>
                <span className="text-xs text-fg-faint truncate ml-auto max-w-[140px]">{a.displayName.split(',').slice(1, 3).join(',')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
