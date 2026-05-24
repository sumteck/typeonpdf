const CACHE_NAME = 'typeonpdf-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// ഇൻസ്റ്റാൾ ചെയ്യുമ്പോൾ ഫയലുകൾ കാഷ് (Cache) ചെയ്യുന്നു
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// പുതിയ വേർഷൻ വരുമ്പോൾ പഴയ കാഷ് ഡിലീറ്റ് ചെയ്യുന്നു
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// ഇന്റർനെറ്റ് ഇല്ലെങ്കിലും ആപ്പ് വർക്ക് ചെയ്യാൻ സഹായിക്കുന്നു
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});