// Cambiar la versión invalida el caché de todos los clientes en el próximo deploy.
const CACHE_NAME = "legalia-v3";
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/offline",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Solo estas páginas (públicas) se guardan en caché. Las del workspace
// (expedientes, escritos, portal del cliente) NUNCA se persisten en disco.
const PAGINAS_CACHEABLES = [/^\/$/, /^\/login$/, /^\/offline$/, /^\/herramientas(\/|$)/, /^\/terminos$/, /^\/privacidad$/];

// Install: precache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map((u) =>
          fetch(u).then((r) => { if (r.ok) return cache.put(u, r); }).catch(() => undefined)
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API/pages, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // API routes: always network
  if (url.pathname.startsWith("/api/")) return;

  // Static assets (icons, fonts, images): cache-first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpg|svg|woff2?|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // Pages: network-first; solo las públicas se guardan; el resto cae a /offline.
  const cacheable = PAGINAS_CACHEABLES.some((re) => re.test(url.pathname));
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (cacheable && response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => (cacheable ? caches.match(request) : Promise.resolve(undefined)).then((cached) => cached || caches.match(OFFLINE_URL)))
  );
});
