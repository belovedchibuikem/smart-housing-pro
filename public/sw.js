/* Smart Housing PWA service worker — Next.js App Router compatible */
const CACHE_VERSION = "smart-housing-v3"
const STATIC_CACHE = `${CACHE_VERSION}-static`
const OFFLINE_URL = "/offline.html"

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/branding/smarthousing-icon.svg",
  "/pwa/icon-192.png",
  "/pwa/icon-512.png",
  "/placeholder.svg",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("smart-housing-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" && request.headers.get("accept")?.includes("text/html"))
  )
}

function shouldBypassServiceWorker(request, url) {
  if (request.method !== "GET") return true
  if (url.origin !== self.location.origin) return true

  if (url.pathname.startsWith("/api/") || url.pathname.includes("/storage/")) return true
  if (url.pathname.startsWith("/_next/")) return true
  if (url.pathname.startsWith("/pwa/")) return true
  if (url.pathname.endsWith("/manifest.webmanifest")) return true

  if (request.headers.get("RSC") === "1") return true
  if (request.headers.get("Next-Router-Prefetch") === "1") return true
  if (request.headers.get("Next-Router-State-Tree")) return true
  if (request.headers.get("Purpose") === "prefetch") return true

  return false
}

async function offlineFallback() {
  const offline = await caches.match(OFFLINE_URL)
  if (offline) return offline
  return new Response("You are offline. Please check your connection and try again.", {
    status: 503,
    statusText: "Offline",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (shouldBypassServiceWorker(request, url)) return

  if (!isNavigationRequest(request)) return

  event.respondWith(
    fetch(request).catch(() => offlineFallback()),
  )
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
