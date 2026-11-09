// Guarda la app en la tablet para que funcione sin internet.
const VERSION = 'pintitas-v2';
const ARCHIVOS = [
  './',
  'index.html',
  'estilos.css',
  'app.js',
  'plantillas.js',
  'manifest.webmanifest',
  'icono-192.png',
  'icono-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Con internet trae la versión nueva; sin internet usa la guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copia = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copia));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })
      .then(guardado => guardado || caches.match('index.html')))
  );
});
