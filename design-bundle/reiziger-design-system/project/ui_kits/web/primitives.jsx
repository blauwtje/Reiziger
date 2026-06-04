// Reiziger — shared primitives.
// All variables use --bg, --surface, etc. — the theme.css scope on .r-app
// flips between dark (board) and light (paper).

const MODE_COLOR = { rail:'var(--rail)', bus:'var(--bus)', tram:'var(--tram)', metro:'var(--metro)', ferry:'var(--ferry)', walk:'var(--walk)' };
const MODE_LABEL = { rail:'Trein', bus:'Bus', tram:'Tram', metro:'Metro', ferry:'Ferry', walk:'Lopen' };

function ModalityGlyph({ mode, size = 18 }) {
  return (
    <span style={{ display:'inline-block', width:size, height:size, color:MODE_COLOR[mode]||'var(--fg-dim)', flex:'none' }}>
      <img src={`../../assets/glyphs/${mode}.svg`} alt={MODE_LABEL[mode]} style={{ width:'100%', height:'100%', display:'block' }} />
    </span>
  );
}

function ModalityRow({ modes, size = 16 }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
      {modes.map((m, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ width:8, height:1, background:'var(--line)' }} />}
          <ModalityGlyph mode={m} size={size} />
        </React.Fragment>
      ))}
    </span>
  );
}

// Big split-flap time cell (mono, with horizontal seam).
function Flap({ time, size = 'lg', tone = 'fg' }) {
  const sizes = {
    sm: { fs: 14, pad: '4px 8px' },
    md: { fs: 18, pad: '6px 10px' },
    lg: { fs: 28, pad: '10px 14px' },
    xl: { fs: 36, pad: '12px 18px' },
  };
  const s = sizes[size] || sizes.lg;
  const color = tone === 'signal' ? 'var(--signal)' : tone === 'late' ? 'var(--late)' : 'var(--fg)';
  return (
    <span style={{
      position:'relative', display:'inline-block', padding:s.pad,
      background:'var(--surface-2)', border:'1px solid var(--line)',
      borderRadius:'var(--r-md)', boxShadow:'var(--shadow-flap)',
      fontFamily:'var(--font-mono)', fontVariantNumeric:'tabular-nums',
      letterSpacing:'-0.02em', fontSize:s.fs, color, fontWeight:500, lineHeight:1,
    }}>
      <span aria-hidden style={{
        position:'absolute', left:0, right:0, top:'50%', height:1,
        background:'var(--bg)', opacity:0.7,
      }} />
      {time}
    </span>
  );
}

function StatusDot({ status, size = 8 }) {
  const c = status === 'ok' ? 'var(--ok)' : status === 'warn' ? 'var(--warn)' : 'var(--late)';
  return <span style={{ display:'inline-block', width:size, height:size, borderRadius:'50%', background:c, flex:'none' }} />;
}

function DelayPill({ delay, status }) {
  if (delay === 0) return <span className="mono" style={{ fontSize:12, color:'var(--ok)' }}>op tijd</span>;
  const c   = status === 'warn' ? 'var(--warn)' : 'var(--late)';
  const bg  = status === 'warn' ? 'var(--warn-bg)' : 'var(--late-bg)';
  return (
    <span className="mono" style={{
      padding:'2px 7px', background:bg, color:c,
      borderRadius:'var(--r-sm)', fontSize:11, fontWeight:500,
    }}>+{delay}</span>
  );
}

function PlatformChip({ p, label = 'Spoor', tone = 'plain' }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'baseline', gap:5,
      padding:'2px 7px', borderRadius:'var(--r-sm)',
      background: tone === 'signal' ? 'var(--signal-bg)' : 'var(--surface-3)',
      border:'1px solid var(--line)',
    }}>
      <span className="label" style={{ fontSize:9, color:'var(--fg-mute)' }}>{label}</span>
      <span className="mono" style={{ fontSize:13, color: tone === 'signal' ? 'var(--signal)' : 'var(--fg)', fontWeight:600 }}>{p}</span>
    </span>
  );
}

