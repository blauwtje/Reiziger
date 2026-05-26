import { config } from '../config';

/**
 * OTP's GTFS GraphQL endpoint path differs across versions
 * (/otp/gtfs/v1 in recent 2.x, /otp/routers/default/index/graphql in older).
 * We probe once and cache whichever responds.
 */
const CANDIDATE_PATHS = [
  config.otpGraphqlPath,
  '/otp/gtfs/v1',
  '/otp/routers/default/index/graphql',
];

let resolvedPath: string | null = null;

async function resolvePath(): Promise<string> {
  if (resolvedPath) return resolvedPath;
  const body = JSON.stringify({ query: '{ feeds { feedId } }' });
  const tried = new Set<string>();
  for (const p of CANDIDATE_PATHS) {
    if (tried.has(p)) continue;
    tried.add(p);
    try {
      const res = await fetch(config.otpUrl + p, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      });
      if (res.ok) {
        const json = (await res.json()) as { data?: unknown; errors?: unknown };
        if (json && (json.data || json.errors)) {
          resolvedPath = p;
          return p;
        }
      }
    } catch {
      /* try next candidate */
    }
  }
  throw new Error(
    `Cannot reach OTP GraphQL at ${config.otpUrl} (tried ${[...tried].join(', ')}). Is OTP up?`,
  );
}

export async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const p = await resolvePath();
  const res = await fetch(config.otpUrl + p, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`OTP GraphQL HTTP ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    throw new Error('OTP GraphQL error: ' + json.errors.map((e) => e.message).join('; '));
  }
  return json.data as T;
}

export async function otpHealth(): Promise<{ ok: boolean; graphqlPath?: string; error?: string }> {
  try {
    const graphqlPath = await resolvePath();
    return { ok: true, graphqlPath };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
