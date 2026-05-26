import { describe, it, expect } from 'vitest';
import { rulesToTransferRows, mergeTransfersTxt } from '../src/compile/transfers';
import type { TransferRule } from '../src/rules/types';

const rule = (over: Partial<TransferRule> = {}): TransferRule => ({
  id: 1,
  label: 'test rule',
  fromStopIds: ['A'],
  toStopIds: ['B'],
  fromRouteId: null,
  toRouteId: null,
  minBufferSec: 900,
  enabled: true,
  ...over,
});

describe('rulesToTransferRows', () => {
  it('creates a transfer_type=2 row carrying the buffer in seconds', () => {
    expect(rulesToTransferRows([rule()])).toEqual([
      {
        from_stop_id: 'A',
        to_stop_id: 'B',
        from_route_id: '',
        to_route_id: '',
        transfer_type: '2',
        min_transfer_time: '900',
      },
    ]);
  });

  it('expands the cartesian product of stop sets', () => {
    const rows = rulesToTransferRows([
      rule({ fromStopIds: ['A1', 'A2'], toStopIds: ['B1', 'B2'] }),
    ]);
    expect(rows).toHaveLength(4);
    expect(rows.map((r) => `${r.from_stop_id}->${r.to_stop_id}`)).toEqual([
      'A1->B1',
      'A1->B2',
      'A2->B1',
      'A2->B2',
    ]);
  });

  it('carries route ids when the rule narrows by route', () => {
    const [row] = rulesToTransferRows([rule({ fromRouteId: 'IC', toRouteId: 'BUS28' })]);
    expect(row.from_route_id).toBe('IC');
    expect(row.to_route_id).toBe('BUS28');
  });

  it('skips disabled rules and non-positive buffers', () => {
    expect(rulesToTransferRows([rule({ enabled: false })])).toHaveLength(0);
    expect(rulesToTransferRows([rule({ minBufferSec: 0 })])).toHaveLength(0);
    expect(rulesToTransferRows([rule({ minBufferSec: -5 })])).toHaveLength(0);
  });
});

describe('mergeTransfersTxt', () => {
  it('writes a header + rows when the feed has no transfers.txt', () => {
    const out = mergeTransfersTxt('', rulesToTransferRows([rule()]));
    expect(out.split(/\r?\n/)[0]).toBe(
      'from_stop_id,to_stop_id,from_route_id,to_route_id,transfer_type,min_transfer_time',
    );
    expect(out).toMatch(/^A,B,,,2,900$/m);
  });

  it('overrides an existing row for the same stop/route key without duplicating', () => {
    const original =
      'from_stop_id,to_stop_id,transfer_type,min_transfer_time\n' +
      'A,B,2,120\n' +
      'C,D,0,\n';
    const out = mergeTransfersTxt(original, rulesToTransferRows([rule({ minBufferSec: 900 })]));
    const lines = out.trim().split(/\r?\n/);
    expect(lines).toHaveLength(3); // header + kept C,D + overridden A,B
    expect(out).not.toMatch(/A,B,2,120/); // stale 120s buffer gone
    expect(out).toMatch(/(^|,)900(,|$)/m); // new 900s buffer present
    expect(out).toMatch(/^C,D/m); // unrelated transfer untouched
  });

  it('preserves extra columns the feed already uses (e.g. from_trip_id)', () => {
    const original =
      'from_stop_id,to_stop_id,from_route_id,to_route_id,from_trip_id,transfer_type,min_transfer_time\n' +
      'X,Y,,,TRIP1,2,60\n';
    const out = mergeTransfersTxt(original, rulesToTransferRows([rule()]));
    expect(out.split(/\r?\n/)[0]).toContain('from_trip_id');
    expect(out).toMatch(/^A,B,,,,2,900$/m); // empty from_trip_id slot preserved
  });

  it('keeps a route-specific feed transfer when our rule is route-agnostic', () => {
    const original =
      'from_stop_id,to_stop_id,from_route_id,to_route_id,transfer_type,min_transfer_time\n' +
      'A,B,IC,BUS28,2,120\n';
    const out = mergeTransfersTxt(original, rulesToTransferRows([rule()])); // null routes
    const lines = out.trim().split(/\r?\n/);
    // different key (routes set vs blank) -> both rows survive
    expect(lines).toHaveLength(3);
  });
});
