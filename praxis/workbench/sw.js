/*  PRAXIS Evaluation Workbench — Service Worker
    Cache-first for local assets, network-first for CDN resources.
    ───────────────────────────────────────────────────────────── */

var CACHE_NAME = 'praxis-wb-v2';

// ── Local assets to precache ────────────────────────────────────────────────

var LOCAL_ASSETS = [
  '/praxis/workbench/',
  '/praxis/workbench/index.html',
  '/praxis/logo.svg',

  // CSS
  '/praxis/workbench/css/tokens.css',
  '/praxis/workbench/css/layout.css',
  '/praxis/workbench/css/components.css',
  '/praxis/workbench/css/stations.css',
  '/praxis/workbench/css/sensitivity.css',

  // Core JS
  '/praxis/workbench/js/utils.js',
  '/praxis/workbench/js/schema.js',
  '/praxis/workbench/js/context.js',
  '/praxis/workbench/js/router.js',
  '/praxis/workbench/js/i18n.js',
  '/praxis/workbench/js/protection.js',
  '/praxis/workbench/js/staleness.js',
  '/praxis/workbench/js/app.js',

  // Shell
  '/praxis/workbench/js/shell/Shell.js',
  '/praxis/workbench/js/shell/TopBar.js',
  '/praxis/workbench/js/shell/StationRail.js',
  '/praxis/workbench/js/shell/EntryLanding.js',
  '/praxis/workbench/js/shell/ContextDrawer.js',

  // Shared components
  '/praxis/workbench/js/components/FileDropZone.js',
  '/praxis/workbench/js/components/Modal.js',
  '/praxis/workbench/js/components/ProgressRing.js',
  '/praxis/workbench/js/components/SensitivityBanner.js',
  '/praxis/workbench/js/components/StalenessWarning.js',
  '/praxis/workbench/js/components/StationHeader.js',
  '/praxis/workbench/js/components/ToastNotification.js',
  '/praxis/workbench/js/components/ExperienceTierBadge.js',
  '/praxis/workbench/js/components/HelpSidebar.js',

  // Station 0
  '/praxis/workbench/js/stations/station0/Station0.js',
  '/praxis/workbench/js/stations/station0/Phase1Programme.js',
  '/praxis/workbench/js/stations/station0/Phase2ToR.js',
  '/praxis/workbench/js/stations/station0/Phase3Assessment.js',
  '/praxis/workbench/js/stations/station0/PhaseReview.js',
  '/praxis/workbench/js/stations/station0/EvaluabilityScorer.js',

  // Station 1
  '/praxis/workbench/js/stations/station1/Station1.js',
  '/praxis/workbench/js/stations/station1/TocBridge.js',
  '/praxis/workbench/js/stations/station1/TocInline.js',

  // Station 2
  '/praxis/workbench/js/stations/station2/Station2.js',
  '/praxis/workbench/js/stations/station2/AddEQModal.js',
  '/praxis/workbench/js/stations/station2/IndicatorSelector.js',
  '/praxis/workbench/js/stations/station2/MatrixExport.js',
  '/praxis/workbench/js/stations/station2/MatrixGenerator.js',
  '/praxis/workbench/js/stations/station2/MatrixInlineEditor.js',
  '/praxis/workbench/js/stations/station2/MatrixTable.js',

  // Station 3
  '/praxis/workbench/js/stations/station3/Station3.js',
  '/praxis/workbench/js/stations/station3/DesignBridge.js',

  // Station 4
  '/praxis/workbench/js/stations/station4/Station4.js',
  '/praxis/workbench/js/stations/station4/SampleBridge.js',

  // Station 5
  '/praxis/workbench/js/stations/station5/Station5.js',
  '/praxis/workbench/js/stations/station5/InstrumentEditor.js',
  '/praxis/workbench/js/stations/station5/InstrumentExport.js',
  '/praxis/workbench/js/stations/station5/InstrumentScaffold.js',
  '/praxis/workbench/js/stations/station5/QuestionConfigurator.js',

  // Stations 6–8
  '/praxis/workbench/js/stations/station6/Station6.js',
  '/praxis/workbench/js/stations/station7/Station7.js',
  '/praxis/workbench/js/stations/station8/Station8.js',

  // Data
  '/praxis/workbench/data/indicator_bank.js',

  // Language files
  '/praxis/workbench/lang/en.json',
  '/praxis/workbench/lang/fr.json'
];

// ── CDN resources (network-first) ───────────────────────────────────────────

var CDN_URLS = [
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap'
];

// ── Install: precache all local assets ──────────────────────────────────────

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(LOCAL_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── Activate: purge old caches ──────────────────────────────────────────────

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name.startsWith('praxis-wb-') && name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── Fetch: cache-first for local, network-first for CDN ─────────────────────

function isCDN(url) {
  return url.indexOf('unpkg.com') !== -1
      || url.indexOf('cdn.sheetjs.com') !== -1
      || url.indexOf('fonts.googleapis.com') !== -1
      || url.indexOf('fonts.gstatic.com') !== -1;
}

self.addEventListener('fetch', function(event) {
  var request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  if (isCDN(request.url)) {
    // Network-first with cache fallback for CDN resources
    event.respondWith(
      fetch(request).then(function(networkResponse) {
        // Cache the fresh response for offline use
        if (networkResponse && networkResponse.status === 200) {
          var clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, clone);
          });
        }
        return networkResponse;
      }).catch(function() {
        return caches.match(request);
      })
    );
  } else {
    // Cache-first for local assets
    event.respondWith(
      caches.match(request).then(function(cached) {
        return cached || fetch(request).then(function(networkResponse) {
          // Opportunistically cache new local resources
          if (networkResponse && networkResponse.status === 200) {
            var clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
