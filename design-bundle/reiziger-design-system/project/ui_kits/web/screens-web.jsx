// Reiziger — WEB UI kit screens.
// Desktop / browser layout. The product is a single-pane web app.
// Two-pane shell: left rail (~360px) for search/saved/disruptions,
// right pane is the board (results / detail / today / settings).

const W = 1440;        // canonical viewport width (per README: page max-width)
const H = 900;         // canonical viewport height
const RAIL_W = 380;    // left rail width

// ─────────────────────────────────────────────────────────────
// Shell — top nav + two-pane body
// ─────────────────────────────────────────────────────────────

function WebShell({ theme = 'dark', children, navActive = 'plan', rail }) {
  return (
    <div
      className="r-app tex-board"
      data-theme={theme}
      style={{
        width:'100%', height:'100%', display:'flex', flexDirection:'column',
        overflow:'hidden', background:'var(--bg)',
      }}
    >
      <TopNav active={navActive} />
      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        {rail !== false && (
          <aside style={{
            width: RAIL_W, flex:`0 0 ${RAIL_W}px`, borderRight:'1px solid var(--line)',
            background:'color-mix(in srgb, var(--surface) 70%, transparent)',
            display:'flex', flexDirection:'column', minHeight:0,
          }}>
            {rail}
          </aside>
        )}
        <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, minHeight:0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function TopNav({ active = 'plan' }) {
  const tabs = [
    { id:'plan',  label:'Plannen' },
    { id:'today', label:'Vandaag' },
    { id:'saved', label:'Bewaard' },
    { id:'me',    label:'Mij' },
  ];
  return (
    <div style={{
      height:56, flex:'0 0 56px',
      display:'flex', alignItems:'center', gap:0,
      padding:'0 24px',
      borderBottom:'1px solid var(--line)',
      background:'color-mix(in srgb, var(--bg) 92%, transparent)',
      backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
      position:'relative', zIndex:5,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:28 }}>
        <img src="../../assets/logo/reiziger-mark.svg" alt="" style={{ height:22, width:'auto', display:'block' }} />
        <span style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.02em' }}>Reiziger</span>
      </div>

      <nav style={{ display:'flex', alignItems:'center', gap:2, height:'100%' }}>
        {tabs.map(t => {
          const on = t.id === active;
          return (
            <span key={t.id} style={{
              position:'relative', height:'100%',
              display:'inline-flex', alignItems:'center',
              padding:'0 14px', fontSize:14, fontWeight: on ? 600 : 500,
              color: on ? 'var(--fg)' : 'var(--fg-dim)',
              cursor:'pointer', letterSpacing:'-0.01em',
            }}>
              {t.label}
              {on && <span style={{ position:'absolute', left:14, right:14, bottom:-1, height:2, background:'var(--signal)' }} />}
            </span>
          );
        })}
      </nav>

      <span style={{ flex:1 }} />

      {/* Right cluster */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span className="mono" style={{ fontSize:12, color:'var(--fg-mute)' }}>wo 26 mei · 16:08</span>
        <span style={{ width:1, height:20, background:'var(--line)' }} />
        <button style={iconBtn(34)}><Icon name="alert" size={16} color="var(--fg-dim)" /></button>
        <button style={iconBtn(34)}><Icon name="settings" size={16} color="var(--fg-dim)" /></button>
        <span style={{
          width:32, height:32, borderRadius:'50%', background:'var(--surface-3)',
          border:'1px solid var(--line)', display:'inline-flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:600, color:'var(--fg)', letterSpacing:0,
        }}>SK</span>
      </div>
    </div>
  );
}

function iconBtn(sz = 34) {
  return {
    width:sz, height:sz, borderRadius:'var(--r-md)',
    background:'transparent', border:'1px solid var(--line)',
    color:'var(--fg-dim)', display:'inline-flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', padding:0,
  };
}

// ─────────────────────────────────────────────────────────────
// LEFT RAIL — search form (Plan een reis)
// ─────────────────────────────────────────────────────────────
function RailSearch({ open = 'closed' }) {
  const d = window.REIZIGER_DATA;
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:0, height:'100%' }}>
      <div style={{ padding:'18px 18px 6px' }}>
        <div className="label" style={{ marginBottom:2 }}>Plan een reis</div>
        <div style={{ fontSize:13, color:'var(--fg-dim)' }}>Adres of station · vertrek of aankomst</div>
      </div>

      <div style={{ padding:'10px 18px 0', display:'flex', flexDirection:'column', gap:8 }}>
        <SearchField icon="pin"  label="Van"  value={d.query.from}  kind="address" />
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'0 4px' }}>
          <span style={{ flex:1, height:1, background:'var(--line)' }} />
          <button style={{ ...iconBtn(28), background:'var(--surface)' }}>
            <Icon name="swap" size={14} color="var(--fg-dim)" />
          </button>
        </div>
        <SearchField icon="flag" label="Naar" value={d.query.to}    kind="address" />

        {/* When + transfer floor */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:4 }}>
          <FieldButton icon="cal"   label="Aankomst"      value={`${d.query.when.date} · ${d.query.when.time}`} />
          <FieldButton icon="clock" label="Min. overstap" value={`${d.user.minTransfer} min`} />
        </div>

        {/* Discounts inline */}
        <div style={{ marginTop:6 }}>
          <div className="label" style={{ marginBottom:6 }}>Kortingen</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {d.user.discounts.map(x => (
              <span key={x.id} style={{
                padding:'5px 10px', borderRadius:'var(--r-sm)',
                background: x.on ? 'var(--signal-bg)' : 'var(--surface-2)',
                border:`1px solid ${x.on ? 'var(--signal-line)' : 'var(--line)'}`,
                color: x.on ? 'var(--signal)' : 'var(--fg-dim)',
                fontSize:12, fontWeight:500, display:'inline-flex', alignItems:'center', gap:5,
              }}>
                <span style={{
                  width:8, height:8, borderRadius:'50%',
                  background: x.on ? 'var(--signal)' : 'transparent',
                  border:`1px solid ${x.on ? 'var(--signal)' : 'var(--fg-mute)'}`,
                }} />
                {x.name}
              </span>
            ))}
          </div>
        </div>

        <SignalBtn full style={{ marginTop:12 }}>Plan reis</SignalBtn>
      </div>

      {/* Per-stop overstapminimum */}
      <div style={{ marginTop:14, padding:'14px 18px 6px', borderTop:'1px solid var(--line)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
          <span className="label">Overstapminimum per station</span>
          <button style={{
            background:'transparent', border:0, color:'var(--signal)',
            fontSize:12, fontWeight:600, padding:0, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:3,
          }}>
            <Icon name="plus" size={12} color="var(--signal)" /> Toevoegen
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          {Object.entries(d.user.perStopTransfer).map(([stop, min]) => (
            <div key={stop} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'9px 0', borderBottom:'1px solid var(--line)', fontSize:13,
            }}>
              <span style={{ color:'var(--fg)' }}>{stop}</span>
              <span className="mono" style={{ color:'var(--fg-dim)' }}>{min} min</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex:1 }} />
      <div style={{
        padding:'10px 18px', borderTop:'1px solid var(--line)',
        display:'flex', alignItems:'center', gap:8, color:'var(--fg-mute)', fontSize:11,
      }}>
        <Icon name="alert" size={12} color="var(--fg-mute)" />
        Tijden via NS open data · vertraging live
      </div>
    </div>
  );
}

