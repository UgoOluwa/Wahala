"use client";

import { useEffect, useState } from "react";
import { flush, onReconnect } from "@/lib/transport";
import { outbox } from "@/lib/queue";
import { useLocale } from "./LocaleProvider";

/**
 * Drains the outbox whenever a bar comes back. The person who filed the report
 * should not have to reopen the app for it to leave the phone.
 */
export function OutboxBanner() {
  const { t } = useLocale();
  const [queued, setQueued] = useState(0);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const count = () => outbox.all().then((r) => setQueued(r.length)).catch(() => {});

    count();

    const drain = async () => {
      setOnline(true);
      await flush();
      await count();
    };
    const offReconnect = onReconnect(drain);
    const goOffline = () => setOnline(false);
    window.addEventListener("offline", goOffline);
    const id = setInterval(count, 5000);

    return () => {
      offReconnect();
      window.removeEventListener("offline", goOffline);
      clearInterval(id);
    };
  }, []);

  if (online && queued === 0) return null;

  return (
    <div className="sticky bottom-0 z-40 border-t border-line bg-raised px-4 py-2.5 text-center text-[13px]">
      {!online && <span className="font-medium text-pending">{t("outbox.offline")} </span>}
      <span className="text-muted">
        {queued > 0 ? t("outbox.waiting", { n: queued }) : t("outbox.nothing")}
      </span>
    </div>
  );
}
