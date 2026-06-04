// Reiziger mobile — Planning flow.
// ScreenPlan         — main search form (from/to addresses, date+time, kortingen).
// ScreenDateTime     — pretty arrive/depart picker with day strip + time wheel.
// ScreenAddressPick  — address-or-station picker with favorites + recent.

// ─────────────────────────────────────────────────────────────
// SCREEN 2 — Plan a reis
// ─────────────────────────────────────────────────────────────
function ScreenPlan({ theme = 'dark' }) {
  const data = window.REIZIGER_DATA;
  const u = data.user;
  return (
    <AppShell theme={theme} tab="plan" scrollKey="plan">
      {/* Title */}
      <div style={{ padding:'14px 18px 0' }}>
        <h2 style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:0 }}>Plan een reis</h2>
      </div>

      {/* Stacked from/to "stops" card */}
      <div style={{ padding:'14px 18px 0' }}>
        <FromToCard
          from={{ label:'Huis', detail:'Burgwal 12, Den Haag', icon:'home' }}
          to=  {{ label:'Werk', detail:'Hoog Catharijne 8, Utrecht', icon:'work' }}
        />
      </div>

      {/* Date / time picker chips */}
      <Eyebrow>Wanneer</Eyebrow>
      <div style={{ padding:'0 18px' }}>
        <WhenCard when={data.query.when} />
      </div>

      {/* Reizigers / kortingen */}
      <Eyebrow right={<span style={{ fontSize:12, color:'var(--signal)', fontWeight:600 }}>Bewerk</span>}>
        Kortingen
      </Eyebrow>
      <div style={{ padding:'0 18px', display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
        {u.discounts.filter(d => d.on).map(d => (
          <span key={d.id} style={{
            padding:'8px 12px', background:'var(--signal-bg)', border:'1px solid var(--signal-line)',
            color:'var(--signal)', fontSize:12, fontWeight:600, borderRadius:'var(--r-md)',
            whiteSpace:'nowrap',
          }}>{d.name}</span>
        ))}
        <span style={{
          padding:'8px 12px', background:'var(--surface)', border:'1px dashed var(--line)',
          color:'var(--fg-dim)', fontSize:12, fontWeight:500, borderRadius:'var(--r-md)',
          whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:4,
        }}>
          <Icon name="plus" size={12} color="var(--fg-dim)" /> Voeg toe
        </span>
      </div>

      {/* Loop / fiets snelheid */}
      <Eyebrow right={<span style={{ fontSize:12, color:'var(--fg-mute)' }}>standaard 4,5</span>}>
        Loop- en fiets-snelheid
      </Eyebrow>
      <div style={{ padding:'0 18px', display:'flex', gap:8 }}>
        <SpeedPill icon="foot" label="Loop" value={`${u.walkSpeed} km/u`} delta="+0,3" />
        <SpeedPill icon="bike" label="Fiets" value={`${u.bikeSpeed} km/u`} delta="+1" />
      </div>

      {/* Suggestion bar — agenda */}
      <div style={{ padding:'14px 18px 0' }}>
        <div style={{
          background:'var(--surface)', border:'1px solid var(--line)',
          borderLeft:'2px solid var(--signal)', borderRadius:'var(--r-md)',
          padding:'10px 14px', display:'flex', alignItems:'center', gap:10,
        }}>
          <Icon name="cal" size={18} color="var(--signal)" />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600 }}>Plan via je agenda</div>
            <div style={{ fontSize:11, color:'var(--fg-dim)' }}>Volgende: Standup · 09:30 · Hoog Catharijne</div>
          </div>
          <Icon name="chev" size={16} color="var(--fg-dim)" />
        </div>
      </div>

      {/* Plan button */}
      <div style={{ padding:'18px 18px 12px' }}>
        <SignalBtn full>Plan reis →</SignalBtn>
      </div>

      {/* Recent */}
      <Eyebrow right={<span style={{ fontSize:12, color:'var(--signal)' }}>Alles</span>}>Recent</Eyebrow>
      <div style={{ padding:'0 18px 24px', display:'flex', flexDirection:'column' }}>
        {data.history.slice(0, 4).map((h, i) => (
          <div key={h.id} style={{
            display:'flex', alignItems:'center', gap:12, padding:'10px 0',
            borderBottom: i < 3 ? '1px solid var(--line)' : 0,
          }}>
            <Icon name="clock" size={16} color="var(--fg-mute)" />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500 }}>
                {h.from} <span style={{ color:'var(--fg-mute)' }}>→</span> {h.to}
              </div>
              <div className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>{h.when} · {h.dur}</div>
            </div>
            <Icon name="chev" size={14} color="var(--fg-mute)" />
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function FromToCard({ from, to }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--line)',
      borderRadius:'var(--r-lg)', overflow:'hidden', position:'relative',
    }}>
      <FromToRow {...from} kind="van" />
      <div style={{ height:1, background:'var(--line)' }} />
      <FromToRow {...to} kind="naar" />
      <button style={{
        position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
        width:38, height:38, borderRadius:19,
        background:'var(--surface-3)', border:'1px solid var(--line)',
        color:'var(--fg)', display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer',
      }}>
        <Icon name="swap" size={16} />
      </button>
    </div>
  );
}

