import { useEffect, useState } from 'react';
import type { HistoryEntry, Disruption, UserProfile } from '../types';
import { api } from '../api';

interface Props {
  profile: UserProfile | null;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}

const DAY_NL = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

export function RailSaved({ profile, selectedRouteId, onSelectRoute }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);

  useEffect(() => {
    api.history().then(h => setHistory(h.slice(0, 5))).catch(() => {});
    api.disruptions().then(setDisruptions).catch(() => {});
  }, []);

  const savedRoutes = profile?.savedRoutes ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-line shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-0.5">Bewaard</div>
        <div className="text-sm text-fg-dim">{savedRoutes.length} vaste reizen</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {/* Saved route cards */}
        {savedRoutes.length === 0 ? (
          <p className="text-xs text-fg-faint px-2 py-4 text-center">Nog geen vaste reizen</p>
        ) : (
          savedRoutes.map((r, i) => {
            const isSelected = r.id === selectedRouteId || (selectedRouteId === null && i === 0);
            const hasDisruption = disruptions.some(d =>
              d.title.toLowerCase().includes(r.fromName.toLowerCase()) ||
              d.title.toLowerCase().includes(r.toName.toLowerCase()) ||
              (d.area && (d.area.toLowerCase().includes(r.fromName.toLowerCase()) || d.area.toLowerCase().includes(r.toName.toLowerCase())))
            );
            return (
              <button
                key={r.id}
                onClick={() => onSelectRoute(r.id)}
                className={`w-full rounded-lg p-3 text-left transition border ${
                  isSelected
                    ? 'bg-ink-700 border-l-2 border-l-signal border-y-line border-r-line'
                    : 'bg-transparent border-transparent hover:bg-ink-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-fg flex-1 truncate">{r.label}</span>
                  {hasDisruption && <span className="h-2 w-2 rounded-full bg-late shrink-0" />}
                </div>
                <div className="text-xs text-fg-dim mt-0.5 truncate">{r.fromName} → {r.toName}</div>
                <div className="text-[10px] text-fg-faint mt-1.5">
                  {r.daysOfWeek.map(d => DAY_NL[d]).join(' · ')}
                </div>
              </button>
            );
          })
        )}

        {/* Recent section */}
        {history.length > 0 && (
          <div className="mt-4">
            <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">Recent</div>
            {history.map(h => (
              <div key={h.id} className="px-2 py-2 text-xs text-fg-dim">
                {h.date} · {h.fromName} → {h.toName} · {h.dur}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
