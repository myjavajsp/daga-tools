var CACHE = 'daga-v29';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // API 请求: 网络优先
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
    return;
  }

  // 静态资源: 不缓存，直接请求网络
  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
    return;
  }

  // HTML 页面: network-first
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match(e.request) || caches.match('/offline');
      })
    );
    return;
  }

  // 其他: 不缓存
  e.respondWith(fetch(e.request, { cache: 'no-store' }));
});