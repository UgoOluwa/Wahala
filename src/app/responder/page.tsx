"use client";

import { useCallback, useEffect, useState } from "react";
import { INCIDENTS, type Report } from "@/lib/report";
import { routeFor } from "@/lib/referrals";
import { LOCALE_NAMES, t, type StringKey } from "@/lib/i18n";

const LABEL: Record<(typeof INCIDENTS)[number], string> = {
  physical: "Physical violence",
  threat: "Threat",
  kidnap: "Kidnapping",
  sexual: "Sexual abuse",
  followed: "Being followed",
  other: "Unspecified",
};

/**
 * Canned replies travel as keys, not prose. The desk works in English; the
 * person receiving it may not, and a reply they cannot read is not support.
 */
const CANNED: { key: StringKey; eta: number }[] = [
  { key: "reply.located", eta: 25 },
  { key: "reply.safeChannel", eta: 45 },
  { key: "reply.counsellor", eta: 120 },
];

export default function Responder() {
  const [reports, setReports] = useState<Report[]>([]);
  const [backend, setBackend] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [messageKey, setMessageKey] = useState<StringKey | null>(CANNED[0].key);
  const [custom, setCustom] = useState("");
  const [eta, setEta] = useState<number | "">(CANNED[0].eta);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/reports", { cache: "no-store" });
    const data = (await res.json()) as { reports: Report[]; backend: string };
    setReports(data.reports);
    setBackend(data.backend);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  async function reply(ref: string) {
    setBusy(true);
    await fetch(`/api/reports/${ref}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agency: routeFor(reports.find((r) => r.ref === ref)!.incident)[0]?.name ?? "Response desk",
        messageKey,
        message: messageKey ? t("en", messageKey) : custom,
        etaMinutes: eta === "" ? null : Number(eta),
      }),
    });
    await load();
    setBusy(false);
    setActive(null);
  }

  const open = reports.filter((r) => r.replies.length === 0);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-2 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Wahala — response desk</h1>
            <p className="text-[13px] text-muted">
              Simulated agency view. Seeded for demonstration; no real dispatch.
            </p>
          </div>
          <p className="font-mono text-[12px] text-muted">
            {open.length} awaiting · {reports.length} total · store: {backend}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        {reports.length === 0 ? (
          <p className="py-20 text-center text-muted">
            Nothing yet. File a report from the app and it appears here within four seconds.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reports.map((r) => {
              const answered = r.replies.length > 0;
              return (
                <li
                  key={r.ref}
                  className={`rounded-2xl border bg-surface p-5 ${
                    answered ? "border-line" : "border-danger/40"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest ${
                            r.urgency === "immediate"
                              ? "bg-danger text-white"
                              : "bg-raised text-muted"
                          }`}
                        >
                          {r.urgency}
                        </span>
                        <span className="font-semibold">{LABEL[r.incident]}</span>
                        <span className="font-mono text-[12px] text-muted">{r.ref}</span>
                        <span className="rounded bg-raised px-2 py-0.5 text-[12px] text-muted">
                          reads {LOCALE_NAMES[r.locale]}
                        </span>
                      </div>

                      {r.description && (
                        <p className="max-w-2xl pt-3 text-[15px] leading-relaxed">{r.description}</p>
                      )}
                      {r.involved && (
                        <p className="pt-1.5 text-sm text-muted">Involved: {r.involved}</p>
                      )}
                      {r.when && (
                        <p className="text-sm text-muted">
                          When: {t("en", r.when as StringKey)}
                        </p>
                      )}

                      {r.lat !== null && r.lon !== null ? (
                        <a
                          href={`https://www.google.com/maps?q=${r.lat},${r.lon}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block pt-2 font-mono text-[13px] text-safe underline underline-offset-4"
                        >
                          {r.lat.toFixed(5)}, {r.lon.toFixed(5)} · ±{r.accuracy ?? "?"}m
                        </a>
                      ) : (
                        <p className="pt-2 text-[13px] text-muted">No location attached</p>
                      )}
                    </div>

                    {!answered && (
                      <button
                        onClick={() => setActive(active === r.ref ? null : r.ref)}
                        className="rounded-xl bg-fg px-4 py-2.5 text-sm font-semibold text-ink"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>

                  {r.replies.map((reply, i) => (
                    <div key={i} className="mt-4 border-l-2 border-safe pl-4">
                      <p className="text-sm font-semibold">{reply.agency}</p>
                      <p className="text-[15px]">
                        {reply.messageKey ? t("en", reply.messageKey) : reply.message}
                      </p>
                      {reply.etaMinutes !== null && (
                        <p className="text-sm text-safe">ETA {reply.etaMinutes} min</p>
                      )}
                    </div>
                  ))}

                  {active === r.ref && (
                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-raised p-4">
                      <div className="flex flex-wrap gap-2">
                        {CANNED.map((c) => (
                          <button
                            key={c.key}
                            onClick={() => {
                              setMessageKey(c.key);
                              setEta(c.eta);
                            }}
                            aria-pressed={messageKey === c.key}
                            className={`rounded-full border px-3 py-1.5 text-[13px] ${
                              messageKey === c.key
                                ? "border-fg text-fg"
                                : "border-line text-muted hover:text-fg"
                            }`}
                          >
                            {t("en", c.key)}
                          </button>
                        ))}
                        <button
                          onClick={() => setMessageKey(null)}
                          aria-pressed={messageKey === null}
                          className={`rounded-full border px-3 py-1.5 text-[13px] ${
                            messageKey === null
                              ? "border-pending text-pending"
                              : "border-line text-muted hover:text-fg"
                          }`}
                        >
                          Write my own
                        </button>
                      </div>
                      {messageKey ? (
                        <p className="rounded-lg border border-line bg-surface px-3 py-2 text-[15px]">
                          {t(r.locale, messageKey)}
                          {r.locale !== "en" && (
                            <span className="block pt-1 text-[12px] text-muted">
                              This is what they will read, in {LOCALE_NAMES[r.locale]}.
                            </span>
                          )}
                        </p>
                      ) : (
                        <>
                          <textarea
                            value={custom}
                            onChange={(e) => setCustom(e.target.value)}
                            rows={2}
                            placeholder="Typed replies cannot be translated."
                            className="resize-none rounded-lg border border-pending/40 bg-surface px-3 py-2 text-[15px] focus:outline-none"
                          />
                          {r.locale !== "en" && (
                            <p className="text-[12px] text-pending">
                              This reporter reads {LOCALE_NAMES[r.locale]}. A typed reply
                              reaches them in English and is labelled as such.
                            </p>
                          )}
                        </>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-muted">
                          ETA (minutes)
                          <input
                            type="number"
                            min={0}
                            value={eta}
                            onChange={(e) =>
                              setEta(e.target.value === "" ? "" : Number(e.target.value))
                            }
                            className="w-24 rounded-lg border border-line bg-surface px-3 py-2 text-fg focus:outline-none"
                          />
                        </label>
                        <button
                          onClick={() => reply(r.ref)}
                          disabled={busy}
                          className="rounded-xl bg-safe px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
                        >
                          Send response
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
