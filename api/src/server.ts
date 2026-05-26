import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config, API_DIR } from './config';
import { otpHealth } from './otp/client';
import { planArriveBy, searchStops, routesAtStop } from './otp/plan';
import { listRules, createRule, updateRule, deleteRule } from './rules/store';
import { compileTransfers } from './compile/gtfs';
import { startRebuild, getRebuildState } from './otp/rebuild';
import type { TransferRule } from './rules/types';
import { createServer as createNetServer } from 'node:net';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.get('/api/health', async () => {
  const otp = await otpHealth();
  const rules = await listRules();
  return { ok: true, otp, ruleCount: rules.length };
});

app.get('/api/stops', async (req) => {
  const q = (req.query as { q?: string }).q;
  if (!q || q.trim().length < 2) return { stops: [] };
  return { stops: await searchStops(q.trim()) };
});

app.get('/api/stops/:id/routes', async (req) => {
  const { id } = req.params as { id: string };
  return { routes: await routesAtStop(decodeURIComponent(id)) };
});

app.post('/api/plan', async (req, reply) => {
  const body = req.body as { from?: string; to?: string; arriveBy?: string; num?: number; discounts?: string[] };
  if (!body?.from || !body?.to || !body?.arriveBy) {
    reply.code(400);
    return { error: 'from, to, and arriveBy (ISO local datetime, e.g. 2026-05-27T09:00) are required' };
  }
  return { itineraries: await planArriveBy(body.from, body.to, body.arriveBy, body.num ?? 6, body.discounts ?? []) };
});

app.get('/api/rules', async () => ({ rules: await listRules() }));

app.post('/api/rules', async (req) => ({ rule: await createRule(normalizeRule(req.body)) }));

app.put('/api/rules/:id', async (req, reply) => {
  const { id } = req.params as { id: string };
  const rule = await updateRule(Number(id), normalizeRulePatch(req.body));
  if (!rule) {
    reply.code(404);
    return { error: 'rule not found' };
  }
  return { rule };
});

app.delete('/api/rules/:id', async (req, reply) => {
  const { id } = req.params as { id: string };
  if (!(await deleteRule(Number(id)))) {
    reply.code(404);
    return { error: 'rule not found' };
  }
  return { ok: true };
});

// Write transfers.txt from current rules (no rebuild) — handy for inspection.
app.post('/api/compile', async () => compileTransfers());

// Apply rules: compile + rebuild graph + restart OTP, in the background.
app.post('/api/rebuild', async () => ({ started: true, state: startRebuild() }));
app.get('/api/rebuild/status', async () => getRebuildState());

function normalizeRule(body: unknown): Omit<TransferRule, 'id'> {
  const b = (body ?? {}) as Record<string, unknown>;
  return {
    label: String(b.label ?? ''),
    fromStopIds: Array.isArray(b.fromStopIds) ? b.fromStopIds.map(String) : [],
    toStopIds: Array.isArray(b.toStopIds) ? b.toStopIds.map(String) : [],
    fromRouteId: b.fromRouteId ? String(b.fromRouteId) : null,
    toRouteId: b.toRouteId ? String(b.toRouteId) : null,
    minBufferSec: Number(b.minBufferSec ?? 0),
    enabled: b.enabled !== false,
  };
}

function normalizeRulePatch(body: unknown): Partial<Omit<TransferRule, 'id'>> {
  const b = (body ?? {}) as Record<string, unknown>;
  const patch: Partial<Omit<TransferRule, 'id'>> = {};
  if ('label' in b) patch.label = String(b.label);
  if ('fromStopIds' in b && Array.isArray(b.fromStopIds)) patch.fromStopIds = b.fromStopIds.map(String);
  if ('toStopIds' in b && Array.isArray(b.toStopIds)) patch.toStopIds = b.toStopIds.map(String);
  if ('fromRouteId' in b) patch.fromRouteId = b.fromRouteId ? String(b.fromRouteId) : null;
  if ('toRouteId' in b) patch.toRouteId = b.toRouteId ? String(b.toRouteId) : null;
  if ('minBufferSec' in b) patch.minBufferSec = Number(b.minBufferSec);
  if ('enabled' in b) patch.enabled = Boolean(b.enabled);
  return patch;
}

function findFreePort(start: number, host: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const try_ = (port: number) => {
      const s = createNetServer();
      s.once('error', (err: NodeJS.ErrnoException) =>
        err.code === 'EADDRINUSE' ? try_(port + 1) : reject(err),
      );
      s.once('listening', () => s.close(() => resolve(port)));
      s.listen(port, host);
    };
    try_(start);
  });
}

const port = await findFreePort(config.port, config.host);
if (port !== config.port) {
  app.log.warn({ from: config.port, to: port }, 'Port in use — auto-selected next free port');
}

const portFile = join(API_DIR, '.dev-port');

try {
  await app.listen({ port, host: config.host });
  writeFileSync(portFile, String(port));
  process.on('exit', () => { try { unlinkSync(portFile); } catch {} });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
