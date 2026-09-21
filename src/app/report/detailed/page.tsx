"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome } from "@/components/Chrome";
import { useLocale } from "@/components/LocaleProvider";
import { getFix } from "@/lib/geo";
import { INCIDENTS, newRef, type Incident, type Report } from "@/lib/report";
import { send } from "@/lib/transport";
import { routeFor } from "@/lib/referrals";
import type { StringKey } from "@/lib/i18n";

const WHEN = ["Happening now", "Today", "This week", "Earlier"];

export default function Detailed() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [incident, setIncident] = useState<Incident>("physical");
  const [description, setDescription] = useState("");
  const [involved, setInvolved] = useState("");
  const [when, setWhen] = useState(WHEN[0]);
  const [shareLocation, setShareLocation] = useState(true);
  const [busy, setBusy] = useState(false);

  const route = routeFor(incident);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    const fix = shareLocation ? await getFix(6000) : null;

    const report: Report = {
      ref: newRef(),
      incident,
      urgency: "considered",
      locale,
      mode: "covert",
      lat: fix?.lat ?? null,
      lon: fix?.lon ?? null,
      accuracy: fix?.accuracy ?? null,
      createdAt: Date.now(),
      description: description.trim() || undefined,
      involved: involved.trim() || undefined,
      when,
      replies: [],
    };

    const delivery = await send(report);
    sessionStorage.setItem(`hlp.report.${report.ref}`, JSON.stringify(report));
    router.replace(`/status/${report.ref}?d=${delivery}`);
  }

  return (
    <Chrome back="/report">
      <form onSubmit={submit} className="flex flex-col gap-7 pt-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("incident.prompt")}</h1>
          {/* Asking for nothing that identifies the reporter is the point, so it
              is stated rather than left to be assumed. */}
          <p className="pt-2 text-[15px] leading-relaxed text-muted">
            No name, no phone number, no account. Only what you type below is sent.
          </p>
        </div>

        <fieldset className="flex flex-wrap gap-2">
          {INCIDENTS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIncident(i)}
              aria-pressed={incident === i}
              className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                incident === i
                  ? "border-danger bg-danger-dim text-fg"
                  : "border-line bg-surface text-muted hover:text-fg"
              }`}
            >
              {t(`incident.${i}` as StringKey)}
            </button>
          ))}
        </fieldset>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">What happened?</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Say as much or as little as you want."
            className="resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed placeholder:text-muted/50 focus:border-muted focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Who is involved?</span>
          <input
            value={involved}
            onChange={(e) => setInvolved(e.target.value)}
            placeholder="A name, or how you know them."
            className="tap rounded-xl border border-line bg-surface px-4 text-[15px] placeholder:text-muted/50 focus:border-muted focus:outline-none"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <span className="text-sm font-medium">When?</span>
          <div className="flex flex-wrap gap-2">
            {WHEN.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWhen(w)}
                aria-pressed={when === w}
                className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                  when === w
                    ? "border-fg bg-fg text-ink"
                    : "border-line bg-surface text-muted hover:text-fg"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
          <input
            type="checkbox"
            checked={shareLocation}
            onChange={(e) => setShareLocation(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-[#e5484d]"
          />
          <span className="text-sm leading-relaxed">
            Send my location
            <span className="block text-muted">
              Turn this off if being located would put you in more danger.
            </span>
          </span>
        </label>

        {/* Showing the destination before sending is the difference between
            shouting into the void and a pathway the person can see. */}
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
            This goes to
          </p>
          <ul className="flex flex-col gap-1.5">
            {route.map((r) => (
              <li key={r.id} className="text-sm">
                <span className="font-medium">{r.name}</span>
                <span className="block text-[13px] text-muted">{r.remit}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="tap rounded-xl bg-danger px-5 text-base font-semibold text-white transition-transform active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? t("flow.sending") : t("cta.help")}
        </button>
      </form>
    </Chrome>
  );
}
