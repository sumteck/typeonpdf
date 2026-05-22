// Versioned cache name to force updates
const CACHE_NAME = 'sid-ind-v2';

// Essential assets to cache for offline support
const ASSETS_TO_CACHE = [
  './',              // Application root (maps to index.html)
  './index.html',
  './style.css',
  './logo192.png',
  './manifest.json',
  './sw.js',
  './impcops.xlsx',  // Ensure data file is cached!

  // CDN Libraries: Pre-cache specific URLs for offline access
  'https://cdn.tailwindcss.com', // Caching the main Tailwinds script file
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js',
  
  // Google Fonts CSS (can be complex, but caching the main style is a start)
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'
];

// NOTE: Tailwind CSS cannot work fully offline when loaded dynamically 
// with `<script src="https://cdn.tailwindcss.com"></script>`. 
// For complete offline work, you must build your Tailwind to static CSS. 
// We are caching the script here to minimize issues, but full styles 
// won't update offline.

// Install event - Cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`[SW v2] Caching essential assets.`);
        // Continue even if some assets fail to cache (useful for Google Fonts)
        return cache.addAll(ASSETS_TO_CACHE.filter(url => !url.startsWith('https://fonts.')));
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
  console.log(`[SW v2] Activating and cleaning old caches.`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
    .then(() => self.clients.claim()) // Claim all clients immediately
  );
});

// Fetch event - Respond from cache or fetch and update
self.addEventListener('fetch', event => {
  // Ignore requests from browser extensions (e.g., chrome-extension://)
  if (event.request.url.startsWith('chrome-extension')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached response if found
      if (cachedResponse) return cachedResponse;

      // Otherwise, fetch from network
      return fetch(event.request).then(networkResponse => {
        // Return if not a valid request to cache (e.g., POST request, data URL)
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clone and add the new response to cache
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});