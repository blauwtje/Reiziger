export type FlapSize = 'sm' | 'md' | 'lg' | 'xl';
export type FlapTone = 'fg' | 'signal' | 'late';

const SIZE: Record<FlapSize, string> = {
  sm: 'text-sm px-2 py-1',
  md: 'text-xl px-2.5 py-1.5',
  lg: 'text-3xl px-3.5 py-2.5',
  xl: 'text-5xl px-4 py-3',
};

const TONE: Record<FlapTone, string> = {
  fg:     'text-fg',
  signal: 'text-signal',
  late:   'text-late',
};

export function Flap({
  time,
  size = 'lg',
  tone = 'fg',
}: {
  time: string;
  size?: FlapSize;
  tone?: FlapTone;
}) {
  return (
    <span
      className={`relative inline-block ${SIZE[size]} font-mono tabular-nums leading-none bg-ink-800 border border-line rounded-md shadow-flap ${TONE[tone]}`}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-px bg-ink-950/60 pointer-events-none"
      />
      {time}
    </span>
  );
}
