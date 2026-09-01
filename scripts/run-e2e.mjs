import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const port = process.env.E2E_PORT ?? '4173';
const externalOrigin = process.env.E2E_BASE_URL;
const origin = externalOrigin ?? `http://127.0.0.1:${port}`;
const viteCli = resolve('node_modules/vite/bin/vite.js');
const playwrightCli = resolve('node_modules/@playwright/test/cli.js');
const preview = externalOrigin ? null : spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', port, '--strictPort'], {
  stdio: 'inherit',
  windowsHide: true
});

const waitForPreview = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (preview !== null && preview.exitCode !== null) throw new Error(`Preview exited with code ${preview.exitCode}.`);
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // The preview needs a short startup window.
    }
    await delay(100);
  }
  throw new Error(`Preview did not become ready at ${origin}.`);
};

const stopPreview = async () => {
  if (preview === null || preview.exitCode !== null) return;
  preview.kill('SIGTERM');
  await Promise.race([
    new Promise((resolveExit) => preview.once('exit', resolveExit)),
    delay(3000)
  ]);
};

let interrupted = false;
const interrupt = () => {
  interrupted = true;
  void stopPreview();
};
process.once('SIGINT', interrupt);
process.once('SIGTERM', interrupt);

try {
  await waitForPreview();
  const runner = spawn(process.execPath, [playwrightCli, 'test', ...process.argv.slice(2)], {
    stdio: 'inherit',
    windowsHide: true,
    env: { ...process.env, E2E_EXTERNAL_SERVER: '1', E2E_PORT: port }
  });
  const code = await new Promise((resolveExit) => runner.once('exit', (exitCode) => resolveExit(exitCode ?? 1)));
  if (!interrupted) process.exitCode = code;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await stopPreview();
}
