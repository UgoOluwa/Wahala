"use client";

import { useEffect } from "react";

const CACHE = "wahala-v2";
const SHELL = ["/", "/report", "/report/immediate", "/report/detailed", "/report/contacts"];

/**
 * The page warms the cache; the service worker only serves it.
 *
 * Precaching from inside the install event turned out to be undebuggable — it
 * either ran or silently did not, with no way to see which from outside, and
 * the failure only showed up as a dead app in airplane mode on a real phone.
 * Here it is ordinary page code: observable, inspectable, and guaranteed to run
 * on a context that has actually loaded.
 */
async function warmCache() {
  if (typeof caches === "undefined") return;

  const cache = await caches.open(CACHE);
  const assets = new Set<string>();

  for (const route of SHELL) {
    try {
      const res = await fetch(route, { cache: "no-cache" });
      if (!res.ok) continue;
      const html = await res.clone().text();
      await cache.put(route, res);
      // Caching the HTML alone is useless: without the hashed chunks it imports,
      // the shell loads offline and then dies on the first import.
      for (const m of html.matchAll(/(?:src|href)="(\/_next\/[^"]+)"/g)) assets.add(m[1]);
    } catch {
      // One unreachable route must not stop the rest.
    }
  }

  await Promise.all(
    [...assets].map(async (url) => {
      if (await cache.match(url)) return;
      await cache.add(url).catch(() => undefined);
    }),
  );
}

export function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // An unregistered worker costs offline caching, not the report itself.
    });

    // Deferred: filling the cache must never compete with first paint, least of
    // all on the 2G connections this is built for.
    const id = window.setTimeout(() => {
      warmCache().catch(() => undefined);
    }, 2500);

    return () => window.clearTimeout(id);
  }, []);

  return null;
}