function FromToRow({ label, detail, icon, kind }) {
  return (
    <div style={{ padding:'12px 50px 12px 14px', display:'flex', alignItems:'center', gap:12 }}>
      <span style={{
        width:32, height:32, borderRadius:8,
        background: kind === 'van' ? 'var(--signal-bg)' : 'var(--surface-3)',
        border: kind === 'van' ? '1px solid var(--signal-line)' : '1px solid var(--line)',
        display:'flex', alignItems:'center', justifyContent:'center',
        color: kind === 'van' ? 'var(--signal)' : 'var(--fg-dim)',
        flex:'none',
      }}>
        <Icon name={icon} size={16} color="currentColor" />
      </span>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="label" style={{ fontSize:10, color:'var(--fg-mute)' }}>{kind === 'van' ? 'Van' : 'Naar'}</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
          <span style={{ fontSize:15, fontWeight:600 }}>{label}</span>
          <span style={{ fontSize:12, color:'var(--fg-dim)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>· {detail}</span>
        </div>
      </div>
    </div>
  );
}

function WhenCard({ when }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--line)',
      borderRadius:'var(--r-lg)', overflow:'hidden',
    }}>
      {/* Mode toggle */}
      <div style={{ display:'flex', padding:6, gap:6, background:'var(--surface-2)', borderBottom:'1px solid var(--line)' }}>
        {[
          ['leave', 'Vertrek'],
          ['arrive', 'Aankomst'],
          ['now', 'Nu'],
        ].map(([id, lbl]) => {
          const on = when.mode === id || (id === 'arrive' && when.mode === 'arrive');
          return (
            <span key={id} style={{
              flex:1, textAlign:'center', padding:'8px 0',
              borderRadius:'var(--r-sm)',
              background: on ? 'var(--surface-4)' : 'transparent',
              color: on ? 'var(--fg)' : 'var(--fg-dim)',
              fontSize:12, fontWeight:600,
              border: on ? '1px solid var(--line)' : '1px solid transparent',
            }}>{lbl}</span>
          );
        })}
      </div>
      {/* Two big cells */}
      <div style={{ display:'flex' }}>
        <div style={{ flex:1, padding:'12px 14px', borderRight:'1px solid var(--line)' }}>
          <div className="label" style={{ fontSize:10 }}>Datum</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
            <Icon name="cal" size={16} color="var(--fg-dim)" />
            <span style={{ fontSize:16, fontWeight:600 }}>{when.date}</span>
          </div>
        </div>
        <div style={{ flex:1, padding:'12px 14px' }}>
          <div className="label" style={{ fontSize:10 }}>Tijd</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
            <Icon name="clock" size={16} color="var(--fg-dim)" />
            <span className="mono" style={{ fontSize:18, fontWeight:600 }}>{when.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpeedPill({ icon, label, value, delta }) {
  return (
    <div style={{
      flex:1, background:'var(--surface)', border:'1px solid var(--line)',
      borderRadius:'var(--r-md)', padding:'10px 12px',
      display:'flex', alignItems:'center', gap:10,
    }}>
      <span style={{
        width:32, height:32, borderRadius:8, background:'var(--surface-3)',
        display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fg-dim)',
      }}>
        <Icon name={icon} size={18} />
      </span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, color:'var(--fg-dim)' }}>{label}</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
          <span className="mono" style={{ fontSize:13, fontWeight:600 }}>{value}</span>
          <span className="mono" style={{ fontSize:10, color:'var(--signal)' }}>{delta}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 3 — Pretty date+time picker overlay
