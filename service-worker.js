var cacheName = 'News-post-v7';
var contentImgCache = 'News-post-imgs-v1';
var allCaches = [cacheName, contentImgCache];

var appShellFiles = [
  '/',
  '/index.html',
  '/app.js',
  '/idb.js',
  '/styles.css',
  '/manifest.json',
  '/materialize/css/materialize.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

self.addEventListener('install', (e) => {
  console.log('[ServiceWorker] Install done');
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(appShellFiles);
    })
  );
});


self.addEventListener('activate', (e) => {
  console.log('[ServiceWorker] Activated');
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.filter(key => {
          return !allCaches.includes(key);
        })
        .map(key => {
          return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim();
});


self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  // var requestUrl = new URL(e.request.url);
  if(e.request.url.endsWith == '.jpg' || e.request.url.endsWith == '.png') {
    e.respondWith(serveImgs(e.request));
    return;
  }
// Trying to cache images but not sure why she's not working :-(
  function serveImgs(request) {
    return caches.open(contentImgCache).then(cache => {
      return cache.match(request.url).then(response => {
        if (response) return response;
        return fetch(request).then(networkResponse => {
          cache.put(request.url, networkResponse.clone());
          return networkResponse;
        });
      })
    });
  }

  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response) return response;
      return fetch(e.request);
    })
  );
});