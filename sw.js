const CACHE_NAME = 'campo-smart-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'app.js',
  'logo.png',
  'manifest.json'
];

// Instalar la app y guardar los archivos en la memoria interna del móvil
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Hacer que la app responda usando la memoria interna si no hay señal
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
