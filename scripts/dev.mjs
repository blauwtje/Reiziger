#!/usr/bin/env node
// Single-command dev orchestrator: starts api + web, auto-selects free ports,
// keeps the Vite proxy in sync, and shuts both processes down together.
import { createServer } from 'node:net';
import { spawn, exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { unlinkSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IS_WIN = process.platform === 'win32';
const portFile = join(ROOT, 'api', '.dev-port');

const C = {
  api:   '\x1b[36m',
  web:   '\x1b[35m',
  dim:   '\x1b[2m',
  bold:  '\x1b[1m',
  reset: '\x1b[0m',
};

// Probe both IPv4 and IPv6 loopback. A stale server on [::1]:PORT does not
// collide with a bind on 127.0.0.1:PORT, so checking only one stack reports a
// port as free that Vite (which binds both) then fails to claim.
const PROBE_HOSTS = ['127.0.0.1', '::1'];

function canBind(port, host) {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.once('error', (err) =>
      err.code === 'EADDRINUSE' || err.code === 'EADDRNOTAVAIL'
        ? resolve(err.code === 'EADDRNOTAVAIL') // missing stack ≠ in use
        : reject(err),
    );
    s.once('listening', () => s.close(() => resolve(true)));
    s.listen(port, host);
  });
}

async function findFreePort(start) {
  for (let port = start; port < start + 100; port++) {
    const results = await Promise.all(PROBE_HOSTS.map((h) => canBind(port, h)));
    if (results.every(Boolean)) return port;
  }
  throw new Error(`no free port found in range ${start}-${start + 100}`);
}

function kill(child) {
  if (!child || child.exitCode !== null) return;
  if (IS_WIN && child.pid) exec(`taskkill /pid ${child.pid} /T /F`);
  else child.kill('SIGTERM');
}

function pipe(child, label, color) {
  const pfx = `${color}[${label}]${C.reset} `;
  for (const stream of [child.stdout, child.stderr]) {
    if (!stream) continue;
    let buf = '';
    stream.on('data', (chunk) => {
      buf += chunk.toString();
      let i;
      while ((i = buf.indexOf('\n')) !== -1) {
        process.stdout.write(pfx + buf.slice(0, i + 1));
        buf = buf.slice(i + 1);
      }
    });
    stream.on('end', () => {
      if (buf) process.stdout.write(pfx + buf + '\n');
    });
  }
}

const [apiPort, webPort] = await Promise.all([
  findFreePort(3001),
  findFreePort(5173),
]);

console.log(`\n${C.bold}Reiziger dev${C.reset}`);
console.log(`${C.dim}  api → http://127.0.0.1:${apiPort}${apiPort !== 3001 ? '  (3001 was in use)' : ''}${C.reset}`);
console.log(`${C.dim}  web → http://localhost:${webPort}${webPort !== 5173 ? '  (5173 was in use)' : ''}${C.reset}\n`);

const base = { cwd: ROOT, shell: true, stdio: ['ignore', 'pipe', 'pipe'] };

const api = spawn('npm', ['-w', 'api', 'run', 'dev'], {
  ...base,
  env: { ...process.env, PORT: String(apiPort), HOST: '127.0.0.1' },
});

const web = spawn(
  'npm',
  ['-w', 'web', 'run', 'dev', '--', '--port', String(webPort), '--strictPort'],
  {
    ...base,
    env: { ...process.env, VITE_API_PORT: String(apiPort) },
  },
);

pipe(api, 'api', C.api);
pipe(web, 'web', C.web);

let exiting = false;
function cleanup(label) {
  if (exiting) return;
  exiting = true;
  if (label) process.stdout.write(`\n${C.dim}${label} — shutting down…${C.reset}\n`);
  kill(api);
  kill(web);
  try { unlinkSync(portFile); } catch {}
  process.exit(0);
}

api.on('close', (code) => {
  process.stdout.write(`\n${C.api}[api]${C.reset} exited (code ${code})\n`);
  cleanup();
});
web.on('close', (code) => {
  process.stdout.write(`\n${C.web}[web]${C.reset} exited (code ${code})\n`);
  cleanup();
});

process.on('SIGINT',  () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));
