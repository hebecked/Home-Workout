/* global Response */

const CACHE = 'home-workout-v24';
const APP_SHELL = ['/manifest.webmanifest', '/mountain-climber-favicon-32.png', '/mountain-climber-apple-touch-icon.png', '/mountain-climber-icon-192.png', '/mountain-climber-icon-512.png', '/mountain-climber-maskable-512.png', '/assets/branding/mountain-climber-header.png', '/ai-workout-guide.txt', '/schema/workout-plan-v1.schema.json', '/schema/workout-plan-v2.schema.json'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(APP_SHELL);
    const offlinePage = await fetch('/index.html', { cache: 'reload' });
    await cache.put('/index.html', offlinePage);
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then((cache) => cache.put('/index.html', copy)));
      return response;
    }).catch(async () => (await caches.match('/index.html')) ?? Response.error()));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    event.waitUntil(caches.open(CACHE).then((cache) => cache.put(event.request, copy)));
    return response;
  }).catch(() => new Response('', { status: 503, statusText: 'Offline' }))));
});
