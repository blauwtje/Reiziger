// Reiziger mobile — Results list + Journey detail.
// ScreenResults — list of journeys for the active query.
// ScreenDetail  — selected journey breakdown (legs, platforms, smart notes, calendar add).

// ─────────────────────────────────────────────────────────────
// SCREEN 5 — Results list
// ─────────────────────────────────────────────────────────────
function ScreenResults({ theme = 'dark' }) {
  const data = window.REIZIGER_DATA;
  return (
    <AppShell theme={theme} noTab scrollKey="results"
      back={true} title="Reizen"
      action={<button style={iconBtnSm()}><Icon name="settings" size={16} color="var(--fg-dim)" /></button>}>

      {/* Query header — what we're looking for */}
      <div style={{
        margin:'10px 18px 0', padding:'10px 12px',
        background:'var(--surface)', border:'1px solid var(--line)',
        borderRadius:'var(--r-md)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
          <Icon name="home" size={14} color="var(--signal)" />
          <span style={{ fontWeight:600 }}>Burgwal 12, Den Haag</span>
          <Icon name="chev" size={12} color="var(--fg-mute)" />
          <Icon name="work" size={14} color="var(--fg-dim)" />
          <span style={{ fontWeight:600 }}>Hoog Catharijne</span>
        </div>
        <div style={{
          display:'flex', alignItems:'center', gap:10, marginTop:6,
          paddingTop:6, borderTop:'1px dashed var(--line)',
        }}>
          <span className="label" style={{ fontSize:10 }}>Aankomst</span>
          <span className="mono" style={{ fontSize:13, fontWeight:600 }}>vr 28 mei · 18:00</span>
          <span style={{ flex:1 }} />
          <span style={{ fontSize:11, color:'var(--signal)', fontWeight:600 }}>Wijzig</span>
        </div>
      </div>

      {/* Smart suggestion — full-width amber-tinged callout */}
      <div style={{ padding:'14px 18px 0' }}>
        <SmartSuggestion s={data.smartSuggestion} />
      </div>

      {/* Column header */}
      <div style={{
        padding:'14px 18px 6px', display:'grid',
        gridTemplateColumns:'62px 62px 1fr auto', gap:8,
      }}>
        <span className="label" style={{ fontSize:10 }}>Vertr.</span>
        <span className="label" style={{ fontSize:10 }}>Aank.</span>
        <span className="label" style={{ fontSize:10 }}>Duur · over · spoor</span>
        <span className="label" style={{ fontSize:10, textAlign:'right' }}>Prijs</span>
      </div>

      {/* Journey rows */}
      <div className="flap-stagger" style={{ padding:'0 18px 4px', display:'flex', flexDirection:'column', gap:10 }}>
        {data.journeys.map(j => <JourneyRow key={j.id} j={j} />)}
      </div>

      {/* End-of-list footer */}
      <div style={{ padding:'14px 18px 24px', textAlign:'center' }}>
        <button style={{
          background:'var(--surface)', border:'1px solid var(--line)',
          color:'var(--fg)', padding:'10px 16px', borderRadius:'var(--r-md)',
          fontSize:13, fontWeight:600, cursor:'pointer',
        }}>Later op de dag tonen</button>
      </div>
    </AppShell>
  );
}

function SmartSuggestion({ s }) {
  return (
    <div style={{
      background:'linear-gradient(180deg, color-mix(in srgb, var(--signal) 12%, var(--surface)) 0%, var(--surface) 100%)',
      border:'1px solid var(--signal-line)', borderRadius:'var(--r-lg)',
      padding:'12px 14px', display:'flex', flexDirection:'column', gap:8,
      boxShadow:'var(--shadow-card)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{
          width:24, height:24, borderRadius:6, background:'var(--signal)',
          color:'#0a0d12', display:'flex', alignItems:'center', justifyContent:'center', flex:'none',
        }}>
          <Icon name="sparkle" size={14} color="#0a0d12" />
        </span>
        <span style={{ fontSize:13, fontWeight:700, color:'var(--signal)', letterSpacing:'-0.01em' }}>
          Slim ingerekend voor jou
        </span>
        <span style={{ flex:1 }} />
        <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{s.saved}</span>
      </div>
      <div style={{ fontSize:13, color:'var(--fg)', lineHeight:1.4 }}>
        <span className="mono" style={{ color:'var(--fg-dim)' }}>{s.trigger}</span>
      </div>
      <div style={{
        background:'var(--surface-2)', border:'1px dashed var(--signal-line)',
        borderRadius:'var(--r-sm)', padding:'8px 10px',
        fontSize:12, color:'var(--fg)', display:'flex', gap:8, alignItems:'flex-start',
      }}>
        <span className="label" style={{ fontSize:10, color:'var(--signal)', flex:'none', marginTop:2 }}>{s.stop}</span>
        <span style={{ lineHeight:1.4 }}>{s.proposed}</span>
      </div>
    </div>
  );
}

function JourneyRow({ j }) {
  const tone = j.recommended ? 'signal' : 'plain';
  const accent = j.recommended ? 'var(--signal)' : (j.disrupted ? 'var(--late)' : null);
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--line)',
      borderLeft: accent ? `3px solid ${accent}` : '1px solid var(--line)',
      borderRadius:'var(--r-md)', padding:'10px 12px',
      display:'flex', flexDirection:'column', gap:8,
    }}>
      {/* Top: times + price */}
      <div style={{ display:'grid', gridTemplateColumns:'62px 62px 1fr auto', gap:8, alignItems:'baseline' }}>
        <span className="mono" style={{ fontSize:20, fontWeight:600, color: j.recommended ? 'var(--signal)' : 'var(--fg)' }}>{j.dep}</span>
        <span className="mono" style={{ fontSize:20, fontWeight:600 }}>{j.arr}</span>
        <span className="mono" style={{ fontSize:13, color:'var(--fg-dim)' }}>{j.dur}</span>
        <div style={{ textAlign:'right' }}>
          <div className="mono" style={{ fontSize:15, fontWeight:600 }}>{j.price}</div>
          {j.basePrice !== j.price && (
            <div className="mono" style={{ fontSize:10, color:'var(--fg-mute)', textDecoration:'line-through' }}>{j.basePrice}</div>
          )}
        </div>
      </div>

      {/* Modality row + status */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <ModalityRow modes={j.modes} size={14} />
        <span style={{ width:1, height:14, background:'var(--line)' }} />
        <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>
          {j.transfers === 0 ? 'direct' : `${j.transfers}× ${j.transferAt}`}
        </span>
        <span style={{ flex:1 }} />
        <PlatformChip p={j.platforms.dep} label="VTR" tone={tone} />
        <Icon name="chev" size={10} color="var(--fg-mute)" />
        <PlatformChip p={j.platforms.arr} label="AANK" />
      </div>

      {/* Status pill row */}
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        paddingTop:6, borderTop:'1px dashed var(--line)',
      }}>
        <StatusDot status={j.status} />
        <DelayPill delay={j.delay} status={j.status} />
        {j.smartNote && (
          <span style={{
            display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'var(--signal)',
            background:'var(--signal-bg)', padding:'2px 7px', borderRadius:'var(--r-sm)', fontWeight:600,
          }}>
            <Icon name="sparkle" size={11} color="var(--signal)" />
            {j.smartNote}
          </span>
        )}
        {j.disrupted && (
          <span style={{
            display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'var(--late)',
            background:'var(--late-bg)', padding:'2px 7px', borderRadius:'var(--r-sm)', fontWeight:600,
          }}>
            <Icon name="alert" size={11} color="var(--late)" />
            Werkzaamheden
          </span>
        )}
        <span style={{ flex:1 }} />
        {j.bullet && !j.disrupted && (
          <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{j.bullet}</span>
        )}
        <Icon name="chev" size={14} color="var(--fg-mute)" />
      </div>
    </div>
  );
}

