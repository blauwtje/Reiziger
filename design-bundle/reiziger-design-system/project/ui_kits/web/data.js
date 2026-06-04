// Reiziger — sample data for the mobile UI kit.
// Times are strings (mono-friendly). Dutch language, NS naming.

window.REIZIGER_DATA = {
  user: {
    name: 'Sam',
    home: { label: 'Huis', addr: 'Burgwal 12, Den Haag', kind: 'home' },
    work: { label: 'Werk', addr: 'Hoog Catharijne 8, Utrecht', kind: 'work' },
    walkSpeed: 4.8,   // km/u, default 4.5
    bikeSpeed: 17,    // km/u, default 16
    minTransfer: 6,   // minutes — global floor
    perStopTransfer: { 'Utrecht Centraal': 8, 'Gouda': 6 },
    discounts: [
      { id: 'dal',     name: 'Dal Voordeel',       on: true,  desc: 'Buiten de spits 40% korting' },
      { id: 'weekend', name: 'Weekend Vrij',       on: false, desc: 'Vrij reizen za + zo' },
      { id: 'flex',    name: 'NS-Flex',            on: true,  desc: 'Maandelijks achteraf betalen' },
      { id: 'samen',   name: 'Samen op pad',       on: false, desc: '40% korting voor reisgenoot' },
      { id: 'student', name: 'Studenten OV',       on: false, desc: 'Week- of weekendabonnement' },
    ],
    calendars: [
      { id: 'google', name: 'Google Agenda', on: true,  email: 'sam@gmail.com' },
      { id: 'apple',  name: 'Apple Agenda',  on: false, email: '' },
    ],
    theme: 'system',  // light · dark · system
  },

  addresses: [
    { id: 'home',  label: 'Huis',           detail: 'Burgwal 12, Den Haag',               kind: 'home',    icon: '⌂' },
    { id: 'work',  label: 'Werk',           detail: 'Hoog Catharijne 8, Utrecht',         kind: 'work',    icon: '◧' },
    { id: 'gym',   label: 'Sportschool',    detail: 'Westeinde 41, Den Haag',             kind: 'fav',     icon: '★' },
    { id: 'mom',   label: 'Mam',            detail: 'Bloemenlaan 6, Zwolle',              kind: 'fav',     icon: '♥' },
    { id: 'cs',    label: 'Den Haag Centraal', detail: 'Station',                         kind: 'station', icon: '◇' },
    { id: 'utc',   label: 'Utrecht Centraal',  detail: 'Station',                         kind: 'station', icon: '◇' },
  ],

  query: {
    from: 'Burgwal 12, Den Haag',
    fromKind: 'address',
    to: 'Hoog Catharijne 8, Utrecht',
    toKind: 'address',
    when: { mode: 'arrive', date: 'vr 28 mei', time: '18:00', label: 'Aankomst' },
  },

  // Live disruptions — flag if they affect this user's saved routes.
  disruptions: [
    {
      id: 'd1', severity: 'high', affectsYou: true,
      area: 'Utrecht — Amersfoort',
      title: 'Werkzaamheden Utrecht — Amersfoort',
      body: 'Heel de dag minder treinen, +8 tot +15 min reistijd.',
      until: 'vandaag 23:59',
      modality: 'rail',
      routes: ['Werk → thuis'],
    },
    {
      id: 'd2', severity: 'med', affectsYou: true,
      area: 'Lijn 12 — Den Haag',
      title: 'Lijn 12 omleiding via Spui',
      body: 'Tram 12 rijdt niet langs Spui-zijde. Stap eerder uit bij Centraal.',
      until: 'do 27 mei 04:00',
      modality: 'tram',
      routes: ['Werk → thuis (laatste km)'],
    },
    {
      id: 'd3', severity: 'low', affectsYou: false,
      area: 'Amsterdam Zuid',
      title: 'Lift perron 4 buiten dienst',
      body: 'Gebruik alternatief perron 3.',
      until: 'di 8 jun',
      modality: 'rail',
      routes: [],
    },
  ],

  // Trips the user actually takes weekly — surfaced on Today.
  regularTrips: [
    {
      id: 't-work', label: 'Werk → thuis', dow: 'ma–vr',
      from: 'Hoog Catharijne 8, Utrecht', to: 'Burgwal 12, Den Haag',
      typical: { dep: '17:34', arr: '18:46', dur: '1u 12m', price: '€ 11,80' },
      disrupted: true, disruptionId: 'd1',
      alt: { dep: '17:20', arr: '18:42', dur: '1u 22m', delta: '+10m', why: 'omleiding via Gouda; geen Amersfoort-knelpunt' },
    },
    {
      id: 't-gym', label: 'Sportschool', dow: 'di · do',
      from: 'Burgwal 12, Den Haag', to: 'Westeinde 41, Den Haag',
      typical: { dep: '19:10', arr: '19:24', dur: '14m', price: '€ 2,40' },
      disrupted: false,
    },
    {
      id: 't-mom', label: 'Mam', dow: 'zondags',
      from: 'Burgwal 12, Den Haag', to: 'Bloemenlaan 6, Zwolle',
      typical: { dep: '11:08', arr: '13:34', dur: '2u 26m', price: '€ 22,10' },
      disrupted: false,
    },
  ],

  // Smart suggestion the planner surfaces because of historical lateness.
  smartSuggestion: {
    trigger: 'IC 3041 Den Haag → Utrecht is dit jaar 73% vd ritten +5 min of meer vertraagd.',
    stop: 'Utrecht Centraal',
    proposed: 'Neem +8 min overstaptijd in Utrecht in plaats van 6 min — voorkomt de gemiste Sprinter.',
    saved: '12% meer kans op op-tijd aankomst',
  },

  // Today's auto-suggested trip — based on weekly pattern.
  todaySuggestion: {
    pattern: 'Elke werkdag · ca. 18:00 thuis',
    from: 'Hoog Catharijne 8, Utrecht', to: 'Burgwal 12, Den Haag',
    dep: '17:34', arr: '18:46', dur: '1u 12m',
    walk: '7 min naar perron · 4 min thuis',
    platforms: ['12', '7a'],
    price: '€ 7,08', basePrice: '€ 11,80', usedDiscount: 'Dal Voordeel',
    transfers: 1, transferAt: 'Utrecht C.',
    status: 'warn', delay: 4, disruption: true,
  },

  // Results — listing for the active query, with kortingen applied.
  journeys: [
    {
      id: 'j1', recommended: true, dep: '16:42', arr: '17:58', dur: '1u 16m',
      transfers: 1, transferAt: 'Utrecht C.',
      platforms: { dep: '7a', arr: '12' },
      price: '€ 7,08', basePrice: '€ 11,80',
      status: 'ok', delay: 0,
      modes: ['rail', 'walk', 'rail'],
      bullet: 'Dal Voordeel',
      smartNote: 'Extra overstaptijd in Utrecht ingerekend',
    },
    {
      id: 'j2', dep: '17:14', arr: '18:18', dur: '1u 04m',
      transfers: 0, transferAt: 'direct',
      platforms: { dep: '5', arr: '8' },
      price: '€ 7,08', basePrice: '€ 11,80',
      status: 'warn', delay: 4,
      modes: ['rail'],
      bullet: 'Dal Voordeel',
    },
    {
      id: 'j3', dep: '17:34', arr: '18:46', dur: '1u 12m',
      transfers: 1, transferAt: 'Utrecht C.',
      platforms: { dep: '7a', arr: '12' },
      price: '€ 7,08', basePrice: '€ 11,80',
      status: 'late', delay: 12,
      modes: ['rail', 'walk', 'rail'],
      bullet: 'Verstoring',
      disrupted: true,
    },
    {
      id: 'j4', dep: '17:48', arr: '19:14', dur: '1u 26m',
      transfers: 2, transferAt: 'Gouda · Woerden',
      platforms: { dep: '4a', arr: '8' },
      price: '€ 7,68', basePrice: '€ 12,80',
      status: 'ok', delay: 0,
      modes: ['rail', 'rail', 'bus'],
      bullet: 'Dal Voordeel',
    },
  ],

  // Active journey detail — j1.
  journeyDetail: {
    id: 'j1',
    from: 'Burgwal 12, Den Haag', to: 'Hoog Catharijne 8, Utrecht',
    dep: '16:42', arr: '17:58', dur: '1u 16m',
    transfers: 1, transferAt: 'Utrecht C.',
    price: '€ 7,08', basePrice: '€ 11,80', discount: 'Dal Voordeel · -40%',
    co2: '1,8 kg',
    steps: [
      { kind: 'walk', from: 'Burgwal 12',           to: 'Den Haag Centraal',  dur: '8m',  detail: '650 m · loop' },
      { kind: 'rail', code: 'IC 3041',              from: 'Den Haag Centraal', to: 'Utrecht Centraal',
        dep: '16:42', arr: '17:14', platformDep: '7a', platformArr: '12', delay: 0,
        seats: 'Vrij zicht · 2e klas' },
      { kind: 'xfer', stop: 'Utrecht Centraal',     dur: '6m',  perronWalk: 'Spoor 12 → 11', note: 'Smart: +2 min t.o.v. standaard' },
      { kind: 'rail', code: 'Spr 7752',             from: 'Utrecht Centraal', to: 'Utrecht Vaartsche Rijn',
        dep: '17:20', arr: '17:26', platformDep: '11', platformArr: '2', delay: 0 },
      { kind: 'walk', from: 'Vaartsche Rijn',       to: 'Hoog Catharijne 8', dur: '4m', detail: '320 m · loop' },
    ],
    disruption: { active: true, body: 'Werkzaamheden Utrecht — Amersfoort. Geen invloed op deze reis.' },
  },

  // Abonnement-suggestion based on travel data.
  subscription: {
    monthSpend: '€ 178,40',
    trips: 23,
    period: 'mei 2026',
    current: { name: 'Geen abonnement',   price: '€ 178,40', net: '€ 178,40' },
    options: [
      { id: 'dv',     name: 'Dal Voordeel',     fee: '€ 5,60 / mnd',  net: '€ 112,40', save: '€ 66,00', best: true,  why: 'Je reist 18 vd 23 ritten buiten de spits.' },
      { id: 'altijd', name: 'Altijd Voordeel',  fee: '€ 27,90 / mnd', net: '€ 142,10', save: '€ 36,30', best: false, why: 'Werkt ook in de spits, maar je spitsritten zijn beperkt.' },
      { id: 'traj',   name: 'Traject Vrij DH–UTC', fee: '€ 312,00 / mnd', net: '€ 312,00', save: '–', best: false, why: 'Pas voordelig vanaf ~26 retours; jij doet er 11.' },
    ],
  },

  // Recent / historical trips.
  history: [
    { id: 'h1', when: 'gisteren · 17:34', from: 'Utrecht C.', to: 'Den Haag C.', dur: '54m', delay: 0, price: '€ 7,08' },
    { id: 'h2', when: 'di 25 mei · 08:14', from: 'Den Haag C.', to: 'Utrecht C.', dur: '52m', delay: 6, price: '€ 11,80' },
    { id: 'h3', when: 'ma 24 mei · 17:42', from: 'Utrecht C.', to: 'Den Haag C.', dur: '1u 02m', delay: 0, price: '€ 7,08' },
    { id: 'h4', when: 'zo 23 mei · 11:08', from: 'Den Haag C.', to: 'Zwolle',     dur: '2u 26m', delay: 0, price: '€ 22,10' },
  ],

  // Mini calendar — for date picker strip.
  dateStrip: [
    { d: 'wo', n: '26', tag: 'Vandaag' },
    { d: 'do', n: '27', tag: 'Morgen' },
    { d: 'vr', n: '28' },
    { d: 'za', n: '29' },
    { d: 'zo', n: '30' },
    { d: 'ma', n: '31' },
    { d: 'di', n: '01' },
  ],
};
