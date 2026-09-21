import { outbox } from "./queue";
import { encode, type Report, type Delivery } from "./report";

/** The shortcode a real deployment would lease. 112 is the live national line. */
export const SMS_SHORTCODE = "112";

async function post(report: Report): Promise<boolean> {
  try {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
      // A stalled request on a bad network is indistinguishable from a dead one
      // to the person holding the phone, so give up early and fall down a tier.
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Three tiers, tried in order:
 *   1. data available      → straight to the responder desk
 *   2. GSM but no data     → a single SMS the person sends with one tap
 *   3. no signal at all    → held in the outbox and flushed the moment a bar returns
 */
export async function send(report: Report): Promise<Delivery> {
  if (typeof navigator !== "undefined" && navigator.onLine && (await post(report))) {
    return "sent";
  }

  await outbox.add(report);
  return "queued";
}

export function smsHref(report: Report): string {
  // iOS and Android disagree about the separator before the body parameter.
  const sep = typeof navigator !== "undefined" && /iPhone|iPad|Mac/.test(navigator.userAgent) ? "&" : "?";
  return `sms:${SMS_SHORTCODE}${sep}body=${encodeURIComponent(encode(report))}`;
}

/** Returns how many queued reports got through. */
export async function flush(): Promise<number> {
  const pending = await outbox.all();
  let delivered = 0;
  for (const report of pending) {
    if (await post(report)) {
      await outbox.remove(report.ref);
      delivered += 1;
    }
  }
  return delivered;
}

export function onReconnect(fn: () => void): () => void {
  window.addEventListener("online", fn);
  return () => window.removeEventListener("online", fn);
}
