// Reiziger mobile — App shell (header + bottom tab bar) used by every screen.
// Each screen renders inside an iOS device frame on the design canvas; the
// shell here is the *app* chrome (status bar belongs to the device frame).

function AppShell({ children, theme = 'dark', title, back, action, tab = 'home', noTab, scrollKey }) {
  return (
    <div
      className="r-app tex-board"
      data-theme={theme}
      style={{
        width:'100%', height:'100%', display:'flex', flexDirection:'column',
        overflow:'hidden', position:'relative',
      }}
    >
      <AppHeader title={title} back={back} action={action} />
      <div
        key={scrollKey}
        style={{ flex:1, overflowY:'auto', overflowX:'hidden', paddingBottom: noTab ? 40 : 92 }}
      >
        {children}
      </div>
      {!noTab && <TabBar active={tab} />}
    </div>
  );
}

function AppHeader({ title, back, action }) {
  return (
    <div style={{
      paddingTop: 56,                        // clears the device status bar
      paddingLeft: 18, paddingRight: 18, paddingBottom: 10,
      display:'flex', alignItems:'center', gap:12,
      borderBottom:'1px solid var(--line)',
      background:'color-mix(in srgb, var(--bg) 85%, transparent)',
      backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
      position:'relative', zIndex:5,
    }}>
      {back ? (
        <button style={iconBtn()}>
          <Icon name="chevL" size={18} />
        </button>
      ) : (
        <span style={{ display:'flex', alignItems:'center', gap:8 }}>
          <img src="../../assets/logo/reiziger-mark.svg" alt="" style={{ height:22, width:'auto', display:'block' }} />
          <span style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.01em' }}>Reiziger</span>
        </span>
      )}
      <span style={{ flex:1 }}>
        {title && <span style={{ fontSize:16, fontWeight:600 }}>{title}</span>}
      </span>
      {action || (
        <button style={iconBtn()}>
          <Icon name="settings" size={18} color="var(--fg-dim)" />
        </button>
      )}
    </div>
  );
}

function iconBtn() {
  return {
    width:36, height:36, borderRadius:'var(--r-md)',
    background:'var(--surface-2)', border:'1px solid var(--line)',
    color:'var(--fg-dim)', display:'inline-flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', padding:0,
  };
}

function TabBar({ active }) {
  const tabs = [
    { id:'home',   label:'Vandaag', icon:'home' },
    { id:'plan',   label:'Plan',    icon:'pin' },
    { id:'save',   label:'Bewaard', icon:'star' },
    { id:'me',     label:'Mij',     icon:'user' },
  ];
  return (
    <div style={{
      position:'absolute', left:0, right:0, bottom:0, height:78,
      background:'color-mix(in srgb, var(--surface) 92%, transparent)',
      backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
      borderTop:'1px solid var(--line)',
      display:'flex', alignItems:'flex-start', justifyContent:'space-around',
      padding:'10px 8px 0',
      zIndex:10,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <div key={t.id} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            color: on ? 'var(--signal)' : 'var(--fg-mute)', minWidth:56,
          }}>
            <Icon name={t.icon} size={20} color={on ? 'var(--signal)' : 'var(--fg-mute)'} />
            <span style={{ fontSize:11, fontWeight:600, letterSpacing:'-0.01em' }}>{t.label}</span>
            {on && <span style={{ width:18, height:2, background:'var(--signal)', borderRadius:1, marginTop:2 }} />}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 1 — Today / Home
// Surfaces: greeting, disruptions on YOUR routes, today's auto-suggested
// trip with smart-late warning, and quick-tap regular trips.
// ─────────────────────────────────────────────────────────────
function ScreenToday({ theme = 'dark' }) {
  const data = window.REIZIGER_DATA;
  const t = data.todaySuggestion;
  const disrupted = data.disruptions.filter(d => d.affectsYou);
  return (
    <AppShell theme={theme} tab="home" scrollKey="today">
      <div style={{ padding:'14px 18px 0' }}>
        <div className="label" style={{ marginBottom:4 }}>Wo 26 mei · 16:08</div>
        <h2 style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:0 }}>
          Goedemiddag, {data.user.name}
        </h2>
        <div style={{ color:'var(--fg-dim)', fontSize:13, marginTop:2 }}>
          {t.pattern}
        </div>
      </div>

      {/* Disruptions banner — collapsed accordion list */}
      <Eyebrow right={<span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{disrupted.length} actief</span>}>
        Storingen op jouw reizen
      </Eyebrow>
      <div style={{ padding:'0 18px', display:'flex', flexDirection:'column', gap:8 }}>
        {disrupted.map(d => <DisruptionRow key={d.id} d={d} />)}
      </div>

      {/* Today's auto-suggested trip — hero card */}
      <Eyebrow right={<span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>over 1u 26m</span>}>
        Vandaag · werk → thuis
      </Eyebrow>
      <div style={{ padding:'0 18px' }}>
        <TodayHero t={t} />
      </div>

      {/* Regular trips */}
      <Eyebrow right={<span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>3 routes</span>}>
        Jouw vaste reizen
      </Eyebrow>
      <div style={{ padding:'0 18px 24px', display:'flex', flexDirection:'column', gap:8 }}>
        {data.regularTrips.map(rt => <RegularTripRow key={rt.id} rt={rt} />)}
      </div>
    </AppShell>
  );
}

