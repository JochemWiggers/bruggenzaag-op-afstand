// Bruggenzaag op afstand — maakt de pagina installeerbaar als app en laat hem ook zonder
// netwerk openen. Alleen de eigen bestanden; berichten van ntfy gaan nooit via de cache.
const CACHE = 'bruggenzaag-v1';
const BESTANDEN = ['./', './index.html', './icoon-192.png', './icoon-512.png', './apple-touch-icon.png', './favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BESTANDEN)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;   // ntfy e.d.: gewoon het netwerk
  e.respondWith(fetch(e.request).then(r => {   // eerst het netwerk (altijd de nieuwste versie), anders de kopie
    const kopie = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, kopie));
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
