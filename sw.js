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

// Fetch: Network-First mit Cache-Fallback
self.addEventListener('fetch', function(event) {
    // Externe Ressourcen (CDN) immer vom Netzwerk laden
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                // Erfolgreiche Antwort in Cache speichern
                if (response.status === 200) {
                    var responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(function() {
                // Offline: Aus Cache laden
                return caches.match(event.request).then(function(cachedResponse) {
                    return cachedResponse || new Response('Offline - Seite nicht verfügbar', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                    });
                });
            })
    );
});
