const CACHE_NAME = 'finance-ar-v1';
const ASSETS_TO_CACHE = [
  '/finance-tracker/',
  '/finance-tracker/index.html',
  '/finance-tracker/manifest.json',
  '/finance-tracker/icon-192.png',
  '/finance-tracker/icon-512.png',
  // الموارد الخارجية
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap',
  'https://unpkg.com/lucide@latest'
];

// تثبيت الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Some assets failed to cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// تفعيل وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// استراتيجية: الشبكة أولاً، وإذا فشل نرجع للكاش
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // نسخ الرد للكاش لو كان ناجح
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: جرب الكاش
        return caches.match(event.request);
      })
  );
});
