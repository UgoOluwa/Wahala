"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LOCALES, t as translate, type Locale, type StringKey } from "@/lib/i18n";

const KEY = "hlp.locale";

const Ctx = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (k: StringKey, params?: Record<string, string | number>) => string;
}>({ locale: "en", setLocale: () => {}, t: (k, p) => translate("en", k, p) });

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved && (LOCALES as readonly string[]).includes(saved)) {
      setLocaleState(saved as Locale);
      return;
    }
    // Fall in behind the phone's own language before asking anyone to choose.
    const guess = LOCALES.find((l) => navigator.language?.toLowerCase().startsWith(l));
    if (guess) setLocaleState(guess);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(KEY, l);
  }, []);

  const t = useCallback(
    (k: StringKey, params?: Record<string, string | number>) => translate(locale, k, params),
    [locale],
  );

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export const useLocale = () => useContext(Ctx);
