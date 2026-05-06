const CACHE = 'booklaunch-v1';
const STATIC = [
  '/',
  '/static/css/styles.css',
  '/static/js/api.js',
  '/static/js/utils.js',
  '/static/js/app.js',
  '/static/js/tools/dashboard.js',
  '/static/js/tools/keywords.js',
  '/static/js/tools/bsr.js',
  '/static/js/tools/categories.js',
  '/static/js/tools/niche.js',
  '/static/js/tools/ads.js',
  '/static/js/tools/market.js',
  '/static/js/tools/lowcontent.js',
  '/static/js/tools/book.js',
  '/static/js/tools/profitgoal.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for API calls, cache-first for static assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/')) {
    // Network first, fall back to a friendly offline message
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline', message: 'Connect to the internet or run the local server.' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
  } else {
    // Cache first for UI assets
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
