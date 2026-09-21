import type { Locale, StringKey } from "./i18n";

export const INCIDENTS = ["physical", "threat", "kidnap", "sexual", "followed", "other"] as const;
export type Incident = (typeof INCIDENTS)[number];

export type Mode = "covert" | "rapid";

/**
 * Danger has two speeds, and they need opposite input affordances. An attack in
 * progress must cost one tap and no typing; a considered abuse report is worth
 * fields, because detail is what lets a responder route it to the right body.
 */
export type Urgency = "immediate" | "considered";

export interface Reply {
  at: number;
  agency: string;
  /**
   * A translation key, so the reply renders in whatever language the reporter
   * filed in. A responder typing freehand cannot be translated offline, so that
   * text travels in `message` instead and is labelled as English on arrival.
   */
  messageKey: StringKey | null;
  message: string;
  /** Minutes until help is expected on scene. Null when not yet committed to. */
  etaMinutes: number | null;
}

export interface Report {
  ref: string;
  incident: Incident;
  urgency: Urgency;
  locale: Locale;
  mode: Mode;
  lat: number | null;
  lon: number | null;
  accuracy: number | null;
  createdAt: number;
  /** Only ever populated by a considered report. Immediate reports carry no text. */
  description?: string;
  involved?: string;
  when?: string;
  replies: Reply[];
  acknowledgedAt?: number;
}

export type Delivery = "sent" | "queued" | "sms";

// Single characters so the whole report survives inside one 160-character SMS.
const INCIDENT_CODE: Record<Incident, string> = {
  physical: "p",
  threat: "t",
  kidnap: "k",
  sexual: "s",
  followed: "f",
  other: "o",
};

const CODE_INCIDENT = Object.fromEntries(
  Object.entries(INCIDENT_CODE).map(([k, v]) => [v, k]),
) as Record<string, Incident>;

export function newRef(): string {
  // Six base36 characters is enough to be unambiguous across a demo and short
  // enough to read aloud over a phone line.
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/**
 * A report as it travels over SMS. Every field is positional and abbreviated
 * because tier 2 of the transport ladder is a single 160-character message on a
 * network that may only manage one of them.
 */
export function encode(r: Report): string {
  const coords = r.lat !== null && r.lon !== null ? `${r.lat.toFixed(5)},${r.lon.toFixed(5)}` : "-";
  const acc = r.accuracy !== null ? Math.round(r.accuracy).toString(36) : "-";
  return [
    "HLP1",
    INCIDENT_CODE[r.incident],
    r.locale,
    (r.mode === "covert" ? "c" : "r") + (r.urgency === "immediate" ? "i" : "d"),
    coords,
    acc,
    Math.floor(r.createdAt / 1000).toString(36),
    r.ref,
  ].join("|");
}

export function decode(raw: string): Report | null {
  const p = raw.trim().split("|");
  if (p.length !== 8 || p[0] !== "HLP1") return null;

  const incident = CODE_INCIDENT[p[1]];
  if (!incident) return null;

  let lat: number | null = null;
  let lon: number | null = null;
  if (p[4] !== "-") {
    const [a, b] = p[4].split(",").map(Number);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      lat = a;
      lon = b;
    }
  }

  const ts = parseInt(p[6], 36);
  if (!Number.isFinite(ts)) return null;

  return {
    ref: p[7],
    incident,
    locale: p[2] as Locale,
    mode: p[3][0] === "c" ? "covert" : "rapid",
    urgency: p[3][1] === "i" ? "immediate" : "considered",
    replies: [],
    lat,
    lon,
    accuracy: p[5] === "-" ? null : parseInt(p[5], 36),
    createdAt: ts * 1000,
  };
}

export function smsLength(r: Report): number {
  return encode(r).length;
}
