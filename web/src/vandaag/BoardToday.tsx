import { useEffect, useState } from 'react';
import type { Disruption, UserProfile } from '../types';
import { api } from '../api';

const DAY_NL = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const MONTH_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function greeting(name?: string): string {
  const h = new Date().getHours();
  const time = h < 12 ? 'ochtend' : h < 18 ? 'middag' : 'avond';
  return name ? `Goede${time}, ${name}` : 'Vandaag';
}

interface Props {
  profile: UserProfile | null;
  onPlanRoute?: (fromGtfsId: string, toGtfsId: string) => void;
}

export function BoardToday({ profile, onPlanRoute }: Props) {
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);

  const now = new Date();
  const dateLabel = `${DAY_NL[now.getDay()]} ${now.getDate()} ${MONTH_NL[now.getMonth()]} · ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const today = now.getDay();

  useEffect(() => { api.disruptions().then(setDisruptions).catch(() => {}); }, []);

  const savedRoutes = profile?.savedRoutes ?? [];
  const todayRoutes = savedRoutes.filter(r => r.daysOfWeek.includes(today));
  const heroRoute = todayRoutes[0] ?? null;

  const todayStopNames = todayRoutes.flatMap(r => [r.fromName, r.toName]);

  const relevantDisruptions = disruptions.filter(d =>
    todayStopNames.some(name => d.title.toLowerCase().includes(name.toLowerCase()) || (d.area && d.area.toLowerCase().includes(name.toLowerCase())))
  );

  const profileName = (profile as any)?.name as string | undefined;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-line shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-1">{dateLabel}</div>
        <h2 className="text-2xl font-bold tracking-tight text-fg">{greeting(profileName)}</h2>
        {disruptions.length > 0 && (
          <div className="text-sm text-warn mt-1">{disruptions.length} storing{disruptions.length === 1 ? '' : 'en'} op jouw routes</div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        {heroRoute ? (
          <>
            <div className="rounded-xl border border-line bg-ink-800 shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden flex">
              <div className="flex-1 p-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-2">
                  VOLGENDE REIS · {heroRoute.label}
                </div>
                <div className="text-xl font-bold text-fg mb-3">
                  {heroRoute.fromName} → {heroRoute.toName}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {heroRoute.daysOfWeek.map(d => (
                    <span key={d} className={`rounded px-2 py-0.5 text-xs font-medium border ${d === today ? 'bg-signal-bg border-signal-line text-signal' : 'bg-ink-700 border-line text-fg-dim'}`}>
                      {DAY_NL[d]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-[280px] shrink-0 bg-ink-850 border-l border-line p-6 flex flex-col items-start justify-center gap-3">
                <div className="text-sm text-fg-dim">Plan jouw reis voor vandaag</div>
                <button
                  onClick={() => onPlanRoute?.(heroRoute.fromGtfsId, heroRoute.toGtfsId)}
                  className="rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-signal-soft transition shadow-[0_0_16px] shadow-signal/20"
                >
                  Plan voor vandaag
                </button>
              </div>
            </div>

            {relevantDisruptions.length > 0 && (
              <div className="rounded-lg border border-warn/30 bg-warn-bg/40 px-4 py-3 flex items-center gap-3">
                <div className="flex-1 text-sm font-medium text-fg">{relevantDisruptions[0].title}</div>
                <button className="text-xs text-fg-dim border border-line rounded px-2 py-1 hover:text-fg transition">
                  Bekijk storing
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-fg-faint">
            <p className="text-sm">Geen vaste reizen voor vandaag</p>
            <p className="text-xs">Voeg routes toe via <strong className="text-fg-dim">Mij</strong></p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-3">Storingen op jouw reizen</div>
            {relevantDisruptions.length === 0 ? (
              <p className="text-xs text-fg-faint">Geen storingen op jouw routes</p>
            ) : (
              <div className="flex flex-col gap-3">
                {relevantDisruptions.map(d => (
                  <div key={d.id} className={`rounded-lg border-l-2 p-4 ${d.severity === 'high' ? 'border-l-late bg-late-bg/40' : 'border-l-warn bg-warn-bg/40'} border border-line`}>
                    <div className="font-semibold text-sm text-fg mb-1">{d.title}</div>
                    <div className="text-xs text-fg-dim">{d.area}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-3">Jouw vaste reizen</div>
            {savedRoutes.length === 0 ? (
              <p className="text-xs text-fg-faint">Nog geen vaste reizen opgeslagen</p>
            ) : (
              <div className="flex flex-col gap-3">
                {savedRoutes.map(r => (
                  <div key={r.id} className="rounded-lg border border-line bg-ink-800 p-4">
                    <div className="font-semibold text-sm text-fg">{r.label}</div>
                    <div className="text-xs text-fg-dim mt-0.5">{r.fromName} → {r.toName}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.daysOfWeek.map(d => (
                        <span key={d} className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-ink-700 border border-line text-fg-dim">
                          {DAY_NL[d]}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
