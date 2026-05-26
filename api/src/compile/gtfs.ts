import { promises as fs } from 'node:fs';
import path from 'node:path';
import { config } from '../config';
import { listRules } from '../rules/store';
import { rulesToTransferRows, mergeTransfersTxt } from './transfers';

/**
 * Regenerate the GTFS feed's transfers.txt from the pristine original plus the
 * current custom rules, writing it into the unzipped GTFS directory OTP builds
 * from. Idempotent: always merges from the pristine baseline, never compounds.
 *
 * A graph rebuild is required afterwards for OTP to pick up the new transfers.
 */
export async function compileTransfers(): Promise<{ rows: number; bytes: number; target: string }> {
  const original = await readOriginalTransfers();
  const rules = await listRules();
  // OTP exposes feed-prefixed ids ("ovapi:123") but transfers.txt uses raw ids ("123").
  // Strip the feed prefix here so rows match the feed's own rows (and override correctly).
  const feedPrefix = `${config.feedId}:`;
  const strip = (v: string) => (v.startsWith(feedPrefix) ? v.slice(feedPrefix.length) : v);
  const rows = rulesToTransferRows(rules).map((r) => ({
    ...r,
    from_stop_id: strip(r.from_stop_id),
    to_stop_id: strip(r.to_stop_id),
    from_route_id: strip(r.from_route_id),
    to_route_id: strip(r.to_route_id),
  }));
  const merged = mergeTransfersTxt(original, rows);

  const target = path.join(config.gtfsDir, 'transfers.txt');
  await fs.writeFile(target, merged, 'utf8');
  return { rows: rows.length, bytes: Buffer.byteLength(merged), target };
}

async function readOriginalTransfers(): Promise<string> {
  try {
    return await fs.readFile(config.transfersOrig, 'utf8');
  } catch (e) {
    if ((e as NodeJS.ErrnoException)?.code !== 'ENOENT') throw e;
    // Fall back to whatever transfers.txt is currently in the feed dir.
    try {
      return await fs.readFile(path.join(config.gtfsDir, 'transfers.txt'), 'utf8');
    } catch {
      return '';
    }
  }
}
