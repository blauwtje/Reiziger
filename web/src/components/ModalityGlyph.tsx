import { Fragment } from 'react';
import type { ReactElement } from 'react';

const COLOR: Record<string, string> = {
  RAIL:   'text-rail',
  BUS:    'text-bus',
  TRAM:   'text-tram',
  SUBWAY: 'text-metro',
  FERRY:  'text-ferry',
  WALK:   'text-fg-faint',
};

const PATHS: Record<string, ReactElement> = {
  RAIL: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="6" width="20" height="18" rx="3"/>
      <path d="M6 18h20"/>
      <rect x="9" y="9" width="6" height="6" rx="1"/>
      <rect x="17" y="9" width="6" height="6" rx="1"/>
      <circle cx="11" cy="21" r="1"/>
      <circle cx="21" cy="21" r="1"/>
      <path d="M9 26l-2 2M23 26l2 2"/>
    </svg>
  ),
  BUS: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="6" width="20" height="18" rx="3"/>
      <path d="M6 13h20M6 19h20"/>
      <rect x="9" y="9" width="4" height="3" rx="0.5"/>
      <rect x="15" y="9" width="4" height="3" rx="0.5"/>
      <rect x="21" y="9" width="2" height="3" rx="0.5"/>
      <circle cx="11" cy="21" r="1.2"/>
      <circle cx="21" cy="21" r="1.2"/>
      <path d="M9 26l-1 2M23 26l1 2"/>
    </svg>
  ),
  TRAM: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 3v3M9 6h14"/>
      <rect x="7" y="8" width="18" height="16" rx="2"/>
      <path d="M7 17h18"/>
      <rect x="10" y="11" width="4" height="4" rx="0.5"/>
      <rect x="18" y="11" width="4" height="4" rx="0.5"/>
      <circle cx="11" cy="21" r="1"/>
      <circle cx="21" cy="21" r="1"/>
      <path d="M5 27h22"/>
    </svg>
  ),
  SUBWAY: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 5h16a2 2 0 0 1 2 2v18a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V7a2 2 0 0 1 2-2z"/>
      <path d="M6 17h20"/>
      <rect x="9" y="8" width="14" height="6" rx="1"/>
      <path d="M11 22h10"/>
      <circle cx="11" cy="20" r="0.6" fill="currentColor"/>
      <circle cx="21" cy="20" r="0.6" fill="currentColor"/>
    </svg>
  ),
  FERRY: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 22c2 2 4 2 6 0s4-2 6 0 4 2 6 0 4-2 6 0"/>
      <path d="M5 18l3-6h16l3 6"/>
      <path d="M8 18V8h7M15 8h6l3 4M8 11h6"/>
      <circle cx="11" cy="15" r="1"/>
      <circle cx="17" cy="15" r="1"/>
      <circle cx="22" cy="15" r="1"/>
    </svg>
  ),
  WALK: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="6" r="2.5"/>
      <path d="M14 14l3-3 3 1 3 5M17 11l-3 6 4 3v6M14 17l-4 2 1 5"/>
    </svg>
  ),
};

export function ModalityGlyph({ mode, size = 18 }: { mode: string; size?: number }) {
  const svg = PATHS[mode] ?? PATHS.WALK;
  const color = COLOR[mode] ?? 'text-fg-faint';
  return (
    <span className={`inline-block shrink-0 ${color}`} style={{ width: size, height: size }}>
      {svg}
    </span>
  );
}

export function ModalityRow({ modes }: { modes: string[] }) {
  const transit = modes.filter((m) => m !== 'WALK');
  return (
    <span className="inline-flex items-center gap-1.5">
      {transit.map((m, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="w-2 h-px bg-line shrink-0" />}
          <ModalityGlyph mode={m} size={16} />
        </Fragment>
      ))}
    </span>
  );
}
