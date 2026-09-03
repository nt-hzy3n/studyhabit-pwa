const CACHE_NAME = 'studyhabit-v1';

// Static App Shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
  '/favicon.ico',
];

// 1. INSTALL EVENT - Cache the Application Shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event, caching App Shell:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Precache partial warning (assets may be dynamic):', err);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. ACTIVATE EVENT - Clean obsolete cache versions
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event, cleaning stale caches');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. FETCH EVENT - Cache-First for static assets, Network-Only for remote APIs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-Only for Google Apps Script API calls or remote submission endpoints
  if (
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('script.googleusercontent.com') ||
    event.request.method !== 'GET'
  ) {
    return; // Pass through directly to network
  }

  // Cache-First strategy for application assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and request is HTML navigation, serve cached App Shell index.html
          if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html') || caches.match('/');
          }
          return new Response('Tài nguyên ngoại tuyến chưa sẵn sàng.', {
            status: 503,
            statusText: 'Service Unavailable (Offline)',
          });
        });
    })
  );
});

// 4. BACKGROUND SYNC EVENT
self.addEventListener('sync', (event) => {
  if (event.tag === 'studyhabit-sync') {
    console.log('[Service Worker] Background Sync event triggered for StudyHabit:', event.tag);
    // Notify all open clients so SyncManager can process queue
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_SYNC' });
        });
      })
    );
  }
});
