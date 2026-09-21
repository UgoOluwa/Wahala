"use client";

import { useEffect } from "react";

/** Silent by necessity: this renders on the disguise too, and must show nothing. */
export function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // An unregistered worker costs offline caching, not the report itself.
    });
  }, []);

  return null;
}
