// HYROX Solo service worker — app-shell offline cache
const CACHE = "hyrox-solo-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // App shell + same-origin: cache-first, fall back to network then cache the result.
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      // cache same-origin successful responses for next time
      try {
        const url = new URL(req.url);
        if (url.origin === self.location.origin && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
      } catch (_) {}
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
