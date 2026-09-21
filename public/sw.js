// The app has to open when there is no network at all. Someone reaching for it
// in a compound with no signal cannot be met with a dinosaur.

const CACHE = "wahala-v1";
const SHELL = ["/", "/report", "/report/immediate", "/report/detailed"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Individually, so one failed route cannot abort the whole install.
      .then((c) => Promise.allSettled(SHELL.map((url) => c.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Reports must never be served stale — a cached "no response yet" shown over a
  // real one that has since arrived would be a lie at the worst moment.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit ?? caches.match("/report"))),
    );
    return;
  }

  // Network first, cache only as the fallback. Serving a cached asset first is
  // the faster strategy, but it also serves yesterday's JavaScript to someone
  // who just reloaded to get a fix — and during a build-and-test cycle that is
  // indistinguishable from the fix not working. Offline still works: the cache
  // answers the moment the network does not.
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request)),
  );
});
