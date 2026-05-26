import type { UserProfile, SavedRoute } from '../types';

interface Props {
  profile: UserProfile | null;
  selectedRouteId: string | null;
  onPlanRoute?: (route: SavedRoute) => void;
}

const DAY_NL = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

export function BoardSaved({ profile, selectedRouteId, onPlanRoute }: Props) {
  const savedRoutes = profile?.savedRoutes ?? [];
  const count = savedRoutes.length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-line shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-1">Bewaarde reizen</div>
        <div className="text-base font-semibold text-fg">{count} reis{count !== 1 ? 'en' : ''} bewaard</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {savedRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-fg-faint">
            <p className="text-sm">Geen bewaarde reizen</p>
            <p className="text-xs">Gebruik "Bewaar reis" in een reisresultaat of detail</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {savedRoutes.map((r) => {
              const isSelected = r.id === selectedRouteId;
              return (
                <div
                  key={r.id}
                  className={`rounded-xl border bg-ink-800 overflow-hidden flex ${isSelected ? 'border-signal/40' : 'border-line'}`}
                >
                  <div className="flex-1 p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-1">{r.label}</div>
                    <div className="text-lg font-bold text-fg mb-2">{r.fromName} → {r.toName}</div>
                    <div className="text-xs text-fg-dim">{r.daysOfWeek.map(d => DAY_NL[d]).join(' · ')}</div>
                  </div>
                  <div className="p-5 flex items-center border-l border-line">
                    <button
                      onClick={() => onPlanRoute?.(r)}
                      className="rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-signal-soft transition whitespace-nowrap"
                    >
                      Plan reis →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
