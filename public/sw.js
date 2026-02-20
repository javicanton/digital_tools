const IMAGE_CACHE = 'tool-image-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET' || request.destination !== 'image') {
    return;
  }

  const url = new URL(request.url);
  if (!['http:', 'https:'].includes(url.protocol)) {
    return;
  }

  event.respondWith(
    caches.open(IMAGE_CACHE).then(async (cache) => {
      const cached = await cache.match(request);

      const networkFetch = fetch(request)
        .then((response) => {
          if (response && (response.ok || response.type === 'opaque')) {
            cache.put(request, response.clone()).catch(() => {});
          }

          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