function DisruptionRow({ d }) {
  const sevColor = d.severity === 'high' ? 'var(--late)' : d.severity === 'med' ? 'var(--warn)' : 'var(--fg-mute)';
  const sevBg    = d.severity === 'high' ? 'var(--late-bg)' : d.severity === 'med' ? 'var(--warn-bg)' : 'var(--surface-3)';
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--line)',
      borderLeft:`3px solid ${sevColor}`, borderRadius:'var(--r-md)',
      padding:'12px 14px', display:'flex', flexDirection:'column', gap:6,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{
          padding:'2px 7px', borderRadius:'var(--r-sm)', background:sevBg, color:sevColor,
          fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em',
        }}>
          {d.severity === 'high' ? 'Ernstig' : d.severity === 'med' ? 'Hinder' : 'Info'}
        </span>
        <ModalityGlyph mode={d.modality} size={14} />
        <span style={{ fontSize:12, color:'var(--fg-dim)' }}>{d.area}</span>
        <span style={{ marginLeft:'auto' }} className="mono" />
      </div>
      <div style={{ fontSize:14, fontWeight:600, lineHeight:1.3 }}>{d.title}</div>
      <div style={{ fontSize:12, color:'var(--fg-dim)', lineHeight:1.45 }}>{d.body}</div>
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderTop:'1px dashed var(--line)', paddingTop:8, marginTop:2,
      }}>
        <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>tot {d.until}</span>
        <span style={{ display:'flex', alignItems:'center', gap:4, color:'var(--signal)', fontSize:12, fontWeight:600 }}>
          Toon alternatief
          <Icon name="chev" size={14} color="var(--signal)" />
        </span>
      </div>
    </div>
  );
}

