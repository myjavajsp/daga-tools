var CACHE = 'daga-v30';

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

  // API 璇锋眰: 缃戠粶浼樺厛
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
    return;
  }

  // 闈欐€佽祫婧? 涓嶇紦瀛橈紝鐩存帴璇锋眰缃戠粶
  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
    return;
  }

  // HTML 椤甸潰: network-first
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match(e.request) || caches.match('/offline');
      })
    );
    return;
  }

  // 鍏朵粬: 涓嶇紦瀛?  e.respondWith(fetch(e.request, { cache: 'no-store' }));
});