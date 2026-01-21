// Bump cache version whenever caching strategy changes.
const CACHE_NAME = 'river-reach-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Allow the client to force-activate an updated service worker.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // IMPORTANT: never cache JS/CSS bundles (prevents stale React runtime causing hook errors)
  const dest = event.request.destination;
  const isCodeAsset = dest === 'script' || dest === 'style' || dest === 'worker';

  // Network-first for navigations to keep HTML/current chunks in sync.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Keep a simple offline shell cached.
          const copy = networkResponse.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy)).catch(() => {})
          );
          return networkResponse;
        })
        .catch(() => caches.match('/') )
    );
    return;
  }

  // Always go to network for code assets.
  if (isCodeAsset) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For same-origin static assets (images/fonts), use cache-first with background refresh.
  if (isSameOrigin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchAndCache = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cachedResponse) {
          event.waitUntil(fetchAndCache);
          return cachedResponse;
        }

        return fetchAndCache.then((r) => r || new Response('Offline', { status: 503 }));
      })
    );
    return;
  }

  // Default: network
  event.respondWith(fetch(event.request));
});
