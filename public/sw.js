// The app has to open when there is no network at all. Someone reaching for it
// in a compound with no signal cannot be met with a browser error page.

const CACHE = "wahala-v2";
const SHELL = ["/", "/report", "/report/immediate", "/report/detailed", "/report/contacts"];

/**
 * Caching the HTML alone is not enough: each page pulls a handful of hashed
 * JavaScript chunks, and without them the shell loads and then dies on the
 * first import. v1 did exactly that, which offline looked identical to the app
 * being broken. So read each page's HTML at install and cache what it asks for.
 */
async function precache() {
  const cache = await caches.open(CACHE);
  const assets = new Set();

  await Promise.all(
    SHELL.map(async (route) => {
      try {
        const res = await fetch(route, { cache: "reload" });
        if (!res.ok) return;
        const html = await res.clone().text();
        await cache.put(route, res);
        for (const m of html.matchAll(/(?:src|href)="(\/_next\/[^"]+)"/g)) assets.add(m[1]);
      } catch {
        // One unreachable route must not abort the whole install.
      }
    }),
  );

  await Promise.all(
    [...assets].map((url) => cache.add(url).catch(() => undefined)),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
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

  // Reports must never be served stale. A cached "no response yet" shown over a
  // reply that has since arrived would be a lie at the worst possible moment.
  if (url.pathname.startsWith("/api/")) return;

  // Build assets are content-hashed, so the URL changes whenever the bytes do.
  // Cache-first is therefore safe here and, unlike network-first, it still
  // works with the radio off.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => {
          // Exact page, then the triage screen, then the disguise. Anything of
          // ours beats the browser's offline page.
          return (
            (await caches.match(request)) ??
            (await caches.match("/report")) ??
            (await caches.match("/")) ??
            new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
          );
        }),
    );
    return;
  }

  // Everything else: network first, cache as the fallback.
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
