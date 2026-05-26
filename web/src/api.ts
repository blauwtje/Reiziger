import type { StopHit, RouteHit, ShapedItinerary, TransferRule, UserProfile, Disruption, AddressHit } from './types';

async function jget<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json() as Promise<T>;
}

async function jsend<T>(url: string, method: string, body?: unknown): Promise<T> {
  const r = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!r.ok) {
    let msg = '';
    try {
      msg = ((await r.json()) as { error?: string }).error ?? '';
    } catch {
      /* ignore */
    }
    throw new Error(msg || `${r.status} ${r.statusText}`);
  }
  return r.json() as Promise<T>;
}

export interface Health {
  ok: boolean;
  otp: { ok: boolean; graphqlPath?: string; error?: string };
  ruleCount: number;
}

export interface RebuildStatus {
  running: boolean;
  startedAt: number | null;
  finishedAt: number | null;
  error: string | null;
  customRows: number | null;
}

export const api = {
  health: () => jget<Health>('/api/health'),
  stops: (q: string) => jget<{ stops: StopHit[] }>(`/api/stops?q=${encodeURIComponent(q)}`).then((r) => r.stops),
  routesAtStop: (id: string) =>
    jget<{ routes: RouteHit[] }>(`/api/stops/${encodeURIComponent(id)}/routes`).then((r) => r.routes),
  plan: (from: string, to: string, arriveBy: string, discounts: string[] = []) =>
    jsend<{ itineraries: ShapedItinerary[] }>('/api/plan', 'POST', { from, to, arriveBy, discounts }).then((r) => r.itineraries),
  listRules: () => jget<{ rules: TransferRule[] }>('/api/rules').then((r) => r.rules),
  createRule: (rule: Omit<TransferRule, 'id'>) =>
    jsend<{ rule: TransferRule }>('/api/rules', 'POST', rule).then((r) => r.rule),
  updateRule: (id: number, patch: Partial<TransferRule>) =>
    jsend<{ rule: TransferRule }>(`/api/rules/${id}`, 'PUT', patch).then((r) => r.rule),
  deleteRule: (id: number) => jsend<{ ok: boolean }>(`/api/rules/${id}`, 'DELETE'),
  rebuild: () => jsend<{ started: boolean }>('/api/rebuild', 'POST'),
  rebuildStatus: () => jget<RebuildStatus>('/api/rebuild/status'),
  profile: () =>
    jget<UserProfile>('/api/profile'),
  updateProfile: (patch: Partial<UserProfile>) =>
    jsend<UserProfile>('/api/profile', 'PUT', patch),
  disruptions: () =>
    jget<{ disruptions: Disruption[] }>('/api/disruptions').then((r) => r.disruptions),
  geocode: (q: string) =>
    jget<{ results: AddressHit[] }>(`/api/geocode?q=${encodeURIComponent(q)}`).then((r) => r.results),
};
