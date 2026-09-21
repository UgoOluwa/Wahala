"use client";

import { LOCALES, LOCALE_NAMES } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Language">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-3 py-1.5 text-[13px] transition-colors ${
            locale === l
              ? "bg-fg text-ink font-medium"
              : "bg-raised text-muted hover:text-fg border border-line"
          }`}
        >
          {LOCALE_NAMES[l]}
        </button>
      ))}
    </div>
  );
}
