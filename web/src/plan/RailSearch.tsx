import { useRef, useEffect, useState } from 'react';
import type { LocationHit, UserProfile } from '../types';
import { LocationSearch } from '../components/LocationSearch';

interface Props {
  origin: LocationHit | null;
  dest: LocationHit | null;
  arriveBy: string;
  onOriginChange: (s: LocationHit | null) => void;
  onDestChange: (s: LocationHit | null) => void;
  onArriveByChange: (v: string) => void;
  onSwap: () => void;
  onSearch: () => void;
  loading: boolean;
  canSearch: boolean;
  profile?: UserProfile | null;
  onProfileChange?: (p: UserProfile) => void;
}

const DISCOUNT_LABELS: Record<string, string> = {
  'dal-voordeel':    'Dal Voordeel',
  'altijd-voordeel': 'Altijd Voordeel',
  'ov-jaarkaart':    'OV-jaarkaart',
  'dal-vrij':        'Dal Vrij',
};

const DAY_NL = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const MONTH_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function formatDateTimeLabel(value: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const day = DAY_NL[d.getDay()];
  const date = d.getDate();
  const month = MONTH_NL[d.getMonth()];
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${day} ${date} ${month} · ${time}`;
}

function MinOverstapField({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">
        Min. overstap
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-lg border border-line bg-ink-850 px-3 py-2.5 font-mono text-sm text-fg text-left hover:border-signal/40 transition"
      >
        {value} min
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-line bg-ink-800 p-2 flex items-center gap-2 z-10 shadow-lg">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            className="h-7 w-7 rounded border border-line bg-ink-700 text-fg-dim hover:text-fg flex items-center justify-center text-base font-medium transition"
          >
            −
          </button>
          <span className="flex-1 text-center font-mono text-sm text-fg">{value}</span>
          <button
            type="button"
            onClick={() => onChange(Math.min(30, value + 1))}
            className="h-7 w-7 rounded border border-line bg-ink-700 text-fg-dim hover:text-fg flex items-center justify-center text-base font-medium transition"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

export function RailSearch({
  origin, dest, arriveBy,
  onOriginChange, onDestChange, onArriveByChange,
  onSwap, onSearch, loading, canSearch,
  profile, onProfileChange,
}: Props) {
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pb-4 border-b border-line shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-0.5">
          Plan een reis
        </div>
        <div className="text-sm text-fg-dim">Aankomst op jouw bestemming</div>
      </div>

      <div className="flex flex-col gap-3.5 p-4 overflow-y-auto">
        <LocationSearch
          label="Van"
          value={origin}
          onChange={onOriginChange}
          placeholder="Station of adres…"
        />

        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 h-px bg-line" />
          <button
            onClick={onSwap}
            title="Wissel van/naar"
            className="rounded-md border border-line bg-ink-850 p-1.5 text-fg-dim hover:text-fg transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3v18M3 7l4-4 4 4M17 21V3M21 17l-4 4-4-4"/>
            </svg>
          </button>
        </div>

        <LocationSearch
          label="Naar"
          value={dest}
          onChange={onDestChange}
          placeholder="Station of adres…"
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">
              Aankomst
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => hiddenDateRef.current?.showPicker?.()}
                className="w-full rounded-lg border border-line bg-ink-850 px-3 py-2.5 font-mono text-sm text-fg text-left hover:border-signal/40 transition"
              >
                {formatDateTimeLabel(arriveBy)}
              </button>
              <input
                ref={hiddenDateRef}
                type="datetime-local"
                value={arriveBy}
                onChange={(e) => onArriveByChange(e.target.value)}
                className="absolute inset-0 opacity-0 pointer-events-none"
                tabIndex={-1}
              />
            </div>
          </div>

          {profile && onProfileChange ? (
            <MinOverstapField
              value={Math.round(profile.minTransferSec / 60)}
              onChange={(n) => onProfileChange({ ...profile, minTransferSec: n * 60 })}
            />
          ) : (
            <div />
          )}
        </div>

        {profile && profile.discounts.length > 0 && (
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">Kortingen</div>
            <div className="flex flex-wrap gap-2">
              {profile.discounts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    if (!onProfileChange) return;
                    const updated = { ...profile, discounts: profile.discounts.map(x => x.id === d.id ? { ...x, active: !x.active } : x) };
                    onProfileChange(updated);
                  }}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium border transition ${
                    d.active
                      ? 'bg-signal-bg border-signal-line text-signal'
                      : 'bg-ink-850 border-line text-fg-dim hover:text-fg'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${d.active ? 'bg-signal' : 'bg-fg-faint'}`} />
                  {DISCOUNT_LABELS[d.id] ?? d.id}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onSearch}
          disabled={!canSearch}
          className="w-full rounded-lg bg-signal px-5 py-3 font-semibold text-ink-950 shadow-[0_0_24px] shadow-signal/20 transition hover:bg-signal-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Plannen…' : 'Plan reis'}
        </button>
      </div>
    </div>
  );
}
