import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

// A real unavailable origin exercises service-worker fallback without relying
// on browser-specific offline emulation. Port 0 never replaces a running server.
export async function startOfflineOrigin() {
  const root = resolve('dist');
  const server = createServer((request, response) => {
    void (async () => {
    const path = resolve(root, '.' + new URL(request.url ?? '/', 'http://localhost').pathname.replace(/\/$/, '/index.html'));
    if (!path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    try {
      const data = await readFile(path);
      const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
      response.writeHead(200, { 'content-type': types[extname(path)] ?? 'text/plain', 'cache-control': 'no-store' });
      response.end(data);
    } catch { response.writeHead(404).end(); }
    })().catch(() => response.destroy());
  });
  await new Promise<void>(done => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test server port');
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: async () => {
      if (!server.listening) return;
      server.closeAllConnections();
      await new Promise<void>((done, reject) => server.close(error => error ? reject(error) : done()));
    }
  };
}
