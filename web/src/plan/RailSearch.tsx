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

export function RailSearch({
  origin, dest, arriveBy,
  onOriginChange, onDestChange, onArriveByChange,
  onSwap, onSearch, loading, canSearch,
  profile, onProfileChange,
}: Props) {
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

        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">
            Aankomst
          </label>
          <input
            type="datetime-local"
            value={arriveBy}
            onChange={(e) => onArriveByChange(e.target.value)}
            className="w-full rounded-lg border border-line bg-ink-850 px-3 py-2.5 font-mono text-sm text-fg outline-none focus:border-signal/60 focus:ring-2 focus:ring-signal/20"
          />
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

        {profile && (
          <div className="border-t border-line pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">Min. overstap</span>
              <span className="font-mono text-xs text-fg-dim">{Math.round(profile.minTransferSec / 60)} min globaal</span>
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
