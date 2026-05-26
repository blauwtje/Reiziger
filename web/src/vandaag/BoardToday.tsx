import { useEffect, useState } from 'react';
import type { Disruption, UserProfile } from '../types';
import { api } from '../api';
import { ModalityGlyph } from '../components/ModalityGlyph';

const DAY_NL = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const MONTH_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

export function BoardToday({ profile }: { profile: UserProfile | null }) {
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const now = new Date();
  const dateLabel = `${DAY_NL[now.getDay()]} ${now.getDate()} ${MONTH_NL[now.getMonth()]} · ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const today = now.getDay();
  const savedRoutes = profile?.savedRoutes.filter(r => r.daysOfWeek.includes(today)) ?? [];

  useEffect(() => { api.disruptions().then(setDisruptions).catch(() => {}); }, []);

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-6 border-b border-line shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-1">{dateLabel}</div>
        <h2 className="text-2xl font-bold tracking-tight text-fg">Vandaag</h2>
        {disruptions.length > 0 && (
          <div className="text-sm text-warn mt-1">{disruptions.length} storing{disruptions.length === 1 ? '' : 'en'} op jouw routes</div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 grid grid-cols-[1.4fr_1fr] gap-6 content-start">

        {savedRoutes.length > 0 && (
          <div className="col-span-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-3">Jouw vaste reizen vandaag</div>
            <div className="flex flex-col gap-3">
              {savedRoutes.map((r) => (
                <div key={r.id} className="rounded-lg border border-line bg-ink-800 p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-fg">{r.label}</div>
                    <div className="text-xs text-fg-dim mt-0.5">{r.fromName} → {r.toName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {savedRoutes.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center gap-3 py-12 text-center text-fg-faint">
            <p className="text-sm">Geen vaste reizen voor vandaag.</p>
            <p className="text-xs">Voeg vaste routes toe via <strong className="text-fg-dim">Mij</strong>.</p>
          </div>
        )}

        {disruptions.length > 0 && (
          <div className="col-span-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-3">Storingen</div>
            <div className="flex flex-col gap-3">
              {disruptions.map((d) => (
                <div key={d.id} className={`rounded-lg border-l-2 p-4 ${d.severity === 'high' ? 'border-l-late bg-late-bg/40' : 'border-l-warn bg-warn-bg/40'} border border-line`}>
                  <div className="flex items-center gap-2 mb-1">
                    <ModalityGlyph mode={d.modality} size={14} />
                    <span className="text-xs text-fg-dim">{d.area}</span>
                    {d.until && <span className="font-mono text-[10px] text-fg-faint ml-auto">tot {d.until}</span>}
                  </div>
                  <div className="font-semibold text-sm">{d.title}</div>
                  <div className="text-xs text-fg-dim mt-1">{d.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
