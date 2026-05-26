const TZ = 'Europe/Amsterdam';

const hhmm = new Intl.DateTimeFormat('nl-NL', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TZ,
});

export const fmtTime = (ms: number): string => hhmm.format(new Date(ms));

export function fmtDuration(sec: number): string {
  const m = Math.round(sec / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}u ${mm}m` : `${mm}m`;
}

export const fmtMin = (sec: number): string => `${Math.round(sec / 60)} min`;

export function modeLabel(mode: string): string {
  switch (mode) {
    case 'RAIL':
      return 'Train';
    case 'BUS':
      return 'Bus';
    case 'TRAM':
      return 'Tram';
    case 'SUBWAY':
      return 'Metro';
    case 'FERRY':
      return 'Ferry';
    case 'WALK':
      return 'Walk';
    default:
      return mode;
  }
}

// Literal Tailwind classes (must be literal so the v4 scanner emits them).
export interface ModeStyle {
  dot: string;
  text: string;
  chip: string;
  rail: string;
}

const STYLES: Record<string, ModeStyle> = {
  RAIL: { dot: 'bg-rail', text: 'text-rail', chip: 'bg-rail/15 text-rail ring-rail/30', rail: 'bg-rail' },
  BUS: { dot: 'bg-bus', text: 'text-bus', chip: 'bg-bus/15 text-bus ring-bus/30', rail: 'bg-bus' },
  TRAM: { dot: 'bg-tram', text: 'text-tram', chip: 'bg-tram/15 text-tram ring-tram/30', rail: 'bg-tram' },
  SUBWAY: { dot: 'bg-metro', text: 'text-metro', chip: 'bg-metro/15 text-metro ring-metro/30', rail: 'bg-metro' },
  FERRY: { dot: 'bg-ferry', text: 'text-ferry', chip: 'bg-ferry/15 text-ferry ring-ferry/30', rail: 'bg-ferry' },
  WALK: { dot: 'bg-ink-600', text: 'text-fg-faint', chip: 'bg-ink-800 text-fg-dim ring-line', rail: 'bg-ink-600' },
};

export const modeStyle = (mode: string): ModeStyle => STYLES[mode] ?? STYLES.WALK;

/** Comfort coloring for a transfer buffer. */
export function bufferTone(sec: number): { text: string; ring: string; label: string } {
  const min = sec / 60;
  if (min < 4) return { text: 'text-late', ring: 'ring-late/40', label: 'tight' };
  if (min < 8) return { text: 'text-warn', ring: 'ring-warn/40', label: 'ok' };
  return { text: 'text-ok', ring: 'ring-ok/40', label: 'comfortable' };
}
