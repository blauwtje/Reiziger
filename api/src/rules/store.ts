import { promises as fs } from 'node:fs';
import path from 'node:path';
import { config } from '../config';
import type { TransferRule } from './types';

/** Simple JSON-file store. Single-user, a handful of rules — no DB needed. */

async function readAll(): Promise<TransferRule[]> {
  try {
    const txt = await fs.readFile(config.rulesPath, 'utf8');
    const data = JSON.parse(txt);
    return Array.isArray(data) ? (data as TransferRule[]) : [];
  } catch (e) {
    if ((e as NodeJS.ErrnoException)?.code === 'ENOENT') return [];
    throw e;
  }
}

async function writeAll(rules: TransferRule[]): Promise<void> {
  await fs.mkdir(path.dirname(config.rulesPath), { recursive: true });
  const tmp = `${config.rulesPath}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rules, null, 2), 'utf8');
  await fs.rename(tmp, config.rulesPath); // atomic replace
}

export async function listRules(): Promise<TransferRule[]> {
  return readAll();
}

export async function createRule(input: Omit<TransferRule, 'id'>): Promise<TransferRule> {
  const rules = await readAll();
  const id = rules.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const rule: TransferRule = { ...input, id };
  rules.push(rule);
  await writeAll(rules);
  return rule;
}

export async function updateRule(
  id: number,
  patch: Partial<Omit<TransferRule, 'id'>>,
): Promise<TransferRule | null> {
  const rules = await readAll();
  const i = rules.findIndex((r) => r.id === id);
  if (i < 0) return null;
  rules[i] = { ...rules[i], ...patch, id };
  await writeAll(rules);
  return rules[i];
}

export async function deleteRule(id: number): Promise<boolean> {
  const rules = await readAll();
  const next = rules.filter((r) => r.id !== id);
  if (next.length === rules.length) return false;
  await writeAll(next);
  return true;
}
