import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url)); // api/src
export const API_DIR = path.resolve(here, '..'); // api
export const REPO_ROOT = path.resolve(here, '..', '..'); // repo root

export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? '127.0.0.1',

  /** Base URL of the running OTP server. */
  otpUrl: process.env.OTP_URL ?? 'http://localhost:8080',
  /** Preferred GTFS GraphQL path; the client probes alternatives if this 404s. */
  otpGraphqlPath: process.env.OTP_GRAPHQL_PATH ?? '/otp/gtfs/v1',
  /** GTFS feedId configured in otp/data/build-config.json. */
  feedId: process.env.FEED_ID ?? 'ovapi',

  /** Unzipped GTFS directory OTP builds from (where we write transfers.txt). */
  gtfsDir: process.env.GTFS_DIR ?? path.resolve(REPO_ROOT, 'otp', 'data', 'gtfs'),
  /** Pristine copy of the feed's original transfers.txt (merge baseline). */
  transfersOrig:
    process.env.TRANSFERS_ORIG ?? path.resolve(REPO_ROOT, 'otp', 'data', 'transfers.orig.txt'),
  /** Where custom transfer rules are persisted. */
  rulesPath: process.env.RULES_PATH ?? path.resolve(API_DIR, 'data', 'rules.json'),

  repoRoot: REPO_ROOT,
  timezone: 'Europe/Amsterdam',
};
