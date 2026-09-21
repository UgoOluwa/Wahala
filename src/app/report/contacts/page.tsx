"use client";

import { useEffect, useState } from "react";
import { Chrome } from "@/components/Chrome";
import { useLocale } from "@/components/LocaleProvider";
import { contacts, type Contact } from "@/lib/contacts";

export default function Contacts() {
  const { t } = useLocale();
  const [list, setList] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => setList(contacts.all()), []);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setList(contacts.add(name, phone));
    setName("");
    setPhone("");
  }

  return (
    <Chrome back="/report">
      <div className="flex flex-col gap-6 pt-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("contacts.title")}</h1>
          <p className="pt-2 text-[15px] leading-relaxed text-muted">{t("contacts.body")}</p>
        </div>

        {list.length === 0 ? (
          <p className="text-[15px] text-muted">{t("contacts.none")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {list.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <span>
                  <span className="block font-medium">{c.name}</span>
                  <span className="block font-mono text-[13px] text-muted">{c.phone}</span>
                </span>
                <button
                  onClick={() => setList(contacts.remove(c.id))}
                  className="rounded-lg border border-line px-3 py-2 text-[13px] text-muted transition-colors hover:border-danger hover:text-danger"
                >
                  {t("contacts.remove")}
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={add} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
          <p className="text-sm font-medium">{t("contacts.add")}</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("contacts.name")}
            className="tap rounded-xl border border-line bg-ink px-4 text-[15px] placeholder:text-muted/50 focus:border-muted focus:outline-none"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("contacts.phone")}
            inputMode="tel"
            className="tap rounded-xl border border-line bg-ink px-4 font-mono text-[15px] placeholder:font-sans placeholder:text-muted/50 focus:border-muted focus:outline-none"
          />
          <button
            type="submit"
            className="tap rounded-xl bg-fg px-5 font-semibold text-ink transition-transform active:scale-[0.99]"
          >
            {t("contacts.save")}
          </button>
        </form>
      </div>
    </Chrome>
  );
}