// ─────────────────────────────────────────────────────────────
function ScreenDateTime({ theme = 'dark' }) {
  const data = window.REIZIGER_DATA;
  return (
    <AppShell theme={theme} tab="plan" scrollKey="dt">
      <div style={{ padding:'14px 18px 0' }}>
        <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em', margin:0 }}>Vertrek of aankomst</h2>
        <div style={{ color:'var(--fg-dim)', fontSize:13, marginTop:4 }}>Kies tijd waarop je weg gaat of er moet zijn.</div>
      </div>

      {/* Big toggle: vertrek / aankomst */}
      <div style={{ padding:'14px 18px 0' }}>
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:8,
        }}>
          {[
            ['leave', 'Vertrek', 'om of na'],
            ['arrive', 'Aankomst', 'uiterlijk', true],
          ].map(([id, lbl, sub, on]) => (
            <button key={id} style={{
              padding:'12px 14px', textAlign:'left',
              background: on ? 'var(--signal-bg)' : 'var(--surface)',
              border:'1px solid ' + (on ? 'var(--signal-line)' : 'var(--line)'),
              borderRadius:'var(--r-md)', cursor:'pointer',
              boxShadow: on ? 'var(--glow-signal)' : 'none',
            }}>
              <div style={{ fontSize:14, fontWeight:700, color: on ? 'var(--signal)' : 'var(--fg)' }}>{lbl}</div>
              <div style={{ fontSize:11, color:'var(--fg-dim)', marginTop:2 }}>{sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Day strip */}
      <Eyebrow right={<span style={{ fontSize:12, color:'var(--signal)', display:'flex', alignItems:'center', gap:4 }}>
        Alle maanden <Icon name="chev" size={12} color="var(--signal)" /></span>}>Dag</Eyebrow>
      <div style={{ padding:'0 18px', display:'flex', gap:6, overflowX:'auto' }}>
        {data.dateStrip.map((d, i) => {
          const on = i === 2;
          return (
            <div key={d.n} style={{
              flex:'none', width:54, padding:'10px 0',
              background: on ? 'var(--signal-bg)' : 'var(--surface)',
              border:'1px solid ' + (on ? 'var(--signal-line)' : 'var(--line)'),
              borderRadius:'var(--r-md)', textAlign:'center',
              display:'flex', flexDirection:'column', gap:2,
            }}>
              <span className="label" style={{ fontSize:10, color: on ? 'var(--signal)' : 'var(--fg-mute)' }}>{d.d}</span>
              <span className="mono" style={{ fontSize:18, fontWeight:600, color: on ? 'var(--signal)' : 'var(--fg)' }}>{d.n}</span>
              {d.tag && <span style={{ fontSize:9, color: on ? 'var(--signal)' : 'var(--fg-mute)', fontWeight:600 }}>{d.tag}</span>}
            </div>
          );
        })}
      </div>

      {/* Time wheel — 3 columns: hour, minute, +ampm/quick */}
      <Eyebrow>Tijd</Eyebrow>
      <div style={{ padding:'0 18px' }}>
        <TimeWheel />
      </div>

      {/* Quick chips */}
      <div style={{ padding:'14px 18px 0', display:'flex', gap:8, flexWrap:'wrap' }}>
        {['Nu', '+ 15 m', '+ 30 m', '+ 1 u', 'Spits 17:30', 'Avond 22:00'].map((s, i) => (
          <span key={s} style={{
            padding:'6px 10px', background: i === 0 ? 'var(--surface-3)' : 'var(--surface)',
            border:'1px solid var(--line)', borderRadius:'var(--r-sm)',
            fontSize:12, color: i === 0 ? 'var(--fg)' : 'var(--fg-dim)', fontWeight:500,
          }}>{s}</span>
        ))}
      </div>

      {/* Sync to calendar */}
      <Eyebrow>Tijd uit agenda</Eyebrow>
      <div style={{ padding:'0 18px 24px' }}>
        <div style={{
          background:'var(--surface)', border:'1px solid var(--line)',
          borderRadius:'var(--r-md)', padding:'12px 14px',
          display:'flex', alignItems:'center', gap:12,
        }}>
          <span style={{
            width:36, height:36, borderRadius:8, background:'var(--surface-3)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Icon name="google" size={20} />
          </span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600 }}>Standup · 09:30</div>
            <div style={{ fontSize:11, color:'var(--fg-dim)' }}>Plan zo dat je er 5 min eerder bent</div>
          </div>
          <SignalBtn style={{ padding:'8px 12px', fontSize:12 }}>Kies</SignalBtn>
        </div>
      </div>

      {/* Confirm bar */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:78, padding:'10px 18px',
        background:'color-mix(in srgb, var(--bg) 92%, transparent)',
        backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
        borderTop:'1px solid var(--line)',
        display:'flex', alignItems:'center', gap:10,
      }}>
        <div style={{ flex:1 }}>
          <div className="label" style={{ fontSize:10 }}>Aankomst uiterlijk</div>
          <div className="mono" style={{ fontSize:15, fontWeight:600 }}>vr 28 mei · 18:00</div>
        </div>
        <SignalBtn style={{ padding:'12px 18px', fontSize:14 }}>Bevestig</SignalBtn>
      </div>
    </AppShell>
  );
}

