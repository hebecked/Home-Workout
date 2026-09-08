import { loadEnv } from 'vite';
import { spawnSync } from 'node:child_process';

const address = process.env.HW_LEGAL_ADDRESS ?? loadEnv('production', process.cwd(), 'HW_').HW_LEGAL_ADDRESS;
if (!address || address.split('|').filter(Boolean).length < 3) {
  throw new Error('Set HW_LEGAL_ADDRESS in the private .env.production.local or release environment before publishing.');
}
const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], { stdio: 'inherit', windowsHide: true });
process.exitCode = result.status ?? 1;
