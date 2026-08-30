import { execFileSync } from 'node:child_process';

const allowed = new Set(['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'CC0-1.0', 'BlueOak-1.0.0', 'Python-2.0']);
const raw = execFileSync('npx', ['license-checker-rseidelsohn', '--production', '--json'], { encoding: 'utf8', shell: process.platform === 'win32' });
const packages = JSON.parse(raw);
const rejected = Object.entries(packages).filter(([, value]) => {
  if (value.private === true) return false;
  const license = typeof value.licenses === 'string' ? value.licenses : '';
  return !license.split(/\s+OR\s+|\s+AND\s+/).every((part) => allowed.has(part.replace(/[()]/g, '')));
});

if (rejected.length > 0) {
  console.error('Disallowed or unknown production dependency licenses:', rejected);
  process.exit(1);
}

console.log('All production dependency licenses are allowed.');
