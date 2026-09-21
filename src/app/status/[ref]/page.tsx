"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { LocaleProvider, useLocale } from "@/components/LocaleProvider";
import { Chrome } from "@/components/Chrome";
import { routeFor } from "@/lib/referrals";
import { flush, onReconnect, smsHref } from "@/lib/transport";
import type { Delivery, Report } from "@/lib/report";

function relative(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;
  return `${Math.round(mins / 60)}h ago`;
}

function Status() {
  const { t } = useLocale();
  const params = useParams<{ ref: string }>();
  const search = useSearchParams();
  const ref = params.ref;

  const [local, setLocal] = useState<Report | null>(null);
  const [server, setServer] = useState<Report | null>(null);
  const [delivery, setDelivery] = useState<Delivery>((search.get("d") as Delivery) ?? "queued");

  useEffect(() => {
    const cached = sessionStorage.getItem(`hlp.report.${ref}`);
    if (cached) setLocal(JSON.parse(cached) as Report);
  }, [ref]);

  /**
   * Polling, deliberately. A push notification is exactly the thing that gets
   * someone hurt — this screen never rings, never vibrates, never changes the
   * tab title. The reply is simply here when they next look.
   */
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${ref}`, { cache: "no-store" });
      if (!res.ok) return;
      const { report } = (await res.json()) as { report: Report };
      setServer(report);
      setDelivery("sent");
    } catch {
      // Offline. The outbox still holds it; nothing to surface here.
    }
  }, [ref]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [poll]);

  useEffect(() => onReconnect(() => flush().then(poll)), [poll]);

  const report = server ?? local;
  if (!report) {
    return (
      <Chrome showLanguages={false}>
        <p className="pt-10 text-center text-muted">Loading…</p>
      </Chrome>
    );
  }

  const route = routeFor(report.incident);
  const latest = report.replies.at(-1);

  return (
    <Chrome showLanguages={false}>
      <div className="flex flex-col gap-5 pt-2">
        {/* The receipt is the whole reassurance. It is silent and it is on screen,
            which is the only channel that is safe to use. */}
        <section className="rise rounded-2xl border border-safe/30 bg-safe/5 p-5">
          <div className="flex items-center gap-2 pb-2">
            <span className="h-2 w-2 rounded-full bg-safe" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-safe">
              {delivery === "sent" ? "Received" : "Saved"}
            </span>
          </div>
          <p className="text-[15px] leading-relaxed">
            {delivery === "sent" ? t("status.sent") : t("status.queued")}
          </p>
          <p className="pt-3 text-[13px] text-muted">
            {t("receipt.ref")} <span className="font-mono text-fg">{report.ref}</span> ·{" "}
            {relative(report.createdAt)}
          </p>
        </section>

        {delivery !== "sent" && (
          <section className="rounded-2xl border border-pending/30 bg-pending/5 p-5">
            <p className="pb-3 text-[15px] leading-relaxed">{t("status.sms")}</p>
            <a
              href={smsHref(report)}
              className="tap inline-flex items-center rounded-xl bg-pending px-5 font-semibold text-ink"
            >
              {t("cta.sms")}
            </a>
          </section>
        )}

        {/* The responder thread. Empty until an agency picks it up, and honest
            about that rather than faking activity. */}
        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="pb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
            Response
          </p>

          {report.replies.length === 0 ? (
            <p className="text-[15px] leading-relaxed text-muted">
              No one has picked this up yet. This page updates itself — nothing will
              ring or buzz.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {report.replies.map((r, i) => (
                <li key={i} className="rise border-l-2 border-safe pl-4">
                  <p className="text-sm font-semibold">{r.agency}</p>
                  <p className="pt-1 text-[15px] leading-relaxed">{r.message}</p>
                  {r.etaMinutes !== null && (
                    <p className="pt-2 text-sm font-medium text-safe">
                      Expected with you in about {r.etaMinutes} minutes
                    </p>
                  )}
                  <p className="pt-1 text-[12px] text-muted">{relative(r.at)}</p>
                </li>
              ))}
            </ul>
          )}

          {latest?.etaMinutes != null && (
            <p className="mt-4 rounded-lg bg-raised px-3 py-2 text-[13px] text-muted">
              If no one reaches you by then, call 112 and quote {report.ref}.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="pb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
            Who has this
          </p>
          <ul className="flex flex-col gap-3">
            {route.map((r) => (
              <li key={r.id}>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-[13px] leading-relaxed text-muted">
                  {r.remit} · {r.coverage}
                </p>
                {r.phone ? (
                  <a href={`tel:${r.phone}`} className="text-[13px] font-medium text-safe">
                    Call {r.phone}
                  </a>
                ) : (
                  <p className="text-[12px] text-muted/70">Hotline not verified in this prototype</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Chrome>
  );
}

export default function Page() {
  return (
    <LocaleProvider>
      <Suspense>
        <Status />
      </Suspense>
    </LocaleProvider>
  );
}
