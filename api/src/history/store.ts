import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { API_DIR } from '../config';
import { randomUUID } from 'node:crypto';

export interface HistoryEntry {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  when: string;
  dur: string;
  date: string;
}

const HISTORY_PATH = join(API_DIR, 'data', 'history.json');
const MAX_ENTRIES = 50;

export function listHistory(): HistoryEntry[] {
  if (!existsSync(HISTORY_PATH)) return [];
  try {
    return JSON.parse(readFileSync(HISTORY_PATH, 'utf8')) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, 'id'>): void {
  const entries = listHistory();
  const newEntry: HistoryEntry = {
    id: randomUUID(),
    ...entry,
  };
  entries.unshift(newEntry);
  const capped = entries.slice(0, MAX_ENTRIES);
  mkdirSync(dirname(HISTORY_PATH), { recursive: true });
  writeFileSync(HISTORY_PATH, JSON.stringify(capped, null, 2));
}
