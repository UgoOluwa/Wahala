/**
 * In much of Nigeria a neighbour reaches you before an agency does. Trusted
 * contacts make that a first-class destination rather than something the person
 * has to remember to do separately while in danger.
 *
 * Deliberately device-only. Sending a list of the people someone trusts to a
 * server would build exactly the map an abuser or a trafficker would want, and
 * it is not needed: the alert goes out from the person's own phone by SMS.
 */
const KEY = "hlp.contacts";

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export const contacts = {
  all(): Contact[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Contact[]) : [];
    } catch {
      return [];
    }
  },

  add(name: string, phone: string): Contact[] {
    const next = [
      ...this.all(),
      { id: Math.random().toString(36).slice(2, 9), name: name.trim(), phone: phone.trim() },
    ];
    this.write(next);
    return next;
  },

  remove(id: string): Contact[] {
    const next = this.all().filter((c) => c.id !== id);
    this.write(next);
    return next;
  },

  write(list: Contact[]) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      // A full or blocked store costs the feature, not the report.
    }
  },

  wipe() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* nothing to do */
    }
  },
};

/** One SMS to everyone at once, with a map link a non-technical person can open. */
export function alertHref(list: Contact[], body: string): string {
  const numbers = list.map((c) => c.phone).join(",");
  const sep = typeof navigator !== "undefined" && /iPhone|iPad|Mac/.test(navigator.userAgent) ? "&" : "?";
  return `sms:${numbers}${sep}body=${encodeURIComponent(body)}`;
}
