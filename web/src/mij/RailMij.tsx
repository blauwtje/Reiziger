import { RulesPanel } from '../rules/RulesPanel';

export function RailMij({ onRulesChanged }: { onRulesChanged: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pb-4 border-b border-line shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-faint mb-0.5">Mij</div>
        <div className="text-sm text-fg-dim">Overstapbuffers &amp; instellingen</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <RulesPanel onChanged={onRulesChanged} />
      </div>
    </div>
  );
}
