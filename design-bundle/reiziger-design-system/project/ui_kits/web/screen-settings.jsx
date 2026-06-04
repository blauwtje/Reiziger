// Reiziger mobile — Settings, Abonnement suggestions, Disruptions overview.

// ─────────────────────────────────────────────────────────────
// SCREEN 7 — Settings ("Mij")
// transfer-min, walk/bike speed, kortingen, calendar links, theme
// ─────────────────────────────────────────────────────────────
function ScreenSettings({ theme = 'dark' }) {
  const data = window.REIZIGER_DATA;
  const u = data.user;
  return (
    <AppShell theme={theme} tab="me" scrollKey="settings">
      {/* Profile header */}
      <div style={{ padding:'14px 18px 0', display:'flex', alignItems:'center', gap:12 }}>
        <span style={{
          width:52, height:52, borderRadius:26, background:'var(--signal-bg)',
          border:'1px solid var(--signal-line)', display:'flex', alignItems:'center', justifyContent:'center',
          color:'var(--signal)', fontFamily:'var(--font-mono)', fontSize:22, fontWeight:600,
        }}>S</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:18, fontWeight:700 }}>{u.name}</div>
          <div className="mono" style={{ fontSize:12, color:'var(--fg-dim)' }}>23 reizen deze maand · € 178,40</div>
        </div>
        <button style={{
          padding:'8px 12px', background:'var(--surface)', border:'1px solid var(--line)',
          borderRadius:'var(--r-md)', color:'var(--fg)', fontSize:12, fontWeight:600, cursor:'pointer',
        }}>Profiel</button>
      </div>

      {/* Section: overstaptijden */}
      <Eyebrow right={<span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>standaard 6 min</span>}>
        Minimale overstaptijd
      </Eyebrow>
      <div style={{ padding:'0 18px' }}>
        <Panel pad={0}>
          <SliderRow label="Algemeen" value={u.minTransfer} unit="min" min={2} max={20} />
          <div style={{ height:1, background:'var(--line)' }} />
          {Object.entries(u.perStopTransfer).map(([stop, mins], i, arr) => (
            <React.Fragment key={stop}>
              <SliderRow label={stop} value={mins} unit="min" min={2} max={20} highlight />
              {i < arr.length - 1 && <div style={{ height:1, background:'var(--line)' }} />}
            </React.Fragment>
          ))}
          <div style={{ height:1, background:'var(--line)' }} />
          <div style={{
            padding:'10px 14px', display:'flex', alignItems:'center', gap:8,
            color:'var(--fg-dim)', fontSize:13, cursor:'pointer',
          }}>
            <Icon name="plus" size={14} color="var(--fg-dim)" />
            Station / halte toevoegen
          </div>
        </Panel>
        <div style={{ fontSize:11, color:'var(--fg-mute)', marginTop:6, lineHeight:1.5 }}>
          Reizen onder de drempel verschijnen niet in resultaten. Per stop overschrijft het algemene minimum.
        </div>
      </div>

      {/* Section: lopen + fietsen */}
      <Eyebrow>Loop- en fietssnelheid</Eyebrow>
      <div style={{ padding:'0 18px' }}>
        <Panel pad={0}>
          <SliderRow icon="foot" label="Lopen" value={u.walkSpeed} unit=" km/u" min={3} max={7} step={0.1} default_={4.5} />
          <div style={{ height:1, background:'var(--line)' }} />
          <SliderRow icon="bike" label="Fietsen" value={u.bikeSpeed} unit=" km/u" min={10} max={25} step={1} default_={16} />
        </Panel>
        <div style={{ fontSize:11, color:'var(--fg-mute)', marginTop:6, lineHeight:1.5 }}>
          Pas eens aan en zie hoe je reistijd verandert. Reiziger leert mee op basis van je werkelijke ritten.
        </div>
      </div>

      {/* Section: kortingen */}
      <Eyebrow right={<span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{u.discounts.filter(d=>d.on).length}/{u.discounts.length}</span>}>
        Kortingen & abonnementen
      </Eyebrow>
      <div style={{ padding:'0 18px' }}>
        <Panel pad={0}>
          {u.discounts.map((d, i) => (
            <React.Fragment key={d.id}>
              <ToggleRow label={d.name} sub={d.desc} on={d.on} />
              {i < u.discounts.length - 1 && <div style={{ height:1, background:'var(--line)' }} />}
            </React.Fragment>
          ))}
        </Panel>
      </div>

      {/* Section: agenda */}
      <Eyebrow>Agenda</Eyebrow>
      <div style={{ padding:'0 18px' }}>
        <Panel pad={0}>
          {u.calendars.map((c, i) => (
            <React.Fragment key={c.id}>
              <ToggleRow icon={c.id} label={c.name} sub={c.on ? c.email : 'Niet gekoppeld'} on={c.on} />
              {i < u.calendars.length - 1 && <div style={{ height:1, background:'var(--line)' }} />}
            </React.Fragment>
          ))}
        </Panel>
      </div>

      {/* Section: thema */}
      <Eyebrow>Weergave</Eyebrow>
      <div style={{ padding:'0 18px 28px' }}>
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8,
        }}>
          {[
            { id:'system', label:'Systeem', preview: ['#0a0d12', '#ece7dd'] },
            { id:'light',  label:'Licht',   preview: ['#ece7dd', '#f5f1e8'] },
            { id:'dark',   label:'Donker',  preview: ['#0a0d12', '#11151c'] },
          ].map(opt => {
            const on = opt.id === (theme === 'light' ? 'light' : 'dark');
            return (
              <div key={opt.id} style={{
                padding:'10px 10px 8px',
                background:'var(--surface)', border:'1px solid ' + (on ? 'var(--signal-line)' : 'var(--line)'),
                borderRadius:'var(--r-md)', cursor:'pointer', boxShadow: on ? 'var(--glow-signal)' : 'none',
              }}>
                <div style={{
                  height:42, borderRadius:'var(--r-sm)',
                  background:`linear-gradient(135deg, ${opt.preview[0]} 50%, ${opt.preview[1]} 50%)`,
                  border:'1px solid var(--line)',
                  marginBottom:6,
                }} />
                <div style={{ fontSize:12, fontWeight:600, color: on ? 'var(--signal)' : 'var(--fg)' }}>{opt.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function SliderRow({ label, value, unit = '', min = 0, max = 100, step = 1, highlight, default_, icon }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {icon && <Icon name={icon} size={16} color="var(--fg-dim)" />}
        <span style={{ fontSize:13, fontWeight:600, color: highlight ? 'var(--signal)' : 'var(--fg)' }}>
          {label}
          {highlight && <span style={{
            marginLeft:6, padding:'1px 6px', fontSize:9, background:'var(--signal-bg)',
            border:'1px solid var(--signal-line)', color:'var(--signal)',
            borderRadius:'var(--r-sm)', fontWeight:600,
            textTransform:'uppercase', letterSpacing:'0.08em',
          }}>Per stop</span>}
        </span>
        <span style={{ flex:1 }} />
        <span className="mono" style={{ fontSize:14, fontWeight:600 }}>{value}{unit}</span>
        {default_ && value !== default_ && (
          <span className="mono" style={{ fontSize:10, color:'var(--fg-mute)' }}>std {default_}</span>
        )}
      </div>
      {/* slider visual */}
      <div style={{ position:'relative', height:6, background:'var(--surface-3)', borderRadius:3 }}>
        <div style={{
          position:'absolute', left:0, top:0, bottom:0, width:`${pct}%`,
          background:'var(--signal)', borderRadius:3,
        }} />
        <div style={{
          position:'absolute', left:`calc(${pct}% - 9px)`, top:-6, width:18, height:18,
          background:'var(--surface-2)', border:'2px solid var(--signal)', borderRadius:9,
          boxShadow:'0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  );
}

function ToggleRow({ label, sub, on, icon }) {
  return (
    <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
      {icon && (
        <span style={{
          width:32, height:32, borderRadius:8, background:'var(--surface-3)',
          display:'flex', alignItems:'center', justifyContent:'center', flex:'none',
        }}>
          <Icon name={icon} size={18} />
        </span>
      )}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:600 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:'var(--fg-dim)' }}>{sub}</div>}
      </div>
      <span style={{
        width:40, height:22, borderRadius:11,
        background: on ? 'var(--signal)' : 'var(--surface-3)',
        border:'1px solid ' + (on ? 'var(--signal)' : 'var(--line)'),
        position:'relative', flex:'none',
      }}>
        <span style={{
          position:'absolute', top:1, left: on ? 19 : 1, width:18, height:18, borderRadius:9,
          background: on ? '#0a0d12' : 'var(--surface)',
          border: on ? 'none' : '1px solid var(--line)',
          transition:'left 160ms ease',
        }} />
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 8 — Abonnement-suggestion
// ─────────────────────────────────────────────────────────────
function ScreenAbonnement({ theme = 'dark' }) {
  const sub = window.REIZIGER_DATA.subscription;
  return (
    <AppShell theme={theme} noTab scrollKey="abo"
      back={true} title="Abonnement-advies">

      {/* Hero — what we observed */}
      <div style={{ padding:'14px 18px 0' }}>
        <div style={{
          background:'var(--surface)', border:'1px solid var(--line)',
          borderRadius:'var(--r-lg)', padding:'14px 16px',
          boxShadow:'var(--shadow-card)',
        }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
            <Icon name="sparkle" size={16} color="var(--signal)" />
            <span className="label" style={{ fontSize:10, color:'var(--signal)' }}>Op basis van jouw reizen</span>
            <span style={{ flex:1 }} />
            <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{sub.period}</span>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginTop:10 }}>
            <span className="mono" style={{ fontSize:32, fontWeight:600, color:'var(--signal)' }}>{sub.monthSpend}</span>
            <span style={{ fontSize:13, color:'var(--fg-dim)' }}>over {sub.trips} reizen</span>
          </div>
          <div style={{
            marginTop:10, padding:'8px 10px', background:'var(--surface-2)',
            border:'1px dashed var(--line)', borderRadius:'var(--r-sm)',
            fontSize:12, color:'var(--fg-dim)', lineHeight:1.45,
          }}>
            Je hebt geen abonnement ingevuld. Reiziger meet je werkelijke ritten en stelt deze opties voor.
          </div>
        </div>
      </div>

      <Eyebrow right={<span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>per maand</span>}>
        Aanbevolen
      </Eyebrow>

      <div style={{ padding:'0 18px 100px', display:'flex', flexDirection:'column', gap:10 }}>
        {sub.options.map(o => <AboCard key={o.id} o={o} current={sub.current} />)}
      </div>

      {/* Bottom CTA */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, padding:'12px 18px 28px',
        background:'color-mix(in srgb, var(--bg) 92%, transparent)',
        backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
        borderTop:'1px solid var(--line)',
        display:'flex', alignItems:'center', gap:10,
      }}>
        <div style={{ flex:1 }}>
          <div className="label" style={{ fontSize:10 }}>Geschatte besparing</div>
          <div className="mono" style={{ fontSize:16, fontWeight:600, color:'var(--ok)' }}>€ 66,00 / mnd</div>
        </div>
        <SignalBtn>Activeer Dal Voordeel</SignalBtn>
      </div>
    </AppShell>
  );
}

function AboCard({ o, current }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--line)',
      borderLeft: o.best ? '3px solid var(--signal)' : '1px solid var(--line)',
      borderRadius:'var(--r-md)', overflow:'hidden',
    }}>
      <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:14, fontWeight:700 }}>{o.name}</span>
            {o.best && (
              <span style={{
                padding:'2px 7px', borderRadius:'var(--r-sm)', background:'var(--signal-bg)',
                color:'var(--signal)', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
              }}>Aanrader</span>
            )}
          </div>
          <div className="mono" style={{ fontSize:11, color:'var(--fg-dim)' }}>{o.fee}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div className="mono" style={{ fontSize:16, fontWeight:600 }}>{o.net}</div>
          <div className="mono" style={{ fontSize:11, color: o.save === '–' ? 'var(--fg-mute)' : 'var(--ok)' }}>
            {o.save === '–' ? '—' : `- ${o.save}`}
          </div>
        </div>
      </div>
      {/* Mini bar comparing to current */}
      <div style={{ padding:'0 14px 12px' }}>
        <div style={{ height:6, background:'var(--surface-3)', borderRadius:3, position:'relative', overflow:'hidden' }}>
          {/* current spend bar */}
          <div style={{
            position:'absolute', left:0, top:0, bottom:0, width:'100%',
            background:'var(--surface-4)',
          }} />
          {/* new spend bar */}
          <div style={{
            position:'absolute', left:0, top:0, bottom:0,
            width: o.save === '–' ? '100%' : `${Math.round((parseFloat(o.net.replace('€','').replace(',','.')) / 178.40) * 100)}%`,
            background: o.best ? 'var(--signal)' : 'var(--fg-dim)',
          }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
          <span className="mono" style={{ fontSize:10, color:'var(--fg-mute)' }}>nieuw {o.net}</span>
          <span className="mono" style={{ fontSize:10, color:'var(--fg-mute)' }}>nu {current.net}</span>
        </div>
      </div>
      <div style={{
        padding:'10px 14px', background:'var(--surface-2)',
        borderTop:'1px solid var(--line)',
        fontSize:12, color:'var(--fg-dim)', lineHeight:1.45,
      }}>
        {o.why}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 9 — Disruptions overview
// ─────────────────────────────────────────────────────────────
function ScreenDisruptions({ theme = 'dark' }) {
  const data = window.REIZIGER_DATA;
  const yours = data.disruptions.filter(d => d.affectsYou);
  const other = data.disruptions.filter(d => !d.affectsYou);
  return (
    <AppShell theme={theme} noTab scrollKey="disr"
      back={true} title="Storingen"
      action={<button style={iconBtnSm()}><Icon name="list" size={16} color="var(--fg-dim)" /></button>}>

      {/* Live badge */}
      <div style={{ padding:'10px 18px 0', display:'flex', alignItems:'center', gap:8 }}>
        <span className="pulse" style={{ width:8, height:8, borderRadius:4, background:'var(--late)' }} />
        <span className="label" style={{ fontSize:11, color:'var(--late)' }}>Live · 16:08</span>
        <span style={{ flex:1 }} />
        <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{data.disruptions.length} actief in NL</span>
      </div>

      <Eyebrow right={<span className="mono" style={{ fontSize:11, color:'var(--late)' }}>{yours.length} routes</span>}>
        Op jouw routes
      </Eyebrow>
      <div style={{ padding:'0 18px', display:'flex', flexDirection:'column', gap:8 }}>
        {yours.map(d => <DisruptionExpanded key={d.id} d={d} />)}
      </div>

      <Eyebrow>Elders in het netwerk</Eyebrow>
      <div style={{ padding:'0 18px 24px', display:'flex', flexDirection:'column', gap:8 }}>
        {other.map(d => <DisruptionRow key={d.id} d={d} />)}
      </div>
    </AppShell>
  );
}

function DisruptionExpanded({ d }) {
  const sevColor = d.severity === 'high' ? 'var(--late)' : d.severity === 'med' ? 'var(--warn)' : 'var(--fg-mute)';
  const sevBg    = d.severity === 'high' ? 'var(--late-bg)' : d.severity === 'med' ? 'var(--warn-bg)' : 'var(--surface-3)';
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--line)',
      borderLeft:`3px solid ${sevColor}`, borderRadius:'var(--r-md)',
      overflow:'hidden',
    }}>
      <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{
            padding:'2px 7px', borderRadius:'var(--r-sm)', background:sevBg, color:sevColor,
            fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em',
          }}>
            {d.severity === 'high' ? 'Ernstig' : d.severity === 'med' ? 'Hinder' : 'Info'}
          </span>
          <ModalityGlyph mode={d.modality} size={14} />
          <span style={{ fontSize:12, color:'var(--fg-dim)' }}>{d.area}</span>
          <span style={{ flex:1 }} />
          <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>tot {d.until}</span>
        </div>
        <div style={{ fontSize:14, fontWeight:600 }}>{d.title}</div>
        <div style={{ fontSize:12, color:'var(--fg-dim)', lineHeight:1.45 }}>{d.body}</div>
      </div>
      {d.routes.length > 0 && (
        <div style={{
          padding:'10px 14px', background:'var(--surface-2)', borderTop:'1px solid var(--line)',
          display:'flex', flexDirection:'column', gap:6,
        }}>
          <span className="label" style={{ fontSize:9 }}>Raakt jouw reizen</span>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {d.routes.map(r => (
              <span key={r} style={{
                padding:'4px 8px', background:'var(--surface)', border:'1px solid var(--line)',
                borderRadius:'var(--r-sm)', fontSize:11, fontWeight:500,
              }}>{r}</span>
            ))}
          </div>
          <button style={{
            marginTop:4, background:'var(--signal)', color:'#0a0d12', border:0,
            borderRadius:'var(--r-md)', padding:'8px 12px', fontSize:12, fontWeight:700,
            cursor:'pointer', alignSelf:'flex-start',
          }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
              <Icon name="sparkle" size={12} color="#0a0d12" />
              Toon alternatieve reis
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

window.ScreenSettings = ScreenSettings;
window.ScreenAbonnement = ScreenAbonnement;
window.ScreenDisruptions = ScreenDisruptions;
