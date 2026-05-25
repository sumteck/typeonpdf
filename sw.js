const CACHE_NAME = 'typeonpdf-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event (ഇവിടെയാണ് മാറ്റം വരുത്തിയത്)
self.addEventListener('fetch', event => {
  // നിങ്ങളുടെ വെബ്സൈറ്റിന് പുറത്തേക്കുള്ള റിക്വസ്റ്റുകളെ (GitHub, Google Fonts) സർവീസ് വർക്കർ തടയാതിരിക്കാൻ:
  if (!event.request.url.startsWith(self.location.origin)) {
    return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Return cached file
        }
        return fetch(event.request); // Fetch from network
      })
  );
});