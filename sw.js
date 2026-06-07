// GrAPP Service Worker — Offline-Cache
const CACHE_NAME = 'grapp-v12';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/profile.js',
    './js/log.js',
    './js/features.js',
    './js/attendance.js',
    './js/breathing.js',
    './js/playbook.js',
    './manifest.json',
    './img/icon-192.png',
    './img/icon-512.png'
];

// Installation: Alle Core-Assets cachen
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('[SW] Caching core assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Aktivierung: Alte Caches aufräumen
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name !== CACHE_NAME;
                }).map(function(name) {
                    console.log('[SW] Deleting old cache:', name);
                    return caches.delete(name);
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: Stale-While-Revalidate Pattern
self.addEventListener('fetch', function(event) {
    // Externe Ressourcen (CDN) immer vom Netzwerk laden
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            const fetchPromise = fetch(event.request).then(function(networkResponse) {
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(function() {
                // Ignore fetch errors to gracefully fallback to cache
            });

            return cachedResponse || fetchPromise || new Response('Offline - Seite nicht verfügbar', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        })
    );
});
