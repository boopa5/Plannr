const CACHE_STATIC_NAME = 'static-v36';
const CACHE_DYNAMIC_NAME = 'dynamic-v25';
const STATIC_FILES = [
  // '/Plannr/',
  // '/Plannr/public/index.html',
  // '/Plannr/manifest.json',
  // '/Plannr/public/src/js/app.js',
  // '/Plannr/public/Settings/',
  // '/Plannr/public/Settings/index.html',
  // '/Plannr/public/src/js/Assignment.js',
  // '/Plannr/public/src/js/idb.js',
  // '/Plannr/public/src/css/app.css',
  // 'https://code.getmdl.io/1.3.0/material.min.js',
  // 'https://fonts.googleapis.com/icon?family=Material+Icons',
  // 'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css',
]

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker ...')
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell')
        cache.addAll(STATIC_FILES);
      })
  )
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker');
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key)
            return caches.delete(key);
          }
        }));
      })
  )
  return self.clients.claim()
})


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function(res) {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache) {
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
            .catch(function(err) {

            });
        }
      })
  );
});