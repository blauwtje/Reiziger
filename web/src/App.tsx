import { useEffect, useState } from 'react';
import { api } from './api';
import type { UserProfile, SavedRoute, StopHit } from './types';
import { usePlanSearch } from './plan/usePlanSearch';
import { RailSearch } from './plan/RailSearch';
import { ResultsBoard } from './plan/ResultsBoard';
import { RailMij } from './mij/RailMij';
import { MijBoard } from './mij/MijBoard';
import { BoardToday } from './vandaag/BoardToday';
import { RailSaved } from './bewaard/RailSaved';
import { BoardSaved } from './bewaard/BoardSaved';

type Tab = 'plan' | 'vandaag' | 'bewaard' | 'mij';

const NAV_TABS: { id: Tab; label: string }[] = [
  { id: 'plan',    label: 'Plannen' },
  { id: 'vandaag', label: 'Vandaag' },
  { id: 'bewaard', label: 'Bewaard' },
  { id: 'mij',     label: 'Mij' },
];

export function App() {
  const [tab, setTab] = useState<Tab>('plan');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  useEffect(() => {
    api.profile().then(setProfile).catch(() => {});
  }, []);

  const theme = profile?.theme ?? 'dark';
  const activeDiscounts = profile?.discounts.filter(d => d.active).map(d => d.id) ?? [];

  const plan = usePlanSearch({ discounts: activeDiscounts });

  return (
    <div data-theme={theme} className="flex flex-col h-screen overflow-hidden bg-ink-950">
      {/* Top nav */}
      <header className="flex h-14 shrink-0 items-center border-b border-line bg-ink-950/95 px-5 backdrop-blur z-20">
        <div className="flex items-center gap-2.5 mr-7">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-signal font-extrabold text-ink-950 shadow-[0_0_20px] shadow-signal/30 text-lg leading-none">
            R
          </span>
          <span className="font-mono text-base font-medium tracking-tight text-fg">reiziger</span>
        </div>

        <nav className="flex items-center gap-0 h-full">
          {NAV_TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative h-full px-4 text-sm transition ${
                  active ? 'font-semibold text-fg' : 'font-medium text-fg-dim hover:text-fg'
                }`}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 bg-signal" />
                )}
              </button>
            );
          })}
        </nav>

        <HeaderRight profile={profile} />
      </header>

      {/* Two-pane body */}
      <div className="flex flex-1 min-h-0">
        {/* Left rail */}
        <aside className="w-[380px] shrink-0 border-r border-line flex flex-col min-h-0 bg-ink-950/70">
          {tab === 'plan' || tab === 'vandaag' ? (
            <RailSearch
              origin={plan.origin}
              dest={plan.dest}
              arriveBy={plan.arriveBy}
              onOriginChange={plan.setOrigin}
              onDestChange={plan.setDest}
              onArriveByChange={plan.setArriveBy}
              onSwap={plan.swap}
              onSearch={plan.search}
              loading={plan.loading}
              canSearch={plan.canSearch}
              profile={profile}
              onProfileChange={(p) => { setProfile(p); api.updateProfile(p); }}
            />
          ) : tab === 'bewaard' ? (
            <RailSaved
              profile={profile}
              selectedRouteId={selectedRouteId}
              onSelectRoute={setSelectedRouteId}
            />
          ) : (
            <RailMij onRulesChanged={() => {}} />
          )}
        </aside>

        {/* Right board */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {tab === 'plan' ? (
            <>
              {plan.error && (
                <div className="m-6 rounded-xl border border-late/40 bg-late/10 px-4 py-3 text-sm text-late">
                  {plan.error}
                </div>
              )}
              {plan.itineraries !== null && plan.origin && plan.dest ? (
                <ResultsBoard
                  itineraries={plan.itineraries}
                  origin={plan.origin}
                  dest={plan.dest}
                  onSave={async () => {
                    if (!plan.origin || !plan.dest) return;
                    const current = await api.profile();
                    const newRoute = {
                      id: crypto.randomUUID(),
                      label: `${plan.origin.name} → ${plan.dest.name}`,
                      fromGtfsId: 'gtfsId' in plan.origin ? plan.origin.gtfsId : `addr:${plan.origin.lat},${plan.origin.lon}`,
                      fromName: plan.origin.name,
                      toGtfsId: 'gtfsId' in plan.dest ? plan.dest.gtfsId : `addr:${plan.dest.lat},${plan.dest.lon}`,
                      toName: plan.dest.name,
                      daysOfWeek: [0,1,2,3,4,5,6],
                    };
                    const updated = await api.updateProfile({ savedRoutes: [...current.savedRoutes, newRoute] });
                    setProfile(updated);
                  }}
                />
              ) : !plan.error ? (
                <BoardIdle />
              ) : null}
            </>
          ) : tab === 'mij' ? (
            <MijBoard profile={profile} onProfileChange={(p) => { setProfile(p); api.updateProfile(p); }} />
          ) : tab === 'vandaag' ? (
            <BoardToday profile={profile} />
          ) : tab === 'bewaard' ? (
            <BoardSaved
              profile={profile}
              selectedRouteId={selectedRouteId}
              onPlanRoute={(r: SavedRoute) => {
                const from: StopHit = { gtfsId: r.fromGtfsId, name: r.fromName, code: null, lat: 0, lon: 0, parentStation: null };
                const to: StopHit = { gtfsId: r.toGtfsId, name: r.toName, code: null, lat: 0, lon: 0, parentStation: null };
                plan.setOrigin(from);
                plan.setDest(to);
                plan.search();
                setTab('plan');
              }}
            />
          ) : null}
        </main>
      </div>

      <footer className="shrink-0 text-center text-xs text-fg-faint py-2 border-t border-line/50">
        OVapi / NDOV open GTFS + GTFS-RT · routing: OpenTripPlanner · buffers via constrained transfers
      </footer>
    </div>
  );
}

function BoardIdle() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-12 py-20 text-fg-faint">
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-fg-faint/30">
        <rect x="6" y="6" width="20" height="18" rx="3"/>
        <path d="M6 18h20"/>
        <rect x="9" y="9" width="6" height="6" rx="1"/>
        <rect x="17" y="9" width="6" height="6" rx="1"/>
        <circle cx="11" cy="21" r="1"/>
        <circle cx="21" cy="21" r="1"/>
        <path d="M9 26l-2 2M23 26l2 2"/>
      </svg>
      <p className="text-sm">Voer een vertrek- en bestemmingsstation in en klik op <strong className="text-fg-dim">Plan reis</strong>.</p>
    </div>
  );
}

function HeaderRight({ profile }: { profile: UserProfile | null }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const DAY_NL = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  const MONTH_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const clock = `${DAY_NL[now.getDay()]} ${now.getDate()} ${MONTH_NL[now.getMonth()]} · ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const initials = (profile as any)?.name
    ? (profile as any).name.split(' ').slice(0, 2).map((s: string) => s[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="ml-auto flex items-center gap-2">
      <span className="font-mono text-[12px] text-fg-faint">{clock}</span>
      <div className="w-px h-5 bg-line" />
      <button className="flex h-[34px] w-[34px] items-center justify-center rounded-md border border-line bg-transparent text-fg-dim">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </button>
      <button className="flex h-[34px] w-[34px] items-center justify-center rounded-md border border-line bg-transparent text-fg-dim">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-700 border border-line text-[12px] font-semibold text-fg">
        {initials}
      </div>
    </div>
  );
}
