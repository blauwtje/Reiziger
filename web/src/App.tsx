import { useEffect, useState } from 'react';
import { api, type Health } from './api';
import type { UserProfile } from './types';
import { usePlanSearch } from './plan/usePlanSearch';
import { RailSearch } from './plan/RailSearch';
import { ResultsBoard } from './plan/ResultsBoard';
import { RailMij } from './mij/RailMij';

type Tab = 'plan' | 'vandaag' | 'bewaard' | 'mij';

const NAV_TABS: { id: Tab; label: string }[] = [
  { id: 'plan',    label: 'Plannen' },
  { id: 'vandaag', label: 'Vandaag' },
  { id: 'bewaard', label: 'Bewaard' },
  { id: 'mij',     label: 'Mij' },
];

export function App() {
  const [tab, setTab] = useState<Tab>('plan');
  const [health, setHealth] = useState<Health | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    api.profile().then(setProfile).catch(() => {});
  }, []);

  const theme = profile?.theme ?? 'dark';
  const activeDiscounts = profile?.discounts.filter(d => d.active).map(d => d.id) ?? [];

  const plan = usePlanSearch({ discounts: activeDiscounts });

  const refreshHealth = () =>
    api.health().then(setHealth).catch(() => setHealth(null));

  useEffect(() => {
    let alive = true;
    const tick = () =>
      api.health()
        .then((h) => alive && setHealth(h))
        .catch(() => alive && setHealth(null));
    tick();
    const t = setInterval(tick, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);

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
                {t.id === 'mij' && health && health.ruleCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-signal/20 px-1.5 text-[11px] text-signal">
                    {health.ruleCount}
                  </span>
                )}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 bg-signal" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 rounded-full border border-line bg-ink-900/70 px-3 py-1.5 text-xs">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              health?.otp.ok
                ? 'bg-ok shadow-[0_0_6px] shadow-ok/60'
                : 'bg-late'
            }`}
          />
          <span className="text-fg-dim">
            {health?.otp.ok ? 'OTP verbonden' : health ? 'OTP offline' : 'verbinden…'}
          </span>
        </div>
      </header>

      {/* Two-pane body */}
      <div className="flex flex-1 min-h-0">
        {/* Left rail */}
        <aside className="w-[380px] shrink-0 border-r border-line flex flex-col min-h-0 bg-ink-950/70">
          {tab !== 'mij' ? (
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
          ) : (
            <RailMij onRulesChanged={refreshHealth} />
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
                />
              ) : !plan.error ? (
                <BoardIdle />
              ) : null}
            </>
          ) : tab === 'mij' ? (
            <MijBoard />
          ) : (
            <ComingSoon tab={tab} />
          )}
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

function MijBoard() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-12 py-20 text-fg-faint">
      <p className="text-sm">Beheer je overstapbuffers in het linkerpaneel.</p>
    </div>
  );
}

function ComingSoon({ tab }: { tab: Tab }) {
  const label = tab === 'vandaag' ? 'Vandaag' : 'Bewaard';
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-12 py-20 text-fg-faint">
      <p className="text-sm font-semibold text-fg-dim">{label}</p>
      <p className="text-xs">Nog niet beschikbaar — gebruik Plannen om een reis te zoeken.</p>
    </div>
  );
}