function SearchField({ icon, label, value, kind }) {
  return (
    <label style={{
      display:'flex', alignItems:'center', gap:10,
      background:'var(--surface-2)', border:'1px solid var(--line)',
      borderRadius:'var(--r-md)', padding:'10px 12px',
      transition:'border-color 120ms',
    }}>
      <Icon name={icon} size={16} color="var(--fg-dim)" />
      <div style={{ display:'flex', flexDirection:'column', minWidth:0, flex:1 }}>
        <span className="label" style={{ fontSize:10, lineHeight:1.2 }}>{label}</span>
        <span style={{
          fontSize:14, color:'var(--fg)', overflow:'hidden', textOverflow:'ellipsis',
          whiteSpace:'nowrap', marginTop:1,
        }}>{value}</span>
      </div>
      {kind === 'address' && (
        <span className="mono" style={{
          fontSize:10, padding:'2px 6px', borderRadius:'var(--r-sm)',
          background:'var(--surface-3)', color:'var(--fg-mute)',
        }}>adres</span>
      )}
    </label>
  );
}

function FieldButton({ icon, label, value }) {
  return (
    <button style={{
      display:'flex', alignItems:'center', gap:8, textAlign:'left',
      background:'var(--surface-2)', border:'1px solid var(--line)',
      borderRadius:'var(--r-md)', padding:'10px 12px', cursor:'pointer',
      color:'var(--fg)',
    }}>
      <Icon name={icon} size={15} color="var(--fg-dim)" />
      <div style={{ display:'flex', flexDirection:'column', minWidth:0 }}>
        <span className="label" style={{ fontSize:10, lineHeight:1.2 }}>{label}</span>
        <span className="mono" style={{ fontSize:13, marginTop:1 }}>{value}</span>
      </div>
      <span style={{ flex:1 }} />
      <Icon name="chevD" size={12} color="var(--fg-dim)" />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// LEFT RAIL — saved trips list
// ─────────────────────────────────────────────────────────────
function RailSaved() {
  const d = window.REIZIGER_DATA;
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:0, height:'100%' }}>
      <div style={{ padding:'18px 18px 10px' }}>
        <div className="label" style={{ marginBottom:2 }}>Bewaarde reizen</div>
        <div style={{ fontSize:13, color:'var(--fg-dim)' }}>Vaste routes · klik om te herplannen</div>
      </div>
      <div style={{ padding:'4px 12px', display:'flex', flexDirection:'column', gap:4, overflow:'auto' }}>
        {d.regularTrips.map((rt, i) => (
          <button key={rt.id} style={{
            display:'flex', flexDirection:'column', alignItems:'stretch', gap:6,
            background: i === 0 ? 'var(--surface-4)' : 'transparent',
            border: i === 0 ? '1px solid var(--line)' : '1px solid transparent',
            borderLeft: i === 0 ? '2px solid var(--signal)' : '2px solid transparent',
            padding:'10px 12px', borderRadius:'var(--r-md)', textAlign:'left', cursor:'pointer',
            color:'var(--fg)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:13, fontWeight:600 }}>{rt.label}</span>
              <span className="mono" style={{ fontSize:10, color:'var(--fg-mute)' }}>{rt.dow}</span>
              <span style={{ flex:1 }} />
              {rt.disrupted && <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--late)' }} />}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--fg-dim)' }}>
              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rt.from}</span>
              <Icon name="chev" size={10} color="var(--fg-mute)" />
              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rt.to}</span>
            </div>
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <span className="mono" style={{ fontSize:12 }}>
                {rt.typical.dep} <span style={{ color:'var(--fg-mute)' }}>→</span> {rt.typical.arr}
              </span>
              <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{rt.typical.dur}</span>
              <span style={{ flex:1 }} />
              <span className="mono" style={{ fontSize:11, color:'var(--fg-dim)' }}>{rt.typical.price}</span>
            </div>
          </button>
        ))}
      </div>

      <div style={{ padding:'12px 18px 4px', borderTop:'1px solid var(--line)' }}>
        <div className="label" style={{ marginBottom:6 }}>Recent</div>
      </div>
      <div style={{ padding:'0 12px 12px', display:'flex', flexDirection:'column' }}>
        {d.history.slice(0, 3).map(h => (
          <div key={h.id} style={{
            display:'flex', alignItems:'center', gap:8, padding:'8px 6px',
            borderBottom:'1px solid var(--line)', fontSize:12, color:'var(--fg-dim)',
          }}>
            <span className="mono" style={{ fontSize:10, color:'var(--fg-mute)', minWidth:84 }}>{h.when.split(' · ')[0]}</span>
            <span style={{ flex:1, color:'var(--fg)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {h.from} <span style={{ color:'var(--fg-mute)' }}>→</span> {h.to}
            </span>
            <span className="mono" style={{ fontSize:11 }}>{h.dur}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BOARD — results list
// ─────────────────────────────────────────────────────────────
function BoardResults() {
  const d = window.REIZIGER_DATA;
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:0, height:'100%' }}>
      <BoardHeader title="Resultaten" sub="Den Haag · Burgwal 12 → Utrecht · Hoog Catharijne 8 · aankomst vr 28 mei 18:00" />
      <DisruptionStrip />
      <ResultColumns />
      <div style={{ flex:1, overflow:'auto' }} className="flap-stagger">
        {d.journeys.map(j => <ResultRow key={j.id} j={j} selected={j.id === 'j1'} />)}
        <ResultRow filler />
      </div>
      <BoardFooter />
    </div>
  );
}

function BoardHeader({ title, sub, right }) {
  return (
    <div style={{
      padding:'18px 28px 14px', display:'flex', alignItems:'flex-end', gap:14,
      borderBottom:'1px solid var(--line)',
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="label" style={{ marginBottom:4 }}>{title}</div>
        <div style={{ fontSize:18, fontWeight:600, letterSpacing:'-0.01em', color:'var(--fg)' }}>
          {sub}
        </div>
      </div>
      {right || (
        <>
          <GhostBtn>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
              <Icon name="save" size={14} color="var(--fg-dim)" />
              Bewaar reis
            </span>
          </GhostBtn>
          <GhostBtn>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
              <Icon name="cal" size={14} color="var(--fg-dim)" />
              Naar agenda
            </span>
          </GhostBtn>
        </>
      )}
    </div>
  );
}

function DisruptionStrip() {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'10px 28px',
      borderBottom:'1px solid var(--line)',
      background:'color-mix(in srgb, var(--late-bg) 60%, transparent)',
    }}>
      <span style={{
        padding:'2px 7px', borderRadius:'var(--r-sm)', background:'var(--late-bg)',
        color:'var(--late)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em',
      }}>Storing</span>
      <span style={{ fontSize:13, color:'var(--fg)' }}>Werkzaamheden Utrecht — Amersfoort, hele dag.</span>
      <span style={{ flex:1 }} />
      <span className="mono" style={{ fontSize:11, color:'var(--fg-dim)' }}>tot vandaag 23:59</span>
      <Icon name="chev" size={14} color="var(--fg-dim)" />
    </div>
  );
}

// 7-column grid: VERTREK · AANK · DUUR · OVERSTAP · SPOOR · PRIJS · →
const RESULTS_GRID = '110px 110px 100px 1fr 120px 110px 32px';

function ResultColumns() {
  const cols = ['Vertrek', 'Aank', 'Duur', 'Overstap', 'Spoor', 'Prijs', ''];
  return (
    <div style={{
      display:'grid', gridTemplateColumns: RESULTS_GRID, gap:16,
      padding:'10px 28px', borderBottom:'1px solid var(--line)',
      background:'color-mix(in srgb, var(--surface) 50%, transparent)',
      position:'sticky', top:0, zIndex:2,
    }}>
      {cols.map((c, i) => (
        <span key={i} className="label" style={{ fontSize:11, color:'var(--fg-mute)' }}>{c}</span>
      ))}
    </div>
  );
}

function ResultRow({ j, selected, filler }) {
  if (filler) {
    return (
      <div style={{
        padding:'14px 28px', display:'flex', alignItems:'center', gap:10,
        color:'var(--fg-mute)', fontSize:12, borderBottom:'1px solid var(--line)',
      }}>
        <Icon name="chevD" size={12} color="var(--fg-mute)" />
        Eerdere of latere reizen tonen
      </div>
    );
  }
  const statusColor =
    j.status === 'ok'   ? 'var(--ok)' :
    j.status === 'warn' ? 'var(--warn)' : 'var(--late)';
  return (
    <div style={{
      display:'grid', gridTemplateColumns: RESULTS_GRID, gap:16, alignItems:'center',
      padding:'14px 28px',
      background: selected ? 'var(--surface-4)' : 'transparent',
      borderLeft: selected ? '2px solid var(--signal)' : '2px solid transparent',
      borderBottom:'1px solid var(--line)',
      minHeight:64,
      boxShadow: selected ? '0 0 0 1px var(--signal-line) inset' : 'none',
    }}>
      {/* Vertrek */}
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <Flap time={j.dep} size="md" tone={selected ? 'signal' : 'fg'} />
        {j.delay > 0
          ? <DelayPill delay={j.delay} status={j.status} />
          : <span className="mono" style={{ fontSize:10, color:'var(--ok)' }}>op tijd</span>}
      </div>
      {/* Aank */}
      <div>
        <Flap time={j.arr} size="md" />
      </div>
      {/* Duur */}
      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
        <span className="mono" style={{ fontSize:16, fontWeight:500 }}>{j.dur}</span>
        <span style={{ fontSize:11, color:'var(--fg-mute)' }}>
          {j.transfers === 0 ? 'Direct' : `${j.transfers}× over`}
        </span>
      </div>
      {/* Overstap — modality + station */}
      <div style={{ display:'flex', flexDirection:'column', gap:4, minWidth:0 }}>
        <ModalityRow modes={j.modes} size={16} />
        <span style={{ fontSize:11, color:'var(--fg-dim)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          via {j.transferAt}
          {j.smartNote && <span style={{ color:'var(--signal)' }}> · {j.smartNote}</span>}
          {j.disrupted && <span style={{ color:'var(--late)' }}> · verstoord</span>}
        </span>
      </div>
      {/* Spoor */}
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <PlatformChip p={j.platforms.dep} label="Vertr" tone={selected ? 'signal' : 'plain'} />
        <Icon name="chev" size={10} color="var(--fg-mute)" />
        <PlatformChip p={j.platforms.arr} label="Aank" />
      </div>
      {/* Prijs */}
      <div style={{ display:'flex', flexDirection:'column', gap:1, alignItems:'flex-end' }}>
        <span className="mono" style={{ fontSize:14, fontWeight:600 }}>{j.price}</span>
        <span className="mono" style={{ fontSize:10, color:'var(--fg-mute)', textDecoration:'line-through' }}>{j.basePrice}</span>
      </div>
      {/* Chev */}
      <div style={{ display:'flex', justifyContent:'flex-end', color: selected ? 'var(--signal)' : 'var(--fg-mute)' }}>
        <Icon name="chev" size={16} color={selected ? 'var(--signal)' : 'var(--fg-mute)'} />
      </div>
    </div>
  );
}

function BoardFooter() {
  return (
    <div style={{
      flex:'0 0 56px', height:56, display:'flex', alignItems:'center',
      padding:'0 28px', borderTop:'1px solid var(--line)',
      background:'color-mix(in srgb, var(--surface) 40%, transparent)',
      gap:12,
    }}>
      <span className="mono" style={{ fontSize:12, color:'var(--fg-dim)' }}>4 reizen · 16:42 – 17:48</span>
      <span style={{ flex:1 }} />
      <span style={{ fontSize:12, color:'var(--fg-mute)' }}>Sorteer op</span>
      <GhostBtn style={{ padding:'6px 10px', fontSize:12 }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
          Aankomsttijd
          <Icon name="chevD" size={12} color="var(--fg-dim)" />
        </span>
      </GhostBtn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BOARD — journey detail (leg-by-leg)
// ─────────────────────────────────────────────────────────────
function BoardDetail() {
  const d = window.REIZIGER_DATA.journeyDetail;
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:0, height:'100%' }}>
      <BoardHeader
        title={`Reis · ${d.dep} → ${d.arr}`}
        sub={<><span>{d.from}</span> <span style={{ color:'var(--fg-mute)' }}>→</span> <span>{d.to}</span></>}
      />

      {/* Summary strip */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(5, 1fr) auto', gap:0,
        borderBottom:'1px solid var(--line)',
        background:'color-mix(in srgb, var(--surface) 50%, transparent)',
      }}>
        <SummaryCell label="Vertrek"  value={<Flap time={d.dep} size="lg" tone="signal" />} sub="Den Haag C · sp 7a" />
        <SummaryCell label="Aankomst" value={<Flap time={d.arr} size="lg" />}               sub="Utrecht V.R. · sp 2" />
        <SummaryCell label="Duur"     value={<span className="mono" style={{ fontSize:24, fontWeight:500 }}>{d.dur}</span>} sub={`${d.transfers}× over · ${d.transferAt}`} />
        <SummaryCell label="Prijs"    value={<span className="mono" style={{ fontSize:24, fontWeight:600 }}>{d.price}</span>} sub={<><span style={{ textDecoration:'line-through', color:'var(--fg-mute)' }}>{d.basePrice}</span> · {d.discount}</>} />
        <SummaryCell label="CO₂"      value={<span className="mono" style={{ fontSize:24, fontWeight:500 }}>{d.co2}</span>} sub="vs. auto 12,4 kg" />
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', gap:8, padding:'14px 24px', borderLeft:'1px solid var(--line)' }}>
          <SignalBtn>Bewaar reis</SignalBtn>
          <GhostBtn style={{ padding:'8px 12px', fontSize:12 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
              <Icon name="cal" size={12} color="var(--fg-dim)" />
              Naar agenda
            </span>
          </GhostBtn>
        </div>
      </div>

      {/* Leg list */}
      <div style={{ flex:1, overflow:'auto', padding:'18px 28px 32px' }}>
        <div className="label" style={{ marginBottom:10 }}>Reisstappen</div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          {d.steps.map((s, i) => <LegRow key={i} s={s} idx={i} last={i === d.steps.length - 1} />)}
        </div>
      </div>
    </div>
  );
}

function SummaryCell({ label, value, sub }) {
  return (
    <div style={{ padding:'14px 24px', borderRight:'1px solid var(--line)', display:'flex', flexDirection:'column', gap:6 }}>
      <span className="label" style={{ fontSize:10 }}>{label}</span>
      <div>{value}</div>
      <span style={{ fontSize:11, color:'var(--fg-dim)' }}>{sub}</span>
    </div>
  );
}

function LegRow({ s, idx, last }) {
  const railLine = (
    <div style={{
      position:'absolute', left:23, top:32, bottom: last ? '50%' : -1, width:2,
      background: s.kind === 'xfer' ? 'transparent' : 'var(--line)',
      borderLeft: s.kind === 'xfer' ? '2px dashed var(--line)' : 'none',
      marginLeft: s.kind === 'xfer' ? -2 : 0,
    }} />
  );
  if (s.kind === 'walk') {
    return (
      <div style={{ position:'relative', display:'flex', gap:18, padding:'14px 0' }}>
        {railLine}
        <div style={{
          width:48, height:48, borderRadius:'50%', background:'var(--surface-2)',
          border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center',
          flex:'none', zIndex:1,
        }}>
          <Icon name="foot" size={20} color="var(--walk)" />
        </div>
        <div style={{ flex:1, paddingTop:6 }}>
          <div style={{ fontSize:14, fontWeight:500 }}>Loop <span style={{ color:'var(--fg-dim)' }}>{s.from} → {s.to}</span></div>
          <div style={{ fontSize:12, color:'var(--fg-mute)', marginTop:2 }}>
            <span className="mono">{s.dur}</span> · {s.detail}
          </div>
        </div>
      </div>
    );
  }
  if (s.kind === 'xfer') {
    return (
      <div style={{ position:'relative', display:'flex', gap:18, padding:'10px 0', alignItems:'center' }}>
        <div style={{
          width:48, height:48, borderRadius:'var(--r-md)',
          background:'var(--signal-bg)', border:'1px dashed var(--signal-line)',
          display:'flex', alignItems:'center', justifyContent:'center', flex:'none', zIndex:1,
          color:'var(--signal)',
        }}>
          <Icon name="clock" size={18} color="var(--signal)" />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, color:'var(--fg)' }}>
            Overstap in <strong>{s.stop}</strong> · <span className="mono">{s.dur}</span>
            <span style={{ color:'var(--fg-mute)' }}> · {s.perronWalk}</span>
          </div>
          <div style={{ fontSize:11, color:'var(--signal)', marginTop:2, display:'inline-flex', alignItems:'center', gap:4 }}>
            <Icon name="sparkle" size={10} color="var(--signal)" /> {s.note}
          </div>
        </div>
        <button style={{
          background:'var(--surface-2)', border:'1px solid var(--line)', color:'var(--fg)',
          padding:'6px 10px', borderRadius:'var(--r-sm)', fontSize:11, cursor:'pointer',
        }}>Aanpassen</button>
      </div>
    );
  }
  // rail leg
  return (
    <div style={{ position:'relative', display:'flex', gap:18, padding:'14px 0' }}>
      {railLine}
      <div style={{
        width:48, height:48, borderRadius:'var(--r-md)',
        background:'var(--surface-2)', border:'1px solid var(--line)',
        display:'flex', alignItems:'center', justifyContent:'center', flex:'none', zIndex:1,
      }}>
        <ModalityGlyph mode="rail" size={22} />
      </div>
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'110px 1fr 100px', gap:16, alignItems:'center' }}>
        <div>
          <Flap time={s.dep} size="md" />
          <div className="mono" style={{ fontSize:11, color:'var(--fg-mute)', marginTop:4 }}>spoor {s.platformDep}</div>
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:600 }}>{s.code} <span style={{ color:'var(--fg-dim)', fontWeight:500 }}>{s.from} → {s.to}</span></div>
          <div style={{ fontSize:11, color:'var(--fg-mute)', marginTop:2 }}>{s.seats || '2e klas'}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <Flap time={s.arr} size="md" />
          <div className="mono" style={{ fontSize:11, color:'var(--fg-mute)', marginTop:4 }}>spoor {s.platformArr}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BOARD — Today landing (no query yet, shows pattern + disruptions)
