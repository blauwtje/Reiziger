import { useEffect, useState, type ReactNode } from 'react';
import { api } from '../api';
import type { StopHit, TransferRule } from '../types';
import { StopSearch } from '../components/StopSearch';
import { fmtMin } from '../lib/format';

export function RulesPanel({ onChanged }: { onChanged: () => void }) {
  const [rules, setRules] = useState<TransferRule[]>([]);
  const [editing, setEditing] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildMsg, setRebuildMsg] = useState<string | null>(null);

  const load = () =>
    api.listRules().then((r) => {
      setRules(r);
      onChanged();
    });

  useEffect(() => {
    load();
    // resume showing progress if a rebuild is already running
    api.rebuildStatus().then((s) => {
      if (s.running) {
        setRebuilding(true);
        pollRebuild();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pollRebuild() {
    const poll = async () => {
      const s = await api.rebuildStatus();
      if (s.running) {
        setRebuildMsg('Compiling rules and rebuilding the graph… (this takes a few minutes)');
        setTimeout(poll, 3000);
        return;
      }
      setRebuilding(false);
      setRebuildMsg(
        s.error
          ? `Rebuild failed: ${s.error}`
          : `Done — graph rebuilt with ${s.customRows ?? 0} custom transfer row(s). Your buffers are live.`,
      );
    };
    setTimeout(poll, 1500);
  }

  async function applyRebuild() {
    setRebuilding(true);
    setRebuildMsg('Starting rebuild…');
    try {
      await api.rebuild();
      pollRebuild();
    } catch (e) {
      setRebuilding(false);
      setRebuildMsg(`Rebuild error: ${(e as Error).message}`);
    }
  }

  async function toggle(rule: TransferRule) {
    await api.updateRule(rule.id, { enabled: !rule.enabled });
    load();
  }
  async function remove(rule: TransferRule) {
    await api.deleteRule(rule.id);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-ink-900/70 p-5 backdrop-blur sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-fg">Custom transfer buffers</h2>
            <p className="mt-1 max-w-xl text-sm text-fg-dim">
              Force extra slack at the transfer points that fail you. Each rule is baked into the routing graph as a
              constrained transfer — journeys that violate it simply won't be offered.
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-lg bg-signal px-4 py-2 font-semibold text-ink-950 transition hover:bg-signal-soft"
            >
              + New rule
            </button>
          )}
        </div>

        {editing && (
          <RuleEditor
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false);
              load();
            }}
          />
        )}
      </div>

      {rules.length === 0 && !editing && (
        <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-fg-dim">
          No buffers yet. Add one for a transfer point you don't trust.
        </div>
      )}

      <div className="space-y-3">
        {rules.map((r) => (
          <RuleCard key={r.id} rule={r} onToggle={() => toggle(r)} onDelete={() => remove(r)} />
        ))}
      </div>

      {rules.length > 0 && (
        <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-xl border border-signal/30 bg-ink-850/90 px-4 py-3 backdrop-blur">
          <div className="text-sm text-fg-dim">
            {rebuildMsg ?? 'Rules are saved. Rebuild the graph to apply them to routing.'}
          </div>
          <button
            onClick={applyRebuild}
            disabled={rebuilding}
            className="ml-auto rounded-lg bg-signal px-4 py-2 font-semibold text-ink-950 transition hover:bg-signal-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {rebuilding ? 'Rebuilding…' : 'Apply rules & rebuild graph'}
          </button>
        </div>
      )}
    </div>
  );
}

function RuleCard({
  rule,
  onToggle,
  onDelete,
}: {
  rule: TransferRule;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`rounded-xl border bg-ink-900/70 p-4 ${rule.enabled ? 'border-line' : 'border-line/50 opacity-60'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-signal/15 px-2 py-0.5 font-mono text-sm font-semibold text-signal ring-1 ring-signal/30">
              ≥ {fmtMin(rule.minBufferSec)}
            </span>
            <span className="truncate font-medium text-fg">{rule.label || 'Untitled rule'}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1 font-mono text-[11px] text-fg-faint">
            {rule.fromStopIds.map((s) => (
              <span key={s} className="rounded bg-ink-800 px-1.5 py-0.5">
                {s.replace('ovapi:', '')}
              </span>
            ))}
            <span className="px-1 text-fg-dim">→</span>
            {rule.toStopIds.map((s) => (
              <span key={s} className="rounded bg-ink-800 px-1.5 py-0.5">
                {s.replace('ovapi:', '')}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onToggle}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${
              rule.enabled ? 'text-ok ring-ok/40' : 'text-fg-faint ring-line'
            }`}
          >
            {rule.enabled ? 'enabled' : 'disabled'}
          </button>
          <button onClick={onDelete} className="rounded-md px-2 py-1 text-xs text-fg-faint hover:text-late">
            delete
          </button>
        </div>
      </div>
    </div>
  );
}

