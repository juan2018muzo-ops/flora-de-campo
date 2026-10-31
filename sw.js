/*
 * Service worker: guarda una copia de la aplicación para que funcione sin conexión.
 *
 * Estrategia: responde primero desde la copia guardada (rápido y sin señal) y, si hay
 * conexión, la actualiza en segundo plano; los cambios se ven en la siguiente apertura.
 * Al publicar una versión nueva, cambie VERSION para descartar la copia anterior.
 *
 * Los datos (especies, estaciones y fotos) no pasan por aquí: viven en IndexedDB.
 */

const VERSION = "flora-v1";
const ARCHIVOS = [
  "./",
  "index.html",
  "manifest.json",
  "css/styles.css",
  "css/print.css",
  "img/icono.svg",
  "img/icono-192.png",
  "img/icono-512.png",
  "js/caracteres.js",
  "js/db.js",
  "js/app.js",
  "js/morfologia.js",
  "js/ilustraciones.js",
  "js/glosario.js",
  "js/selector.js",
  "js/identificar.js",
  "js/catalogo.js",
  "js/album.js",
  "js/clave.js",
  "js/registro.js"
];

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  ev.respondWith(caches.open(VERSION).then(async cache => {
    // Las páginas se buscan siempre como index.html (la app usa #rutas).
    const clave = req.mode === "navigate" ? "index.html" : req;
    const guardada = await cache.match(clave, { ignoreSearch: true });
    const red = fetch(req).then(res => {
      if (res.ok) cache.put(clave, res.clone());
      return res;
    }).catch(() => null);
    if (guardada) {
      ev.waitUntil(red);
      return guardada;
    }
    return (await red) || new Response("Sin conexión y sin copia guardada de este archivo.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }));
});
