import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve the API proxy target in order of priority:
//  1. VITE_API_PORT env  — set by the dev orchestrator (scripts/dev.mjs)
//  2. api/.dev-port file — written by the API on bind; covers standalone "api first" start
//  3. fallback 3001
function resolveApiTarget(): string {
  if (process.env.VITE_API_PORT) return `http://localhost:${process.env.VITE_API_PORT}`;
  try {
    const port = readFileSync(resolve(__dirname, '../api/.dev-port'), 'utf8').trim();
    if (port) return `http://localhost:${port}`;
  } catch {}
  return 'http://localhost:3001';
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': resolveApiTarget(),
    },
  },
});
