var CACHE_NAME = 'nodemago-v2';
var CACHE_URLS = [
  '/nodemago/'
];
// インストール時にHTMLをキャッシュ
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});
// 古いキャッシュを削除
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});
// リクエスト時：オンラインなら最新を取得・オフライン時はキャッシュを返す
self.addEventListener('fetch', function(e) {
  // HTMLファイルのみキャッシュ対象
  if (e.request.url.indexOf('index.html') !== -1) {
    e.respondWith(
      fetch(e.request)
        .then(function(response) {
          // オンライン時：最新を取得してキャッシュを更新
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
          return response;
        })
        .catch(function() {
          // オフライン時：キャッシュから返す
          return caches.match(e.request);
        })
    );
  }
});
