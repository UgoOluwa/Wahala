"use client";

import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { QuickExit } from "./QuickExit";
import { PrototypeBanner } from "./PrototypeBanner";
import { useLocale } from "./LocaleProvider";

export function Chrome({
  children,
  back,
  showLanguages = true,
}: {
  children: React.ReactNode;
  back?: string;
  showLanguages?: boolean;
}) {
  const { t } = useLocale();

  return (
    <div className="flex min-h-dvh flex-col">
      <PrototypeBanner label={t("banner.prototype")} />

      <header className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3">
        {back ? (
          <Link href={back} className="text-sm text-muted transition-colors hover:text-fg">
            ← {t("cta.back")}
          </Link>
        ) : (
          <span />
        )}
        <QuickExit label={t("cta.exit")} />
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-10">{children}</main>

      {showLanguages && (
        <footer className="mx-auto w-full max-w-md px-4 pb-8 pt-2">
          <LanguageSwitcher />
        </footer>
      )}
    </div>
  );
}
