import type { Incident } from "./report";
import type { StringKey } from "./i18n";

/**
 * The track asks for a clear pathway to support, not just a place to shout. So a
 * report resolves to a named body with a known remit rather than "the authorities".
 *
 * Only 112, the national emergency line, carries a number here. Every other
 * hotline is left null on purpose: publishing a digit I could not verify, in an
 * app someone opens during an assault, is the one failure mode that actually
 * costs a person something. They need filling in from each body directly before
 * this goes anywhere near a real user.
 */
export interface Referral {
  id: string;
  name: string;
  remitKey: StringKey;
  coverageKey: StringKey;
  phone: string | null;
  verified: boolean;
}

export const REFERRALS: Referral[] = [
  {
    id: "ng-112",
    name: "112 — National Emergency Number",
    remitKey: "remit.ng112",
    coverageKey: "coverage.national",
    phone: "112",
    verified: true,
  },
  {
    id: "naptip",
    name: "NAPTIP",
    remitKey: "remit.naptip",
    coverageKey: "coverage.national",
    phone: null,
    verified: false,
  },
  {
    id: "mirabel",
    name: "Mirabel Centre",
    remitKey: "remit.mirabel",
    coverageKey: "coverage.lagosIkeja",
    phone: null,
    verified: false,
  },
  {
    id: "warif",
    name: "WARIF",
    remitKey: "remit.warif",
    coverageKey: "coverage.lagosYaba",
    phone: null,
    verified: false,
  },
  {
    id: "dsva",
    name: "Lagos DSVA",
    remitKey: "remit.dsva",
    coverageKey: "coverage.lagosState",
    phone: null,
    verified: false,
  },
  {
    id: "nscdc",
    name: "NSCDC",
    remitKey: "remit.nscdc",
    coverageKey: "coverage.national",
    phone: null,
    verified: false,
  },
];

const ROUTING: Record<Incident, string[]> = {
  physical: ["ng-112", "dsva", "nscdc"],
  threat: ["ng-112", "nscdc"],
  kidnap: ["ng-112", "nscdc", "naptip"],
  sexual: ["mirabel", "warif", "dsva", "ng-112"],
  followed: ["ng-112", "dsva"],
  other: ["ng-112"],
};

export function routeFor(incident: Incident): Referral[] {
  const ids = ROUTING[incident] ?? ["ng-112"];
  return ids
    .map((id) => REFERRALS.find((r) => r.id === id))
    .filter((r): r is Referral => Boolean(r));
}
