"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome } from "@/components/Chrome";
import { useLocale } from "@/components/LocaleProvider";
import { getFix, type Fix } from "@/lib/geo";
import { newCallbackCode, newRef, type Report } from "@/lib/report";
import { send } from "@/lib/transport";

const ARM_MINUTES = 10;

export default function Immediate() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [fix, setFix] = useState<Fix | null>(null);
  const [locating, setLocating] = useState(true);
  const [sending, setSending] = useState(false);
  const sent = useRef(false);

  // Start the GPS the moment the screen opens, not when the button is pressed.
  // A fix can take eight seconds; the person pressing the button does not have
  // eight seconds to spare.
  useEffect(() => {
    getFix().then((f) => {
      setFix(f);
      setLocating(false);
    });
  }, []);

  async function fire(armMinutes?: number) {
    if (sent.current) return;
    sent.current = true;
    setSending(true);

    // Whatever fix exists right now is the one that goes. Waiting for a better
    // one is a luxury this screen does not have.
    const report: Report = {
      ref: newRef(),
      incident: "other",
      urgency: "immediate",
      locale,
      mode: "covert",
      lat: fix?.lat ?? null,
      lon: fix?.lon ?? null,
      accuracy: fix?.accuracy ?? null,
      createdAt: Date.now(),
      replies: [],
      callbackCode: newCallbackCode(),
      armedUntil: armMinutes ? Date.now() + armMinutes * 60_000 : undefined,
    };

    const delivery = await send(report);
    sessionStorage.setItem(`hlp.report.${report.ref}`, JSON.stringify(report));
    router.replace(`/status/${report.ref}?d=${delivery}`);
  }

  return (
    <Chrome back="/report" showLanguages={false}>
      <div className="flex min-h-[70dvh] flex-col">
        <div className="pt-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t("cta.help")}</h1>
          <p className="pt-2 text-[15px] leading-relaxed text-muted">{t("receipt.silent")}</p>
        </div>

        {/* The button owns the thumb zone and nothing competes with it. */}
        <div className="flex flex-1 items-center justify-center py-10">
          <button
            onClick={() => fire()}
            disabled={sending}
            aria-label={t("cta.help")}
            className="relative aspect-square w-56 rounded-full bg-danger text-lg font-semibold text-white shadow-[0_0_60px_-12px] shadow-danger/60 transition-transform active:scale-[0.97] disabled:opacity-70"
          >
            {sending ? t("flow.sending") : t("cta.help")}
          </button>
        </div>

        {/* Registered with the server the moment it is armed, so it survives the
            phone being taken. */}
        <button
          onClick={() => fire(ARM_MINUTES)}
          disabled={sending}
          className="tap mb-3 w-full rounded-xl border border-pending/40 bg-pending/5 px-4 text-left disabled:opacity-60"
        >
          <span className="block py-3">
            <span className="block text-sm font-semibold text-pending">
              {t("arm.cta", { n: ARM_MINUTES })}
            </span>
            <span className="block pt-1 text-[13px] leading-relaxed text-muted">
              {t("arm.body", { n: ARM_MINUTES })}
            </span>
          </span>
        </button>

        <div className="rounded-xl border border-line bg-surface px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                locating ? "bg-pending" : fix ? "bg-safe" : "bg-muted"
              }`}
            />
            <span className="text-muted">
              {locating ? t("flow.locating") : fix ? t("flow.located") : t("flow.noLocation")}
            </span>
          </div>
          {fix && (
            <p className="pt-1.5 font-mono text-[12px] text-muted/70">
              {fix.lat.toFixed(5)}, {fix.lon.toFixed(5)} · ±{Math.round(fix.accuracy)}m
            </p>
          )}
        </div>
      </div>
    </Chrome>
  );
}