function TodayHero({ t }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--line)',
      borderRadius:'var(--r-lg)', overflow:'hidden',
      boxShadow:'var(--shadow-card)',
    }}>
      {/* Top: time row */}
      <div style={{ display:'flex', alignItems:'stretch' }}>
        <div style={{ flex:1, padding:'14px 16px' }}>
          <div className="label" style={{ fontSize:10, color:'var(--fg-mute)' }}>Vertrek</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
            <span className="mono flap" style={{ fontSize:30, fontWeight:500, color:'var(--signal)' }}>{t.dep}</span>
            {t.delay > 0 && <DelayPill delay={t.delay} status={t.status} />}
          </div>
          <div style={{ fontSize:12, color:'var(--fg-dim)', marginTop:2 }}>Utrecht Centraal · spoor {t.platforms[0]}</div>
        </div>
        <div style={{ width:1, background:'var(--line)' }} />
        <div style={{ flex:1, padding:'14px 16px' }}>
          <div className="label" style={{ fontSize:10, color:'var(--fg-mute)' }}>Aankomst</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
            <span className="mono" style={{ fontSize:30, fontWeight:500 }}>{t.arr}</span>
          </div>
          <div style={{ fontSize:12, color:'var(--fg-dim)', marginTop:2 }}>Den Haag · 4 min lopen</div>
        </div>
      </div>

      {/* Modality row + meta */}
      <div style={{
        display:'flex', alignItems:'center', gap:12, padding:'10px 16px',
        borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)',
        background:'var(--surface-2)',
      }}>
        <ModalityRow modes={['walk', 'rail', 'walk', 'rail', 'walk']} />
        <span className="mono" style={{ fontSize:12, color:'var(--fg-dim)' }}>{t.dur}</span>
        <span style={{ flex:1 }} />
        <span className="mono" style={{ fontSize:12, color:'var(--fg-mute)' }}>{t.transfers}× over</span>
      </div>

      {/* Smart-warning row */}
      {t.disruption && (
        <div style={{
          padding:'10px 16px', display:'flex', alignItems:'flex-start', gap:10,
          background:'var(--warn-bg)', borderBottom:'1px solid var(--line)',
        }}>
          <Icon name="alert" size={16} color="var(--warn)" />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--warn)' }}>+4 min, kans op overstap te missen</div>
            <div style={{ fontSize:11, color:'var(--fg-dim)', lineHeight:1.4, marginTop:1 }}>
              IC 3041 is dit jaar 73% van de ritten vertraagd. Reiziger raadt +8 min over in Utrecht.
            </div>
          </div>
        </div>
      )}

      {/* Price + actions */}
      <div style={{ display:'flex', alignItems:'center', padding:'10px 16px', gap:10 }}>
        <div>
          <div className="mono" style={{ fontSize:18, fontWeight:600 }}>{t.price}</div>
          <div className="mono" style={{ fontSize:11, color:'var(--fg-mute)', textDecoration:'line-through' }}>{t.basePrice}</div>
        </div>
        <div style={{
          padding:'3px 8px', borderRadius:'var(--r-sm)', background:'var(--signal-bg)',
          color:'var(--signal)', fontSize:11, fontWeight:600,
        }}>{t.usedDiscount}</div>
        <span style={{ flex:1 }} />
        <SignalBtn style={{ padding:'10px 14px', fontSize:13 }}>Bekijk reis</SignalBtn>
      </div>
    </div>
  );
}

function RegularTripRow({ rt }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--line)',
      borderRadius:'var(--r-md)', padding:'12px 14px',
      display:'flex', flexDirection:'column', gap:8,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:14, fontWeight:600 }}>{rt.label}</span>
        <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{rt.dow}</span>
        <span style={{ flex:1 }} />
        {rt.disrupted && (
          <span style={{
            padding:'2px 7px', borderRadius:'var(--r-sm)', background:'var(--late-bg)',
            color:'var(--late)', fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
          }}>Verstoord</span>
        )}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--fg-dim)' }}>
        <span style={{ minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rt.from}</span>
        <Icon name="chev" size={12} color="var(--fg-mute)" />
        <span style={{ minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rt.to}</span>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:12 }}>
        <span className="mono" style={{ fontSize:14, fontWeight:600 }}>
          {rt.typical.dep} <span style={{ color:'var(--fg-mute)' }}>→</span> {rt.typical.arr}
        </span>
        <span className="mono" style={{ fontSize:12, color:'var(--fg-dim)' }}>{rt.typical.dur}</span>
        <span style={{ flex:1 }} />
        <span className="mono" style={{ fontSize:12 }}>{rt.typical.price}</span>
      </div>
      {rt.alt && (
        <div style={{
          marginTop:2, padding:'8px 10px', background:'var(--surface-2)',
          border:'1px dashed var(--signal-line)', borderRadius:'var(--r-sm)',
          display:'flex', alignItems:'center', gap:8,
        }}>
          <Icon name="sparkle" size={14} color="var(--signal)" />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, color:'var(--fg)' }}>
              Alternatief: <span className="mono">{rt.alt.dep} → {rt.alt.arr}</span>
              <span style={{ color:'var(--fg-mute)' }}> · {rt.alt.delta}</span>
            </div>
            <div style={{ fontSize:11, color:'var(--fg-dim)', lineHeight:1.4 }}>{rt.alt.why}</div>
          </div>
        </div>
      )}
    </div>
  );
}

window.AppShell = AppShell;
window.ScreenToday = ScreenToday;
