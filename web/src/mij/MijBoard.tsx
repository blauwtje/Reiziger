import { useState, useEffect, type ReactNode } from 'react';
import type { UserProfile, Advice } from '../types';
import { api } from '../api';

interface Props {
  profile: UserProfile | null;
  onProfileChange: (p: UserProfile) => void;
}

function SettingsBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-ink-800 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-3">{title}</div>
      {children}
    </section>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-line last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-fg">{label}</div>
        {sub && <div className="text-xs text-fg-dim">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (n: number) => void; min: number; max: number; step?: number }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-20 rounded border border-line bg-ink-850 px-2 py-1 font-mono text-sm text-fg text-right outline-none focus:border-signal/60"
    />
  );
}

const DISCOUNT_LABELS: Record<string, string> = {
  'dal-voordeel':    'Dal Voordeel (40% korting dal)',
  'altijd-voordeel': 'Altijd Voordeel (40% altijd)',
  'ov-jaarkaart':    'OV-jaarkaart (trein gratis)',
  'dal-vrij':        'Dal Vrij (trein gratis dal)',
};

export function MijBoard({ profile, onProfileChange }: Props) {
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  useEffect(() => {
    if (!profile || profile.savedRoutes.length === 0) {
      setAdvice(null);
      return;
    }
    setAdviceLoading(true);
    api.advice().then(setAdvice).catch((err) => { console.error('advice fetch failed:', err); setAdvice(null); }).finally(() => setAdviceLoading(false));
  }, [profile]);

  if (!profile) return <div className="flex items-center justify-center h-full text-fg-faint text-sm">Laden…</div>;

  const update = (patch: Partial<UserProfile>) => onProfileChange({ ...profile, ...patch });

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-6 border-b border-line shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-1">Instellingen</div>
        <h2 className="text-2xl font-bold tracking-tight text-fg">Mij</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-5 content-start">

        <SettingsBlock title="Reisprofiel">
          <Row label="Min. overstaptijd" sub="globaal minimum">
            <div className="flex items-center gap-2">
              <NumberInput
                value={Math.round(profile.minTransferSec / 60)}
                min={0} max={30}
                onChange={(n) => update({ minTransferSec: n * 60 })}
              />
              <span className="text-xs text-fg-faint">min</span>
            </div>
          </Row>
          <Row label="Loopsnelheid" sub="standaard 4,5 km/u">
            <div className="flex items-center gap-2">
              <NumberInput value={profile.walkSpeedKmh} min={1} max={10} step={0.5} onChange={(n) => update({ walkSpeedKmh: n })} />
              <span className="text-xs text-fg-faint">km/u</span>
            </div>
          </Row>
          <Row label="Fietssnelheid" sub="standaard 16 km/u">
            <div className="flex items-center gap-2">
              <NumberInput value={profile.bikeSpeedKmh} min={5} max={40} step={1} onChange={(n) => update({ bikeSpeedKmh: n })} />
              <span className="text-xs text-fg-faint">km/u</span>
            </div>
          </Row>
        </SettingsBlock>

        <SettingsBlock title="Kortingen &amp; abonnement">
          {profile.discounts.map((d) => (
            <Row key={d.id} label={DISCOUNT_LABELS[d.id] ?? d.id}>
              <button
                onClick={() => update({
                  discounts: profile.discounts.map(x => x.id === d.id ? { ...x, active: !x.active } : x),
                })}
                className={`relative w-10 h-6 rounded-full transition-colors ${d.active ? 'bg-signal' : 'bg-ink-600'}`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${d.active ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </Row>
          ))}
        </SettingsBlock>

        <SettingsBlock title="Weergave">
          <Row label="Thema">
            <div className="flex rounded-md border border-line overflow-hidden text-xs font-semibold">
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update({ theme: t })}
                  className={`px-3 py-1.5 transition ${profile.theme === t ? 'bg-signal text-ink-950' : 'bg-transparent text-fg-dim hover:text-fg'}`}
                >
                  {t === 'dark' ? 'Donker' : 'Licht'}
                </button>
              ))}
            </div>
          </Row>
        </SettingsBlock>

        <SettingsBlock title="Vaste reizen">
          {profile.savedRoutes.length === 0 ? (
            <p className="text-sm text-fg-faint py-2">Nog geen vaste reizen opgeslagen.</p>
          ) : (
            profile.savedRoutes.map((r) => (
              <Row key={r.id} label={r.label} sub={`${r.fromName} → ${r.toName}`}>
                <button
                  onClick={() => update({ savedRoutes: profile.savedRoutes.filter(x => x.id !== r.id) })}
                  className="text-xs text-fg-faint hover:text-late transition"
                >
                  Verwijder
                </button>
              </Row>
            ))
          )}
        </SettingsBlock>

        <SettingsBlock title="Agenda-koppeling">
          <Row label="Google Agenda">
            <button
              onClick={() => window.open('https://calendar.google.com', '_blank')}
              className="text-xs border border-line rounded px-2.5 py-1.5 text-fg-dim hover:text-fg transition"
            >
              Koppelen →
            </button>
          </Row>
          <Row label="Apple Agenda" sub="Gebruik de export-knop in reisdetail">
            <button
              disabled
              title="Gebruik de export-knop in reisdetail"
              className="text-xs border border-line rounded px-2.5 py-1.5 text-fg-faint opacity-50 cursor-not-allowed"
            >
              Exporteer .ics
            </button>
          </Row>
        </SettingsBlock>

        <SettingsBlock title="Abonnementsadvies">
          {!profile.savedRoutes.length ? (
            <p className="text-sm text-fg-faint py-2">Voeg vaste routes toe om een abonnementsadvies te zien.</p>
          ) : adviceLoading || !advice ? (
            <p className="text-sm text-fg-faint py-2">Berekenen…</p>
          ) : advice.recommended === null ? (
            <p className="text-sm text-fg-faint py-2">Voeg vaste routes toe om een abonnementsadvies te zien.</p>
          ) : (
            <div className="py-1 space-y-1">
              {advice.options.map((opt) => (
                <div key={opt.subscriptionId} className={`flex items-center justify-between py-1.5 px-2 rounded ${opt.subscriptionId === advice.recommended ? 'bg-signal/10 border border-signal/30' : ''}`}>
                  <span className={`text-sm ${opt.subscriptionId === advice.recommended ? 'font-semibold text-fg' : 'text-fg-dim'}`}>
                    {opt.label}
                    {opt.subscriptionId === advice.recommended && <span className="ml-1.5 text-xs text-signal">★ aanbevolen</span>}
                  </span>
                  <span className="text-sm font-mono text-fg">€{opt.monthlyEur.toFixed(2)}/mnd</span>
                </div>
              ))}
            </div>
          )}
        </SettingsBlock>
      </div>
    </div>
  );
}
