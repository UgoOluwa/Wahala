import type { Incident } from "./report";

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
  remit: string;
  coverage: string;
  phone: string | null;
  verified: boolean;
}

export const REFERRALS: Referral[] = [
  {
    id: "ng-112",
    name: "112 — National Emergency Number",
    remit: "Police, fire and ambulance dispatch",
    coverage: "Nationwide",
    phone: "112",
    verified: true,
  },
  {
    id: "naptip",
    name: "NAPTIP",
    remit: "Trafficking, and offences under the VAPP Act",
    coverage: "Nationwide",
    phone: null,
    verified: false,
  },
  {
    id: "mirabel",
    name: "Mirabel Centre",
    remit: "Sexual assault referral — forensic care and counselling",
    coverage: "Lagos (LASUTH, Ikeja)",
    phone: null,
    verified: false,
  },
  {
    id: "warif",
    name: "WARIF",
    remit: "Rape crisis response, medical and legal support",
    coverage: "Lagos (Yaba)",
    phone: null,
    verified: false,
  },
  {
    id: "dsva",
    name: "Lagos DSVA",
    remit: "Domestic and sexual violence response",
    coverage: "Lagos State",
    phone: null,
    verified: false,
  },
  {
    id: "nscdc",
    name: "NSCDC",
    remit: "Civil defence, kidnapping and armed incident response",
    coverage: "Nationwide",
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
