// Service worker: network-first (so the 10-minute updates always win), cache only as an offline fallback.
// CACHE VERSION BUMPED to v3 (2026-08-17): forces eviction of any page cached BEFORE the access gate existed
// - Safari in particular can serve a stale copy for a long time, and an old copy was the ungated public page.
const CACHE = 't10-v3';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)));  // drop every older cache
  await clients.claim();
})()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
