// Кэшируем статические ресурсы
const staticAssets = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Устанавливаем Service Worker
self.addEventListener('install', async event => {
  const cache = await caches.open('static-cache');
  cache.addAll(staticAssets);
});

// Перехватываем сетевые запросы
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req));
  } else {
    event.respondWith(networkFirst(req));
  }
});

// Стратегия "сначала кэш"
async function cacheFirst(req) {
  const cachedResponse = await caches.match(req);
  return cachedResponse || fetch(req);
}

// Стратегия "сначала сеть"
async function networkFirst(req) {
  const cache = await caches.open('dynamic-cache');

  try {
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch (error) {
    const cachedResponse = await cache.match(req);
    return cachedResponse || await caches.match('/offline.html');
  }
}