function RuleEditor({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [label, setLabel] = useState('');
  const [fromStops, setFromStops] = useState<StopHit[]>([]);
  const [toStops, setToStops] = useState<StopHit[]>([]);
  const [picker, setPicker] = useState<StopHit | null>(null);
  const [toPicker, setToPicker] = useState<StopHit | null>(null);
  const [minutes, setMinutes] = useState(15);
  const [saving, setSaving] = useState(false);

  const add = (s: StopHit | null, list: StopHit[], set: (v: StopHit[]) => void, clear: () => void) => {
    if (s && !list.some((x) => x.gtfsId === s.gtfsId)) set([...list, s]);
    clear();
  };

  const canSave = fromStops.length > 0 && toStops.length > 0 && minutes > 0 && !saving;

  async function save() {
    setSaving(true);
    try {
      await api.createRule({
        label,
        fromStopIds: fromStops.map((s) => s.gtfsId),
        toStopIds: toStops.map((s) => s.gtfsId),
        fromRouteId: null,
        toRouteId: null,
        minBufferSec: Math.round(minutes * 60),
        enabled: true,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-line bg-ink-850 p-4">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label, e.g. “weak Bunnik train → bus 341”"
        className="mb-4 w-full rounded-lg border border-line bg-ink-900 px-3 py-2.5 text-fg outline-none placeholder:text-fg-faint focus:border-signal/60"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <StopList
          title="Arriving at (from stops)"
          stops={fromStops}
          onRemove={(id) => setFromStops(fromStops.filter((s) => s.gtfsId !== id))}
          picker={
            <StopSearch
              label=""
              value={picker}
              onChange={(s) => add(s, fromStops, setFromStops, () => setPicker(null))}
              placeholder="Add an alight stop…"
            />
          }
        />
        <StopList
          title="Departing from (to stops)"
          stops={toStops}
          onRemove={(id) => setToStops(toStops.filter((s) => s.gtfsId !== id))}
          picker={
            <StopSearch
              label=""
              value={toPicker}
              onChange={(s) => add(s, toStops, setToStops, () => setToPicker(null))}
              placeholder="Add a boarding stop…"
            />
          }
        />
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="text-sm text-fg-dim">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">
            Minimum buffer
          </span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-20 rounded-lg border border-line bg-ink-900 px-3 py-2 font-mono text-fg outline-none focus:border-signal/60"
            />
            <span>minutes</span>
          </span>
        </label>
        <div className="ml-auto flex gap-2">
          <button onClick={onCancel} className="rounded-lg border border-line px-4 py-2 text-sm text-fg-dim hover:text-fg">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className="rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-signal-soft disabled:opacity-40"
          >
            Save rule
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs text-fg-faint">
        Tip: a station like “Utrecht Centraal” is many stops — add the specific platform(s) you alight at and the
        bus/tram quay(s) you board. Saved rules apply after the next graph rebuild.
      </p>
    </div>
  );
}

function StopList({
  title,
  stops,
  onRemove,
  picker,
}: {
  title: string;
  stops: StopHit[];
  onRemove: (id: string) => void;
  picker: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint">{title}</div>
      <div className="mb-2 space-y-1.5">
        {stops.map((s) => (
          <div key={s.gtfsId} className="flex items-center justify-between gap-2 rounded-md bg-ink-900 px-2.5 py-1.5">
            <span className="truncate text-sm text-fg">{s.name}</span>
            <button onClick={() => onRemove(s.gtfsId)} className="shrink-0 text-xs text-fg-faint hover:text-late">
              ✕
            </button>
          </div>
        ))}
      </div>
      {picker}
    </div>
  );
}
