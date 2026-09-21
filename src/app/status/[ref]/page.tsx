"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { LocaleProvider, useLocale } from "@/components/LocaleProvider";
import { Chrome } from "@/components/Chrome";
import { routeFor } from "@/lib/referrals";
import { guidanceFor } from "@/lib/guidance";
import { alertHref, contacts, type Contact } from "@/lib/contacts";
import { flush, onReconnect, smsHref } from "@/lib/transport";
import { isLive, type Delivery, type Report } from "@/lib/report";
import type { StringKey } from "@/lib/i18n";

type Translate = (k: StringKey, p?: Record<string, string | number>) => string;

function relative(ts: number, t: Translate): string {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return t("time.justNow");
  if (mins === 1) return t("time.minute");
  if (mins < 60) return t("time.minutes", { n: mins });
  return t("time.hours", { n: Math.round(mins / 60) });
}

function Status() {
  const { t, locale } = useLocale();
  const params = useParams<{ ref: string }>();
  const search = useSearchParams();
  const ref = params.ref;

  const [local, setLocal] = useState<Report | null>(null);
  const [server, setServer] = useState<Report | null>(null);
  const [delivery, setDelivery] = useState<Delivery>((search.get("d") as Delivery) ?? "queued");
  const [people, setPeople] = useState<Contact[]>([]);

  useEffect(() => setPeople(contacts.all()), []);

  // Drives the countdown. One second, because a dead-man's switch that appears
  // frozen is one the person cannot trust to be counting at all.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  async function cancelArmed(ref: string) {
    await fetch(`/api/reports/${ref}/cancel`, { method: "POST" });
    await poll();
  }

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

  // The server strips the callback code, so it can only come from the copy this
  // device kept when the report was filed.
  const callbackCode = local?.callbackCode;
  const report = server ?? local;
  if (!report) {
    return (
      <Chrome showLanguages={false}>
        <p className="pt-10 text-center text-muted">{t("status.loading")}</p>
      </Chrome>
    );
  }

  const route = routeFor(report.incident);
  const latest = report.replies.at(-1);

  const pending = Boolean(report.armedUntil) && !report.cancelled && !isLive(report);
  const remaining = report.armedUntil ? Math.max(0, report.armedUntil - Date.now()) : 0;
  const clock = `${Math.floor(remaining / 60000)}:${String(
    Math.floor((remaining % 60000) / 1000),
  ).padStart(2, "0")}`;

  return (
    <Chrome showLanguages={false}>
      <div className="flex flex-col gap-5 pt-2">
        {pending && (
          <section className="rise rounded-2xl border border-pending/40 bg-pending/5 p-5">
            <p className="pb-2 text-[11px] font-semibold uppercase tracking-widest text-pending">
              {t("arm.title")}
            </p>
            <p className="font-mono text-4xl font-semibold tabular-nums">{clock}</p>
            <p className="pt-2 text-[14px] leading-relaxed text-muted">
              {t("arm.armed", { t: clock })}
            </p>
            <button
              onClick={() => cancelArmed(report.ref)}
              className="tap mt-4 w-full rounded-xl bg-fg px-5 font-semibold text-ink"
            >
              {t("arm.cancel")}
            </button>
          </section>
        )}

        {report.cancelled && (
          <section className="rise rounded-2xl border border-line bg-surface p-5">
            <p className="text-[15px] leading-relaxed text-muted">{t("arm.cancelled")}</p>
          </section>
        )}

        {report.armedUntil && !report.cancelled && isLive(report) && (
          <p className="rounded-xl border border-danger/30 bg-danger-dim px-4 py-3 text-[14px]">
            {t("arm.fired")}
          </p>
        )}

        {/* The receipt is the whole reassurance. It is silent and it is on screen,
            which is the only channel that is safe to use. */}
        <section className="rise rounded-2xl border border-safe/30 bg-safe/5 p-5">
          <div className="flex items-center gap-2 pb-2">
            <span className="h-2 w-2 rounded-full bg-safe" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-safe">
              {delivery === "sent" ? t("status.receivedTag") : t("status.savedTag")}
            </span>
          </div>
          <p className="text-[15px] leading-relaxed">
            {delivery === "sent" ? t("status.sent") : t("status.queued")}
          </p>
          <p className="pt-3 text-[13px] text-muted">
            {t("receipt.ref")} <span className="font-mono text-fg">{report.ref}</span> ·{" "}
            {relative(report.createdAt, t)}
          </p>
        </section>

        {callbackCode && (
          <section className="rise rounded-2xl border border-line bg-surface p-5">
            <p className="pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
              {t("verify.codeTitle")}
            </p>
            <p className="font-mono text-4xl font-semibold tracking-[0.2em] text-fg">
              {callbackCode}
            </p>
            <p className="pt-3 text-[14px] leading-relaxed text-muted">{t("verify.codeBody")}</p>
          </section>
        )}

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

        {people.length > 0 && report.lat !== null && report.lon !== null && (
          <section className="rounded-2xl border border-line bg-surface p-5">
            <p className="pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
              {t("contacts.alert")}
            </p>
            <p className="pb-3 text-[14px] leading-relaxed text-muted">
              {t("contacts.alertBody", { n: people.length })}
            </p>
            <a
              href={alertHref(
                people,
                t("contacts.smsBody", {
                  url: `https://www.google.com/maps?q=${report.lat},${report.lon}`,
                  ref: report.ref,
                }),
              )}
              className="tap inline-flex items-center rounded-xl bg-fg px-5 font-semibold text-ink"
            >
              {t("contacts.alert")}
            </a>
          </section>
        )}

        {/* The responder thread. Empty until an agency picks it up, and honest
            about that rather than faking activity. */}
        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="pb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
            {t("status.responseTag")}
          </p>

          {report.replies.length === 0 ? (
            <p className="text-[15px] leading-relaxed text-muted">{t("status.noResponse")}</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {report.replies.map((r, i) => (
                <li
                  key={i}
                  // The bar carries the same verdict as the badge. A green rail
                  // beside an "unverified" label is a mixed signal at the exact
                  // moment the person is deciding whether to open a door.
                  className={`rise border-l-2 pl-4 ${r.verified ? "border-safe" : "border-danger"}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{r.agency}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        r.verified ? "bg-safe/15 text-safe" : "bg-danger-dim text-danger"
                      }`}
                    >
                      {r.verified ? t("verify.verified") : t("verify.unverified")}
                    </span>
                  </div>
                  <p className="pt-1 text-[15px] leading-relaxed">
                    {r.messageKey ? t(r.messageKey) : r.message}
                  </p>
                  {!r.messageKey && locale !== "en" && (
                    <p className="pt-1 text-[12px] italic text-muted">{t("reply.untranslated")}</p>
                  )}
                  {r.etaMinutes !== null && (
                    <p className="pt-2 text-sm font-medium text-safe">
                      {t("status.eta", { n: r.etaMinutes })}
                    </p>
                  )}
                  <p className="pt-1 text-[12px] text-muted">{relative(r.at, t)}</p>
                </li>
              ))}
            </ul>
          )}

          {latest?.etaMinutes != null && (
            <p className="mt-4 rounded-lg bg-raised px-3 py-2 text-[13px] text-muted">
              {t("status.fallback", { ref: report.ref })}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="pb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
            {t("safety.heading")}
          </p>
          <ol className="flex flex-col gap-3">
            {guidanceFor(report.incident).map((key, i) => (
              <li key={key} className="flex gap-3 text-[15px] leading-relaxed">
                <span className="shrink-0 font-mono text-[13px] text-muted">{i + 1}</span>
                <span>{t(key)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="pb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
            {t("status.whoHas")}
          </p>
          <ul className="flex flex-col gap-3">
            {route.map((r) => (
              <li key={r.id}>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-[13px] leading-relaxed text-muted">
                  {t(r.remitKey)} · {t(r.coverageKey)}
                </p>
                {r.phone ? (
                  <a href={`tel:${r.phone}`} className="text-[13px] font-medium text-safe">
                    {t("status.call", { phone: r.phone })}
                  </a>
                ) : (
                  <p className="text-[12px] text-muted/70">{t("status.unverified")}</p>
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
