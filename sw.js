/* 90 Days to Agentic AI Engineer — service worker
 *
 * Bump CACHE_VERSION whenever you republish. Visitors with the old version
 * open get an "Update available" banner instead of a silently stale page.
 *
 * Paths are all relative, so this works from a GitHub Pages project
 * subfolder (username.github.io/repo/) as well as from a domain root.
 */

const CACHE_VERSION = "v2";
const CACHE_NAME = "agentic90-" + CACHE_VERSION;

// Everything needed to run the app with no network at all.
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // addAll() is all-or-nothing; cache items individually so one missing
      // icon can't stop the whole worker from installing.
      Promise.all(
        APP_SHELL.map(url =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => null)
        )
      )
    )
  );
  // Note: no skipWaiting() here on purpose. The new worker waits until the
  // user accepts the update banner, so the page never swaps out mid-session.
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(k => k.startsWith("agentic90-") && k !== CACHE_NAME)
          .map(k => caches.delete(k))
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })()
  );
});

// The page asks us to activate immediately once the user clicks "Reload".
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;

  // Never touch non-GET, and never touch the external documentation links —
  // those should always go straight to the network.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network first, so a fresh deploy is picked up immediately,
  // with the cached shell as the offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          if (preload) {
            const cache = await caches.open(CACHE_NAME);
            cache.put("./index.html", preload.clone());
            return preload;
          }
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put("./index.html", fresh.clone());
          return fresh;
        } catch (err) {
          const cache = await caches.open(CACHE_NAME);
          return (
            (await cache.match("./index.html")) ||
            (await cache.match("./")) ||
            new Response(
              "<h1>Offline</h1><p>Open this page online once and it will work offline afterwards.</p>",
              { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
            )
          );
        }
      })()
    );
    return;
  }

  // Static same-origin assets (icons, manifest): cache first, refresh in place.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.status === 200 && fresh.type === "basic") {
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (err) {
        return new Response("", { status: 504, statusText: "Offline" });
      }
    })()
  );
});