function iconBtnSm() {
  return {
    width:36, height:36, borderRadius:'var(--r-md)',
    background:'var(--surface-2)', border:'1px solid var(--line)',
    color:'var(--fg-dim)', display:'inline-flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', padding:0,
  };
}

// ─────────────────────────────────────────────────────────────
// SCREEN 6 — Journey detail
// ─────────────────────────────────────────────────────────────
function ScreenDetail({ theme = 'dark' }) {
  const j = window.REIZIGER_DATA.journeyDetail;
  return (
    <AppShell theme={theme} noTab scrollKey="detail"
      back={true} title=""
      action={<div style={{ display:'flex', gap:6 }}>
        <button style={iconBtnSm()}><Icon name="save" size={16} color="var(--fg-dim)" /></button>
        <button style={iconBtnSm()}><Icon name="share" size={16} color="var(--fg-dim)" /></button>
      </div>}>

      {/* Hero block — big times, price, transfers */}
      <div style={{ padding:'10px 18px 0' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8 }}>
          <Flap time={j.dep} size="xl" tone="signal" />
          <span className="mono" style={{ fontSize:13, color:'var(--fg-dim)', paddingBottom:6 }}>{j.dur}</span>
          <Flap time={j.arr} size="xl" />
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginTop:8 }}>
          <span style={{ fontSize:13, color:'var(--fg-dim)' }}>{j.from}</span>
          <Icon name="chev" size={12} color="var(--fg-mute)" />
          <span style={{ fontSize:13, color:'var(--fg-dim)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.to}</span>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{
        margin:'14px 18px 0', background:'var(--surface)',
        border:'1px solid var(--line)', borderRadius:'var(--r-md)',
        display:'grid', gridTemplateColumns:'repeat(4, 1fr)',
      }}>
        <Stat label="Duur" value={j.dur} />
        <Stat label="Over" value={`${j.transfers}× ${j.transferAt}`} />
        <Stat label="Prijs" value={j.price} accent />
        <Stat label="CO₂" value={j.co2} />
      </div>
      {/* Korting line */}
      <div style={{ padding:'8px 18px 0', display:'flex', alignItems:'center', gap:8 }}>
        <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)', textDecoration:'line-through' }}>{j.basePrice}</span>
        <span style={{
          padding:'2px 7px', borderRadius:'var(--r-sm)', background:'var(--signal-bg)',
          color:'var(--signal)', fontSize:10, fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase',
        }}>{j.discount}</span>
      </div>

      {/* Disruption banner */}
      {j.disruption.active && (
        <div style={{
          margin:'14px 18px 0', padding:'10px 14px',
          background:'var(--warn-bg)', border:'1px solid var(--line)',
          borderLeft:'3px solid var(--warn)',
          borderRadius:'var(--r-md)',
          display:'flex', gap:10, alignItems:'flex-start',
        }}>
          <Icon name="alert" size={16} color="var(--warn)" />
          <div style={{ flex:1, fontSize:12, lineHeight:1.45 }}>
            {j.disruption.body}
          </div>
        </div>
      )}

      {/* Steps ladder */}
      <Eyebrow>Onderweg</Eyebrow>
      <div style={{ padding:'0 18px', position:'relative' }}>
        {/* Vertical rail */}
        <div style={{ position:'absolute', left:35, top:8, bottom:8, width:1, background:'var(--line)' }} />
        <div style={{ display:'flex', flexDirection:'column' }}>
          {j.steps.map((s, i) => <StepRow key={i} s={s} />)}
        </div>
      </div>

      {/* Calendar actions */}
      <Eyebrow>Toevoegen aan agenda</Eyebrow>
      <div style={{ padding:'0 18px', display:'flex', gap:8 }}>
        <CalBtn icon="google" label="Google Agenda" />
        <CalBtn icon="apple"  label="Apple Agenda" />
      </div>

      {/* Bottom CTA */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, padding:'14px 18px 28px',
        background:'color-mix(in srgb, var(--bg) 92%, transparent)',
        backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
        borderTop:'1px solid var(--line)',
        display:'flex', gap:8,
      }}>
        <GhostBtn style={{ flex:'none', padding:'12px 14px' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
            <Icon name="save" size={14} /> Bewaar
          </span>
        </GhostBtn>
        <SignalBtn full style={{ padding:'14px 18px' }}>Begin reis · vertrek in 12 m</SignalBtn>
      </div>
      <div style={{ height:90 }} />
    </AppShell>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div style={{
      padding:'10px 12px', borderRight:'1px solid var(--line)',
      display:'flex', flexDirection:'column', gap:2,
    }}>
      <span className="label" style={{ fontSize:9 }}>{label}</span>
      <span className="mono" style={{ fontSize:13, fontWeight:600, color: accent ? 'var(--signal)' : 'var(--fg)' }}>{value}</span>
    </div>
  );
}

