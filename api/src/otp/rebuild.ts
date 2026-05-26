import { spawn } from 'node:child_process';
import { config } from '../config';
import { compileTransfers } from '../compile/gtfs';

/** Run a command in the repo root, inheriting stdio. shell:true so Windows resolves docker.exe. */
function run(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { cwd: config.repoRoot, stdio: 'inherit', shell: true });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`\`${command}\` exited with code ${code}`)),
    );
  });
}

/**
 * Rebuild the OTP graph and restart the serving container.
 * Build (otp-build) and serve (otp) are separate JVMs; running both at once
 * would exceed the memory budget, so: stop serve -> build -> start serve.
 * Requires the `docker` CLI on PATH where the API process runs.
 */
export async function rebuildGraph(): Promise<void> {
  await run('docker compose stop otp').catch(() => {}); // fine if not running
  await run('docker compose run --rm otp-build');
  await run('docker compose up -d otp');
}

// --- async rebuild manager so the HTTP request never blocks for minutes ---

export interface RebuildState {
  running: boolean;
  startedAt: number | null;
  finishedAt: number | null;
  error: string | null;
  customRows: number | null;
}

let state: RebuildState = {
  running: false,
  startedAt: null,
  finishedAt: null,
  error: null,
  customRows: null,
};

export function getRebuildState(): RebuildState {
  return state;
}

/** Compile current rules into transfers.txt, then rebuild + restart OTP, in the background. */
export function startRebuild(): RebuildState {
  if (state.running) return state;
  state = { running: true, startedAt: Date.now(), finishedAt: null, error: null, customRows: null };
  void (async () => {
    try {
      const compiled = await compileTransfers();
      await rebuildGraph();
      state.customRows = compiled.rows;
    } catch (e) {
      state.error = e instanceof Error ? e.message : String(e);
    } finally {
      state.running = false;
      state.finishedAt = Date.now();
    }
  })();
  return state;
}
