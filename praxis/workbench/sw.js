/* PRAXIS Workbench Service Worker — DISABLED
   This SW immediately unregisters itself and clears all caches.
   Service worker will be re-enabled after development stabilizes. */

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.map(function(n) { return caches.delete(n); }));
    }).then(function() {
      return self.clients.claim();
    }).then(function() {
      return self.registration.unregister();
    })
  );
});

// Pass through all fetches to network
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