function TimeWheel() {
  // Highlight row sits in the middle; surrounding rows fade.
  const hours = ['16','17','18','19','20'];
  const mins  = ['00','15','30','45','00'];
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--line)',
      borderRadius:'var(--r-lg)', overflow:'hidden', position:'relative',
    }}>
      <div style={{ display:'flex' }}>
        <WheelCol values={hours} center={2} />
        <span style={{
          alignSelf:'center', padding:'0 4px', color:'var(--fg-mute)',
          fontFamily:'var(--font-mono)', fontSize:24,
        }}>:</span>
        <WheelCol values={mins} center={2} />
      </div>
      {/* Center selection band */}
      <div style={{
        position:'absolute', left:8, right:8, top:'50%', height:44,
        transform:'translateY(-50%)',
        background:'var(--signal-bg)', border:'1px solid var(--signal-line)',
        borderRadius:'var(--r-sm)', pointerEvents:'none',
      }} />
    </div>
  );
}

function WheelCol({ values, center }) {
  return (
    <div style={{ flex:1, padding:'8px 0', display:'flex', flexDirection:'column' }}>
      {values.map((v, i) => {
        const dist = Math.abs(i - center);
        const opacity = 1 - dist * 0.32;
        return (
          <div key={i} style={{
            height:36, display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-mono)', fontVariantNumeric:'tabular-nums',
            fontSize: i === center ? 26 : 20,
            fontWeight: i === center ? 600 : 400,
            color: i === center ? 'var(--signal)' : 'var(--fg)',
            opacity,
          }}>{v}</div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 4 — Address / station picker
// ─────────────────────────────────────────────────────────────
function ScreenAddressPick({ theme = 'dark' }) {
  const data = window.REIZIGER_DATA;
  const homeFavs    = data.addresses.filter(a => a.kind === 'home' || a.kind === 'work');
  const otherFavs   = data.addresses.filter(a => a.kind === 'fav');
  const stations    = data.addresses.filter(a => a.kind === 'station');
  return (
    <AppShell theme={theme} noTab scrollKey="addr"
      back={true}
      title={null}
      action={<button style={{ background:'transparent', border:0, color:'var(--signal)', fontWeight:600, fontSize:14, cursor:'pointer' }}>Klaar</button>}>
      <div style={{ padding:'8px 18px 0' }}>
        <div className="label">Naar</div>
        <div style={{
          background:'var(--surface)', border:'1px solid var(--signal-line)',
          borderRadius:'var(--r-md)', padding:'10px 14px', marginTop:6,
          boxShadow:'var(--glow-signal)',
          display:'flex', alignItems:'center', gap:10,
        }}>
          <Icon name="pin" size={16} color="var(--signal)" />
          <span style={{ fontSize:15 }}>Hoog Catharij<span style={{ borderLeft:'1.5px solid var(--signal)', marginLeft:1 }} />‎</span>
          <span style={{ flex:1 }} />
          <span className="mono" style={{ fontSize:11, color:'var(--fg-mute)' }}>11 resultaten</span>
        </div>
      </div>

      {/* Adres / station toggle */}
      <div style={{ padding:'12px 18px 0', display:'flex', gap:6 }}>
        {['Alles', 'Adressen', 'Stations & haltes', 'Op kaart'].map((s, i) => (
          <span key={s} style={{
            padding:'6px 10px', borderRadius:'var(--r-sm)',
            background: i === 0 ? 'var(--surface-4)' : 'var(--surface)',
            border:'1px solid var(--line)',
            fontSize:12, fontWeight:600, color: i === 0 ? 'var(--fg)' : 'var(--fg-dim)',
            whiteSpace:'nowrap',
          }}>{s}</span>
        ))}
      </div>

      {/* Pinned addresses */}
      <Eyebrow>Vast</Eyebrow>
      <div style={{ padding:'0 18px', display:'flex', flexDirection:'column' }}>
        {homeFavs.map((a, i) => <AddressRow key={a.id} a={a} last={i === homeFavs.length - 1} />)}
      </div>

      <Eyebrow right={<span style={{ fontSize:12, color:'var(--signal)' }}>+ nieuw</span>}>Favorieten</Eyebrow>
      <div style={{ padding:'0 18px', display:'flex', flexDirection:'column' }}>
        {otherFavs.map((a, i) => <AddressRow key={a.id} a={a} last={i === otherFavs.length - 1} />)}
      </div>

      <Eyebrow>Suggesties — stations & haltes</Eyebrow>
      <div style={{ padding:'0 18px 24px', display:'flex', flexDirection:'column' }}>
        {stations.map((a, i) => <AddressRow key={a.id} a={a} last={i === stations.length - 1} subtle />)}
      </div>
    </AppShell>
  );
}

function AddressRow({ a, last, subtle }) {
  const iconName = a.kind === 'home' ? 'home' : a.kind === 'work' ? 'work' : a.kind === 'station' ? 'pin' : 'star';
  const iconColor = subtle ? 'var(--fg-dim)' : 'var(--signal)';
  const iconBg = subtle ? 'var(--surface-3)' : 'var(--signal-bg)';
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'10px 0',
      borderBottom: last ? 0 : '1px solid var(--line)',
    }}>
      <span style={{
        width:36, height:36, borderRadius:8, background:iconBg,
        border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center',
        color:iconColor, flex:'none',
      }}>
        <Icon name={iconName} size={16} color="currentColor" />
      </span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:600 }}>{a.label}</div>
        <div style={{ fontSize:11, color:'var(--fg-dim)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.detail}</div>
      </div>
      <Icon name="chev" size={14} color="var(--fg-mute)" />
    </div>
  );
}

window.ScreenPlan = ScreenPlan;
window.ScreenDateTime = ScreenDateTime;
window.ScreenAddressPick = ScreenAddressPick;
