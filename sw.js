// NEG Plus PLLC — Service Worker
// Hybrid cache strategy: network-first for HTML, cache-first for static assets

const CACHE_NAME = 'negplushealth-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/services.html',
  '/consulting.html',
  '/care-delivery.html',
  '/team.html',
  '/education.html',
  '/news.html',
  '/faq.html',
  '/manifest.json',
  '/favicon.png',
  '/logo.png',
  '/logo_nav.png',
  '/logo_pllc.png',
  '/logo_pllc_web.png',
  '/icon-192.png',
  '/icon-512.png'
];

// Sensitive paths — never cache
const SKIP_CACHE_PATHS = ['portal', 'dataroom'];

// ── Install: pre-cache static shell ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old cache versions ─────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: hybrid strategy ────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // Never cache sensitive paths
  if (SKIP_CACHE_PATHS.some(path => url.pathname.includes(path))) return;

  const isHTML = event.request.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    // Network-first for HTML — always try to get fresh content
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first for static assets — serve instantly, refresh in background
    event.respondWith(
      caches.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          return response;
        });
        return cached || networkFetch;
      })
    );
  }
});