// ─────────────────────────────────────────────────────────────
function BoardToday() {
  const d = window.REIZIGER_DATA;
  const t = d.todaySuggestion;
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:0, height:'100%' }}>
      <div style={{ padding:'24px 32px 14px', borderBottom:'1px solid var(--line)' }}>
        <div className="label" style={{ marginBottom:4 }}>Wo 26 mei · 16:08</div>
        <h2 style={{ fontSize:30, fontWeight:700, letterSpacing:'-0.02em', margin:0 }}>
          Goedemiddag, {d.user.name}
        </h2>
        <div style={{ color:'var(--fg-dim)', fontSize:14, marginTop:4 }}>
          {t.pattern} · 2 storingen op jouw routes
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'24px 32px 32px', display:'grid',
        gridTemplateColumns:'1.4fr 1fr', gap:24, alignContent:'start',
      }}>
        {/* Hero — auto-trip for today */}
        <div style={{
          gridColumn:'1 / -1',
          background:'var(--surface)', border:'1px solid var(--line)',
          borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-card)',
        }}>
          <div style={{ display:'flex', alignItems:'stretch' }}>
            <div style={{ flex:1, padding:'18px 24px', borderRight:'1px solid var(--line)' }}>
              <div className="label">Volgende reis · werk → thuis</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:18, marginTop:10 }}>
                <Flap time={t.dep} size="xl" tone="signal" />
                <span style={{ fontSize:24, color:'var(--fg-mute)' }}>→</span>
                <Flap time={t.arr} size="xl" />
                <DelayPill delay={t.delay} status={t.status} />
              </div>
              <div style={{ fontSize:13, color:'var(--fg-dim)', marginTop:10, display:'flex', alignItems:'center', gap:10 }}>
                <ModalityRow modes={['walk','rail','walk','rail','walk']} size={16} />
                <span className="mono">{t.dur}</span>
                <span>·</span>
                <span>{t.transfers}× over via Utrecht C.</span>
                <span>·</span>
                <span>sp {t.platforms[0]} → {t.platforms[1]}</span>
              </div>
            </div>
            <div style={{
              width:280, padding:'18px 24px', display:'flex', flexDirection:'column', gap:10,
              background:'var(--surface-2)',
            }}>
              <div className="label">Prijs</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                <span className="mono" style={{ fontSize:28, fontWeight:600 }}>{t.price}</span>
                <span className="mono" style={{ fontSize:13, color:'var(--fg-mute)', textDecoration:'line-through' }}>{t.basePrice}</span>
              </div>
              <span style={{
                padding:'3px 8px', borderRadius:'var(--r-sm)', background:'var(--signal-bg)',
                color:'var(--signal)', fontSize:11, fontWeight:600, alignSelf:'flex-start',
              }}>{t.usedDiscount}</span>
              <span style={{ flex:1 }} />
              <SignalBtn>Bekijk reis</SignalBtn>
            </div>
          </div>
          {t.disruption && (
            <div style={{
              padding:'12px 24px', display:'flex', alignItems:'center', gap:12,
              background:'var(--warn-bg)', borderTop:'1px solid var(--line)',
            }}>
              <Icon name="alert" size={16} color="var(--warn)" />
              <div style={{ flex:1, fontSize:13 }}>
                <strong style={{ color:'var(--warn)' }}>+4 min vertraging op IC 3041</strong>
                <span style={{ color:'var(--fg-dim)' }}> — kans op overstap te missen. Reiziger raadt +8 min over in Utrecht.</span>
              </div>
              <button style={{
                background:'transparent', border:'1px solid var(--warn)', color:'var(--warn)',
                padding:'6px 10px', borderRadius:'var(--r-sm)', fontSize:12, fontWeight:600, cursor:'pointer',
              }}>Pas overstap aan</button>
            </div>
          )}
        </div>

        {/* Disruptions */}
        <div>
          <div className="label" style={{ marginBottom:10 }}>Storingen op jouw reizen</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {d.disruptions.filter(x => x.affectsYou).map(dis => (
              <div key={dis.id} style={{
                background:'var(--surface)', border:'1px solid var(--line)',
                borderLeft:`3px solid ${dis.severity === 'high' ? 'var(--late)' : 'var(--warn)'}`,
                borderRadius:'var(--r-md)', padding:'12px 14px',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <ModalityGlyph mode={dis.modality} size={14} />
                  <span style={{ fontSize:11, color:'var(--fg-dim)' }}>{dis.area}</span>
                  <span style={{ flex:1 }} />
                  <span className="mono" style={{ fontSize:10, color:'var(--fg-mute)' }}>tot {dis.until}</span>
                </div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{dis.title}</div>
                <div style={{ fontSize:12, color:'var(--fg-dim)' }}>{dis.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vaste reizen */}
        <div>
          <div className="label" style={{ marginBottom:10 }}>Jouw vaste reizen</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {d.regularTrips.map(rt => (
              <div key={rt.id} style={{
                background:'var(--surface)', border:'1px solid var(--line)',
                borderRadius:'var(--r-md)', padding:'12px 14px',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{rt.label}</span>
                  <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{rt.dow}</span>
                  <span style={{ flex:1 }} />
                  {rt.disrupted && <span style={{
                    padding:'2px 6px', borderRadius:'var(--r-sm)', background:'var(--late-bg)',
                    color:'var(--late)', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em',
                  }}>Verstoord</span>}
                </div>
                <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                  <span className="mono" style={{ fontSize:14 }}>{rt.typical.dep} → {rt.typical.arr}</span>
                  <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{rt.typical.dur}</span>
                  <span style={{ flex:1 }} />
                  <span className="mono" style={{ fontSize:11 }}>{rt.typical.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BOARD — Voorkeuren / Mij
// ─────────────────────────────────────────────────────────────
function BoardSettings() {
  const d = window.REIZIGER_DATA;
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:0, height:'100%' }}>
      <div style={{ padding:'24px 32px 14px', borderBottom:'1px solid var(--line)' }}>
        <div className="label" style={{ marginBottom:4 }}>Voorkeuren</div>
        <h2 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.02em', margin:0 }}>Mijn instellingen</h2>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'24px 32px 32px', display:'grid',
        gridTemplateColumns:'1fr 1fr', gap:24, alignContent:'start',
      }}>
        <SettingsBlock title="Reisprofiel">
          <Row label="Loopsnelheid"    value={`${d.user.walkSpeed} km/u`} sub="standaard 4,5 km/u" />
          <Row label="Fietssnelheid"   value={`${d.user.bikeSpeed} km/u`} sub="standaard 16 km/u" />
          <Row label="Min. overstaptijd" value={`${d.user.minTransfer} min`} sub="globaal · per-station overschrijft" />
        </SettingsBlock>

        <SettingsBlock title="Kortingen & abonnement">
          {d.user.discounts.map(x => (
            <div key={x.id} style={{
              display:'flex', alignItems:'center', gap:12, padding:'12px 0',
              borderBottom:'1px solid var(--line)',
            }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{x.name}</div>
                <div style={{ fontSize:11, color:'var(--fg-dim)' }}>{x.desc}</div>
              </div>
              <span style={{
                width:32, height:18, borderRadius:9, padding:2, flex:'none',
                background: x.on ? 'var(--signal)' : 'var(--surface-3)',
                display:'inline-flex', justifyContent: x.on ? 'flex-end' : 'flex-start',
              }}>
                <span style={{ width:14, height:14, borderRadius:'50%', background:'#fff', display:'block' }} />
              </span>
            </div>
          ))}
        </SettingsBlock>

        <SettingsBlock title="Overstapminimum per station">
          {Object.entries(d.user.perStopTransfer).map(([stop, min]) => (
            <Row key={stop} label={stop} value={`${min} min`} sub="overschrijft globaal minimum" />
          ))}
          <button style={{
            marginTop:8, background:'transparent', border:'1px dashed var(--line)',
            color:'var(--signal)', padding:'10px 12px', borderRadius:'var(--r-md)',
            fontSize:12, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6,
          }}>
            <Icon name="plus" size={14} color="var(--signal)" /> Station toevoegen
          </button>
        </SettingsBlock>

        <SettingsBlock title="Agenda-koppelingen">
          {d.user.calendars.map(c => (
            <div key={c.id} style={{
              display:'flex', alignItems:'center', gap:12, padding:'12px 0',
              borderBottom:'1px solid var(--line)',
            }}>
              <Icon name={c.id === 'google' ? 'google' : 'apple'} size={18} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
                <div style={{ fontSize:11, color:'var(--fg-dim)' }}>{c.on ? c.email : 'niet gekoppeld'}</div>
              </div>
              <button style={{
                background: c.on ? 'transparent' : 'var(--signal)',
                color: c.on ? 'var(--fg-dim)' : '#0a0d12',
                border: c.on ? '1px solid var(--line)' : 0,
                padding:'6px 10px', borderRadius:'var(--r-sm)', fontSize:11, fontWeight:600, cursor:'pointer',
              }}>{c.on ? 'Ontkoppel' : 'Koppel'}</button>
            </div>
          ))}
        </SettingsBlock>

        {/* Abonnement-advies — full width */}
        <div style={{ gridColumn:'1 / -1' }}>
          <SettingsBlock title="Abonnement-advies op basis van jouw ritten">
            <div style={{ fontSize:12, color:'var(--fg-dim)', marginBottom:14 }}>
              {d.subscription.period} · {d.subscription.trips} ritten · {d.subscription.monthSpend} besteed zonder abonnement
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
              {d.subscription.options.map(o => (
                <div key={o.id} style={{
                  background: o.best ? 'var(--signal-bg)' : 'var(--surface-2)',
                  border: o.best ? '1px solid var(--signal-line)' : '1px solid var(--line)',
                  borderRadius:'var(--r-md)', padding:14,
                  display:'flex', flexDirection:'column', gap:6,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:13, fontWeight:600 }}>{o.name}</span>
                    {o.best && <span style={{
                      padding:'2px 7px', borderRadius:'var(--r-sm)', background:'var(--signal)', color:'#0a0d12',
                      fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em',
                    }}>Beste</span>}
                  </div>
                  <div className="mono" style={{ fontSize:11, color:'var(--fg-dim)' }}>{o.fee}</div>
                  <div className="mono" style={{ fontSize:20, fontWeight:600, marginTop:2 }}>{o.net}</div>
                  <div className="mono" style={{ fontSize:11, color: o.best ? 'var(--signal)' : 'var(--fg-mute)' }}>
                    bespaart {o.save}
                  </div>
                  <div style={{ fontSize:11, color:'var(--fg-dim)', marginTop:4, lineHeight:1.4 }}>{o.why}</div>
                </div>
              ))}
            </div>
          </SettingsBlock>
        </div>
      </div>
    </div>
  );
}

function SettingsBlock({ title, children }) {
  return (
    <section style={{
      background:'var(--surface)', border:'1px solid var(--line)',
      borderRadius:'var(--r-lg)', padding:'16px 18px',
    }}>
      <div className="label" style={{ marginBottom:8 }}>{title}</div>
      {children}
    </section>
  );
}

function Row({ label, value, sub }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--line)' }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:'var(--fg-dim)' }}>{sub}</div>}
      </div>
      <span className="mono" style={{ fontSize:14, color:'var(--fg)' }}>{value}</span>
    </div>
  );
}

Object.assign(window, {
  WebShell, RailSearch, RailSaved,
  BoardResults, BoardDetail, BoardToday, BoardSettings,
  W, H,
});
