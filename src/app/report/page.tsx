"use client";

import Link from "next/link";
import { Chrome } from "@/components/Chrome";
import { useLocale } from "@/components/LocaleProvider";

export default function Triage() {
  const { t } = useLocale();

  return (
    <Chrome>
      <h1 className="rise pb-1 pt-2 text-2xl font-semibold tracking-tight">
        {t("incident.prompt")}
      </h1>
      <p className="rise pb-7 text-[15px] leading-relaxed text-muted">
        {t("receipt.silent")}
      </p>

      <div className="flex flex-col gap-3">
        {/* Immediate danger leads, and is visually heaviest, because the person
            who needs it has the least attention to spare on reading. */}
        <Link
          href="/report/immediate"
          className="rise group rounded-2xl border border-danger/40 bg-danger-dim p-5 transition-colors hover:border-danger"
        >
          <div className="flex items-center gap-2 pb-1.5">
            <span className="h-2 w-2 rounded-full bg-danger" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-danger">
              {t("triage.nowTag")}
            </span>
          </div>
          <div className="text-lg font-semibold">{t("triage.immediateTitle")}</div>
          <p className="pt-1 text-sm leading-relaxed text-muted">{t("triage.immediateBody")}</p>
        </Link>

        <Link
          href="/report/detailed"
          className="rise rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-muted"
        >
          <div className="flex items-center gap-2 pb-1.5">
            <span className="h-2 w-2 rounded-full bg-muted" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">
              {t("triage.reportTag")}
            </span>
          </div>
          <div className="text-lg font-semibold">{t("triage.detailedTitle")}</div>
          <p className="pt-1 text-sm leading-relaxed text-muted">{t("triage.detailedBody")}</p>
        </Link>
      </div>

      <Link
        href="/report/contacts"
        className="mt-5 block rounded-xl border border-line bg-surface px-5 py-4 text-sm text-muted transition-colors hover:text-fg"
      >
        {t("contacts.title")} →
      </Link>
    </Chrome>
  );
}
