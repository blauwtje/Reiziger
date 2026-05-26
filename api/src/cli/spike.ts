/**
 * Spike: prove that a custom transfers.txt buffer changes OTP routing.
 *
 *   tsx src/cli/spike.ts explore [originName] [destName] [whenISO]
 *   tsx src/cli/spike.ts run     [originName] [destName] [whenISO]
 *
 * explore: find a journey with a transfer and print it (validates the plan query).
 * run:     also add a rule demanding +30 min at that transfer, rebuild, re-plan,
 *          and report whether the tight connection is gone (PASS/FAIL).
 */
import { searchStops, planArriveBy, type ShapedItinerary, type StopHit } from '../otp/plan';
import { gql } from '../otp/client';
import { createRule } from '../rules/store';
import { compileTransfers } from '../compile/gtfs';
import { rebuildGraph } from '../otp/rebuild';

const mode = process.argv[2] ?? 'explore';
const originName = process.argv[3] ?? 'Amsterdam Centraal';
const destName = process.argv[4] ?? 'Wijk bij Duurstede';
const when = process.argv[5] ?? '2026-05-27T09:00';

const nl = (ms: number) =>
  new Date(ms).toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam', dateStyle: 'short', timeStyle: 'short' });
const transit = (it: ShapedItinerary) => it.legs.filter((l) => l.transit);

function describe(it: ShapedItinerary): void {
  console.log(
    `  depart ${nl(it.startTime)}  arrive ${nl(it.endTime)}  | ${Math.round(it.durationSec / 60)} min | ${it.transfers} transfer(s) | realtime=${it.hasRealtime}`,
  );
  for (const l of it.legs) {
    console.log(`    ${l.mode.padEnd(6)} ${(l.routeShortName ?? '-').padEnd(6)} ${l.fromName} -> ${l.toName}`);
  }
  const tl = transit(it);
  for (let i = 1; i < tl.length; i++) {
    const buf = Math.round((tl[i].startTime - tl[i - 1].endTime) / 1000 / 60);
    console.log(
      `    >> change at ${tl[i - 1].toName}: ${tl[i - 1].routeShortName} -> ${tl[i].routeShortName}, buffer ${buf} min ` +
        `(from_stop=${tl[i - 1].toStopGtfsId} to_stop=${tl[i].fromStopGtfsId})`,
    );
  }
}

async function findTransfer(): Promise<{ o: StopHit; d: StopHit; it: ShapedItinerary } | null> {
  const origins = await searchStops(originName, 8);
  const dests = await searchStops(destName, 8);
  console.log(`Scanning ${origins.length} x ${dests.length} stop pairs for a journey with a transfer...`);
  for (const o of origins) {
    for (const d of dests) {
      const its = await planArriveBy(o.gtfsId, d.gtfsId, when, 5);
      const hit = its.find((it) => transit(it).length >= 2);
      if (hit) return { o, d, it: hit };
    }
  }
  return null;
}

async function waitForOtp(maxSec = 240): Promise<boolean> {
  const start = Date.now();
  while ((Date.now() - start) / 1000 < maxSec) {
    try {
      await gql('{ feeds { feedId } }');
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return false;
}

const found = await findTransfer();
if (!found) {
  console.error(`No transfer journey found for ${originName} -> ${destName} at ${when}.`);
  process.exit(2);
}
const { o, d, it } = found;
console.log(`\nBASELINE  ${o.name} (${o.gtfsId})  ->  ${d.name} (${d.gtfsId})  arriveBy ${when}`);
describe(it);

const tl = transit(it);
// Prefer the train -> bus/tram/metro change (the user's structurally-weak link); else first transfer.
let idx = 1;
for (let i = 1; i < tl.length; i++) {
  if (tl[i - 1].mode === 'RAIL' && ['BUS', 'TRAM', 'SUBWAY'].includes(tl[i].mode)) {
    idx = i;
    break;
  }
}
const fromStop = tl[idx - 1].toStopGtfsId!;
const toStop = tl[idx].fromStopGtfsId!;
const baseBufferSec = Math.round((tl[idx].startTime - tl[idx - 1].endTime) / 1000);
console.log(
  `\nWeak transfer: ${fromStop} -> ${toStop}, current buffer ${Math.round(baseBufferSec / 60)} min`,
);

if (mode !== 'run') {
  console.log('\n[explore] plan query validated. Re-run with "run" to prove buffer enforcement.');
  process.exit(0);
}

const requiredSec = baseBufferSec + 1800;
console.log(`\n==> Adding rule: require >= ${Math.round(requiredSec / 60)} min at this transfer.`);
const rule = await createRule({
  label: `SPIKE ${o.name} -> ${d.name}`,
  fromStopIds: [fromStop],
  toStopIds: [toStop],
  fromRouteId: null,
  toRouteId: null,
  minBufferSec: requiredSec,
  enabled: true,
});
const compiled = await compileTransfers();
console.log(`Compiled ${compiled.rows} custom row(s). Rebuilding graph (a few minutes)...`);
await rebuildGraph();
console.log('Graph rebuilt; waiting for OTP...');
if (!(await waitForOtp())) {
  console.error('OTP did not come back up.');
  process.exit(3);
}

console.log('\nAFTER RULE  replanning same journey...');
const after = await planArriveBy(o.gtfsId, d.gtfsId, when, 5);
if (after[0]) describe(after[0]);

let violationMin: number | null = null;
for (const x of after) {
  const xtl = transit(x);
  for (let i = 1; i < xtl.length; i++) {
    if (xtl[i - 1].toStopGtfsId === fromStop && xtl[i].fromStopGtfsId === toStop) {
      const b = Math.round((xtl[i].startTime - xtl[i - 1].endTime) / 1000);
      if (b < requiredSec) violationMin = Math.round(b / 60);
    }
  }
}

console.log(
  '\nSPIKE VERDICT: ' +
    (violationMin == null
      ? `PASS — no itinerary uses ${fromStop} -> ${toStop} with < ${Math.round(requiredSec / 60)} min anymore.`
      : `FAIL — still found a ${violationMin} min connection at the weak pair.`),
);
console.log(`(Rule #${rule.id} left active so you can see it in the app; delete it + rebuild to revert.)`);
