import type { Incident } from "./report";
import type { StringKey } from "./i18n";

/**
 * The track asks for protection, not only reporting. Between filing and help
 * arriving there is a gap the app was leaving empty, and that gap is exactly
 * when someone most needs telling what to do.
 *
 * Kept short, concrete and offline: three steps, no scrolling, no network.
 */
const SETS: Record<string, StringKey[]> = {
  kidnap: ["safety.kidnap1", "safety.kidnap2", "safety.kidnap3"],
  violence: ["safety.violence1", "safety.violence2", "safety.violence3"],
  sexual: ["safety.sexual1", "safety.sexual2", "safety.sexual3"],
  general: ["safety.general1", "safety.general2", "safety.general3"],
};

export function guidanceFor(incident: Incident): StringKey[] {
  if (incident === "kidnap") return SETS.kidnap;
  if (incident === "sexual") return SETS.sexual;
  if (incident === "physical" || incident === "threat" || incident === "followed") {
    return SETS.violence;
  }
  return SETS.general;
}
