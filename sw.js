
const prefix = "training-app-shell:";
const scopedPrefix = prefix + encodeURIComponent(self.registration.scope) + ':';
const cacheName = scopedPrefix + 'c006cd72eaa9ff233ab8c9374176bfec499690f51720f7bee071e8ad6074384e';
const files = ["./assets/index-DlcwS4Eh.js","./assets/index-BxSNTJeR.css","./index.html","./manifest.webmanifest","./icons/app-192.png","./icons/app-512.png","./icons/maskable-512.png","./icons/apple-180.png"]
  .map(file => new URL(file, self.registration.scope).href);
const index = new URL('./index.html', self.registration.scope).href;
const routes = [self.registration.scope, index];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(cacheName);
      await cache.addAll(files.map(url => new Request(url, { cache: 'reload' })));
    } catch (error) {
      await caches.delete(cacheName);
      throw error;
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Other open tabs can keep using their running bundle until they choose to reload.
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (!windows.some(client => client.url.startsWith(self.registration.scope))) {
      for (const name of await caches.keys()) {
        if (!name.startsWith(prefix) || name === cacheName) continue;
        const owned = name.startsWith(scopedPrefix) ||
          (!name.slice(prefix.length).includes(':') && await (await caches.open(name)).match(index));
        if (owned) await caches.delete(name);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting());
  if (event.data?.type === 'READ_BUILD_NONCE') event.ports[0]?.postMessage("6cecf799");
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (request.mode === 'navigate' && routes.includes(url.origin + url.pathname)) {
    event.respondWith(caches.open(cacheName).then(async cache => await cache.match(index) || fetch(request)));
  } else if (files.includes(request.url)) {
    event.respondWith(caches.open(cacheName).then(async cache => await cache.match(request.url) || fetch(request)));
  } else if (request.url.startsWith(new URL('./assets/', self.registration.scope).href)) {
    event.respondWith((async () => {
      for (const name of await caches.keys()) {
        if (!name.startsWith(scopedPrefix) &&
            !(name.startsWith(prefix) && !name.slice(prefix.length).includes(':'))) continue;
        const cached = await (await caches.open(name)).match(request.url);
        if (cached) return cached;
      }
      return fetch(request);
    })());
  }
});