function CalBtn({ icon, label }) {
  return (
    <button style={{
      flex:1, background:'var(--surface)', border:'1px solid var(--line)',
      borderRadius:'var(--r-md)', padding:'10px 12px',
      display:'flex', alignItems:'center', gap:10, cursor:'pointer', color:'var(--fg)',
    }}>
      <Icon name={icon} size={20} color="var(--fg)" />
      <span style={{ fontSize:12, fontWeight:600, textAlign:'left' }}>{label}</span>
      <span style={{ flex:1 }} />
      <Icon name="plus" size={14} color="var(--fg-dim)" />
    </button>
  );
}

function StepRow({ s }) {
  if (s.kind === 'walk') {
    return (
      <div style={{ display:'flex', gap:14, padding:'8px 0' }}>
        <span style={{
          width:24, height:24, borderRadius:12, background:'var(--surface-3)',
          border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center',
          color:'var(--walk)', marginLeft:11, flex:'none',
        }}>
          <Icon name="foot" size={14} color="var(--walk)" />
        </span>
        <div style={{ flex:1, paddingTop:2 }}>
          <div style={{ fontSize:13, color:'var(--fg-dim)' }}>{s.from} → {s.to}</div>
          <div className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{s.detail} · {s.dur}</div>
        </div>
      </div>
    );
  }
  if (s.kind === 'xfer') {
    return (
      <div style={{ display:'flex', gap:14, padding:'8px 0' }}>
        <span style={{
          width:24, height:24, borderRadius:12, background:'var(--signal-bg)',
          border:'1px solid var(--signal-line)', display:'flex', alignItems:'center', justifyContent:'center',
          color:'var(--signal)', marginLeft:11, flex:'none',
        }}>
          <Icon name="sparkle" size={12} color="var(--signal)" />
        </span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--signal)' }}>Overstap · {s.stop}</div>
          <div className="mono" style={{ fontSize:11, color:'var(--fg-dim)' }}>{s.perronWalk} · {s.dur}</div>
          <div style={{ fontSize:11, color:'var(--fg-mute)', fontStyle:'italic' }}>{s.note}</div>
        </div>
      </div>
    );
  }
  // rail leg
  return (
    <div style={{ display:'flex', gap:14, padding:'10px 0', borderTop:'1px dashed var(--line)' }}>
      <span style={{
        width:24, height:24, borderRadius:12, background:'var(--surface-2)',
        border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center',
        marginLeft:11, flex:'none',
      }}>
        <ModalityGlyph mode="rail" size={14} />
      </span>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
          <span className="mono" style={{ fontSize:14, fontWeight:600 }}>{s.code}</span>
          <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{s.dep} – {s.arr}</span>
        </div>
        <div style={{
          marginTop:6, display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:10, alignItems:'center',
          background:'var(--surface-2)', border:'1px solid var(--line)',
          borderRadius:'var(--r-sm)', padding:'8px 10px',
        }}>
          <div>
            <div className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{s.dep}</div>
            <div style={{ fontSize:12 }}>{s.from}</div>
            <PlatformChip p={s.platformDep} label="VTR" tone="signal" />
          </div>
          <Icon name="chev" size={14} color="var(--fg-mute)" />
          <div>
            <div className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{s.arr}</div>
            <div style={{ fontSize:12 }}>{s.to}</div>
            <PlatformChip p={s.platformArr} label="AANK" />
          </div>
        </div>
        {s.seats && <div style={{ fontSize:11, color:'var(--fg-mute)', marginTop:4 }}>{s.seats}</div>}
      </div>
    </div>
  );
}

window.ScreenResults = ScreenResults;
window.ScreenDetail = ScreenDetail;
