import { useEffect, useState, type ReactNode } from 'react';
import { api, type Health } from './api';
import { PlanPanel } from './plan/PlanPanel';
import { RulesPanel } from './rules/RulesPanel';

type Tab = 'plan' | 'rules';

export function App() {
  const [tab, setTab] = useState<Tab>('plan');
  const [health, setHealth] = useState<Health | null>(null);

  const refreshHealth = () => api.health().then(setHealth).catch(() => setHealth(null));

  useEffect(() => {
    let alive = true;
    const tick = () => api.health().then((h) => alive && setHealth(h)).catch(() => alive && setHealth(null));
    tick();
    const t = setInterval(tick, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-signal font-bold text-ink-950 shadow-[0_0_24px] shadow-signal/30">
              R
            </span>
            <h1 className="font-mono text-2xl font-medium tracking-tight text-fg">reiziger</h1>
          </div>
          <p className="mt-1.5 text-sm text-fg-dim">
            Arrive-by planning for Dutch transit, with <span className="text-signal">your own transfer buffers</span>.
          </p>
        </div>
        <OtpBadge health={health} />
      </header>

      <nav className="mb-7 flex gap-1 rounded-xl border border-line bg-ink-900/70 p-1 backdrop-blur">
        <TabButton active={tab === 'plan'} onClick={() => setTab('plan')}>
          Plan a journey
        </TabButton>
        <TabButton active={tab === 'rules'} onClick={() => setTab('rules')}>
          Transfer buffers
          {health && health.ruleCount > 0 ? (
            <span className="ml-2 rounded-full bg-signal/20 px-1.5 text-xs text-signal">{health.ruleCount}</span>
          ) : null}
        </TabButton>
      </nav>

      {tab === 'plan' ? <PlanPanel /> : <RulesPanel onChanged={refreshHealth} />}

      <footer className="mt-16 text-center text-xs text-fg-faint">
        Data: OVapi / NDOV open GTFS + GTFS-RT · routing: OpenTripPlanner · buffers enforced via constrained transfers
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        active ? 'bg-ink-700 text-fg shadow' : 'text-fg-dim hover:text-fg'
      }`}
    >
      {children}
    </button>
  );
}

function OtpBadge({ health }: { health: Health | null }) {
  const ok = health?.otp.ok;
  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-ink-900/70 px-3 py-1.5 text-xs">
      <span
        className={`h-2 w-2 rounded-full ${ok ? 'bg-ok shadow-[0_0_8px] shadow-ok/60' : 'bg-late'}`}
      />
      <span className="text-fg-dim">{ok ? 'OTP connected' : health ? 'OTP offline' : 'connecting…'}</span>
    </div>
  );
}