// Small "i" / icon button used throughout.
function GhostBtn({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      background:'var(--surface-2)', border:'1px solid var(--line)',
      color:'var(--fg)', borderRadius:'var(--r-md)', padding:'8px 12px',
      fontFamily:'var(--font-sans)', fontSize:13, fontWeight:500, cursor:'pointer',
      ...style,
    }}>{children}</button>
  );
}
function SignalBtn({ children, onClick, full, style }) {
  return (
    <button onClick={onClick} style={{
      background:'var(--signal)', color:'#0a0d12', border:0,
      borderRadius:'var(--r-md)', padding:'14px 18px',
      fontFamily:'var(--font-sans)', fontSize:15, fontWeight:700, cursor:'pointer',
      letterSpacing:'-0.01em', width: full ? '100%' : undefined,
      boxShadow:'var(--shadow-flap)',
      ...style,
    }}>{children}</button>
  );
}

// Section eyebrow used across screens.
function Eyebrow({ children, right }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 18px 8px' }}>
      <span className="label">{children}</span>
      {right}
    </div>
  );
}

// Card panel — no float, value-based depth.
function Panel({ children, style, pad = 14, accent }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--line)',
      borderRadius:'var(--r-lg)', padding:pad,
      borderLeft: accent ? `2px solid ${accent}` : `1px solid var(--line)`,
      ...style,
    }}>{children}</div>
  );
}

// Icons (lucide-style strokes, hand-shaped for the kit).
function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { width:size, height:size, display:'block', stroke:color, fill:'none', strokeWidth:1.75, strokeLinecap:'round', strokeLinejoin:'round' };
  const map = {
    pin:      <svg {...s} viewBox="0 0 24 24"><path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></svg>,
    flag:     <svg {...s} viewBox="0 0 24 24"><path d="M4 22V3l9 3 7-3v12l-7 3-9-3z"/></svg>,
    swap:     <svg {...s} viewBox="0 0 24 24"><path d="M7 3v18M3 7l4-4 4 4M17 21V3M21 17l-4 4-4-4"/></svg>,
    clock:    <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
    cal:      <svg {...s} viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
    chev:     <svg {...s} viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>,
    chevL:    <svg {...s} viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>,
    chevD:    <svg {...s} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>,
    plus:     <svg {...s} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
    home:     <svg {...s} viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>,
    work:     <svg {...s} viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3"/></svg>,
    star:     <svg {...s} viewBox="0 0 24 24"><path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9z"/></svg>,
    settings: <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
    alert:    <svg {...s} viewBox="0 0 24 24"><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>,
    sparkle:  <svg {...s} viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>,
    foot:     <svg {...s} viewBox="0 0 24 24"><path d="M7 4c0 3 1 6 3 6s3-2 3-5"/><path d="M14 8c1 2 3 4 3 7 0 2-1 3-3 3H8c-2 0-3-1-3-3 0-2 1-3 3-3"/></svg>,
    bike:     <svg {...s} viewBox="0 0 24 24"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-9h4l3 9M14 8h3M9 8l3 6"/></svg>,
    user:     <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>,
    list:     <svg {...s} viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
    save:     <svg {...s} viewBox="0 0 24 24"><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-4z"/></svg>,
    share:    <svg {...s} viewBox="0 0 24 24"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/></svg>,
    google:   <svg viewBox="0 0 24 24" width={size} height={size}><path d="M21.6 12.2c0-.8-.1-1.4-.2-2H12v3.8h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4"/><path d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853"/><path d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6z" fill="#FBBC05"/><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5L18.7 4.6A10 10 0 0 0 12 2 10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9z" fill="#EA4335"/></svg>,
    apple:    <svg viewBox="0 0 24 24" width={size} height={size}><path d="M17 12.6c0-2.4 2-3.5 2.1-3.6-1.1-1.6-2.8-1.9-3.5-1.9-1.5-.2-2.9.8-3.6.8-.8 0-1.9-.8-3.1-.8-1.6 0-3 .9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2 0 1.6-.8 3.1-.8 1.4 0 1.8.8 3.1.8 1.3 0 2.1-1.2 2.9-2.3 1-1.3 1.3-2.6 1.4-2.7-.1-.1-2.6-1-2.7-3.8zM14.7 5.3c.6-.8 1.1-1.9 1-3-.9.1-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1.1.1 2.1-.6 2.7-1.3z" fill={color}/></svg>,
  };
  return map[name] || null;
}

Object.assign(window, {
  MODE_COLOR, MODE_LABEL,
  ModalityGlyph, ModalityRow, Flap, StatusDot, DelayPill, PlatformChip,
  GhostBtn, SignalBtn, Eyebrow, Panel, Icon,
});
