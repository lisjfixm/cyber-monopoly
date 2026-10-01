const CACHE_NAME = 'cyber-monopoly-v1';
const STATIC_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API 请求走网络，不缓存
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/openapi/')) {
    return;
  }

  // 静态资源：网络优先，失败回退缓存
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 缓存新的响应
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => {
        if (cached) return cached;
        // 导航请求回退到首页（SPA）
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        return undefined;
      }))
  );
});
