
const prefix = "training-app-shell:";
const cacheName = prefix + '230b3af9616dc99ac2cee31137d87028c110c5e9213fac017da12b7cf0220f23';
const files = ["./assets/index-C4cVCJ9B.js","./assets/index-CubyOzwC.css","./index.html","./manifest.webmanifest","./icons/app-192.png","./icons/app-512.png","./icons/maskable-512.png","./icons/apple-180.png"]
  .map(file => new URL(file, self.registration.scope).href);
const index = new URL('./index.html', self.registration.scope).href;
const routes = [self.registration.scope, index];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files.map(url => new Request(url, { cache: 'reload' })))));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(prefix) && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (request.mode === 'navigate' && routes.includes(url.origin + url.pathname)) {
    event.respondWith(caches.open(cacheName).then(async cache => await cache.match(index) || fetch(request)));
  } else if (files.includes(request.url)) {
    event.respondWith(caches.open(cacheName).then(async cache => await cache.match(request.url) || fetch(request)));
  }
});
