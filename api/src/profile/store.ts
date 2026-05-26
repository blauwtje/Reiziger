import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { API_DIR } from '../config';
import type { UserProfile } from './types';
import { DEFAULT_PROFILE } from './types';

const PROFILE_PATH = join(API_DIR, 'data', 'profile.json');

export function readProfile(): UserProfile {
  if (!existsSync(PROFILE_PATH)) return structuredClone(DEFAULT_PROFILE);
  try {
    return JSON.parse(readFileSync(PROFILE_PATH, 'utf8')) as UserProfile;
  } catch {
    return structuredClone(DEFAULT_PROFILE);
  }
}

export function writeProfile(profile: UserProfile): void {
  mkdirSync(dirname(PROFILE_PATH), { recursive: true });
  writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2));
}
