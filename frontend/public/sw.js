// Service worker de Alquiler de vivienda: hace instalable la app (PWA) y
// muestra una página propia cuando no hay conexión.
//
// Solo guarda la cáscara: los archivos de la aplicación (JS, CSS, íconos) y la
// página sin conexión. La API (otro dominio: Render), el chat y cualquier dato
// del usuario siempre van a la red y nunca quedan guardados en el dispositivo.
// Nada corre en segundo plano (sin sincronización ni notificaciones push).
const CACHE = 'colombiatech-v1'
const OFFLINE = '/offline.html'
const PRECARGA = [OFFLINE, '/icono.svg', '/icono-192.png', '/manifest.webmanifest']

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECARGA)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request
  if (pedido.method !== 'GET') return
  const url = new URL(pedido.url)
  if (url.origin !== self.location.origin) return

  // Navegación: siempre a la red; sin conexión, la página propia.
  if (pedido.mode === 'navigate') {
    evento.respondWith(fetch(pedido).catch(() => caches.match(OFFLINE)))
    return
  }

  // Archivos de la aplicación: red primero (siempre la versión desplegada) y
  // caché solo como respaldo sin conexión.
  if (url.pathname.startsWith('/assets/') || /\.(svg|png|ico|webmanifest)$/.test(url.pathname)) {
    evento.respondWith(
      fetch(pedido)
        .then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone()
            caches.open(CACHE).then((c) => c.put(pedido, copia))
          }
          return respuesta
        })
        .catch(() => caches.match(pedido))
    )
  }
})
