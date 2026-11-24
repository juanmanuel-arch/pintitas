// Guarda la app en la tablet para que funcione sin internet.
const VERSION = 'pintitas-v7';
const ARCHIVOS = [
  './',
  'index.html',
  'estilos.css',
  'app.js',
  'plantillas.js',
  'juegos.js',
  'fotos.js',
  'creditos.html',
  'manifest.webmanifest',
  'icono-192.png',
  'icono-512.png',
];

// Las 100 fotos de animales (la lista está en fotos.js)
importScripts('fotos.js');
const FOTOS_APP = (self.FOTOS || []).map(f => `fotos/${f.id}.jpg`);

self.addEventListener('install', e => {
  // "reload": baja los archivos frescos, sin usar lo que el navegador tenga guardado
  e.waitUntil(caches.open(VERSION).then(async c => {
    await c.addAll(ARCHIVOS.map(a => new Request(a, { cache: 'reload' })));
    // Si alguna foto falla no se pierde todo lo demás
    await Promise.all(FOTOS_APP.map(f => c.add(new Request(f, { cache: 'reload' })).catch(() => {})));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Con internet trae la versión nueva; sin internet usa la guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Archivos de la app: siempre pregunta si hay versión nueva ("no-cache")
  const propio = new URL(e.request.url).origin === location.origin;
  const pedido = propio ? new Request(e.request.url, { cache: 'no-cache' }) : e.request;
  e.respondWith(
    fetch(pedido).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copia = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copia));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })
      .then(guardado => guardado || caches.match('index.html')))
  );
});
