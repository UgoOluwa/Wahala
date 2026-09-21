"use client";

import { outbox } from "@/lib/queue";

/**
 * The single most important control in a covert flow. One tap has to leave
 * nothing on screen, nothing in history and nothing in the outbox — someone may
 * be walking into the room right now.
 */
export function QuickExit({ label }: { label: string }) {
  async function bail() {
    try {
      await outbox.wipe();
      localStorage.removeItem("hlp.locale");
      sessionStorage.clear();
    } catch {
      // Never let cleanup failure stop the escape.
    }
    // Back to the calculator rather than an outside site: an external page needs
    // a network, and someone hitting this while offline would land on a browser
    // error — conspicuous at exactly the wrong moment. The disguise is already
    // here, and it loads instantly.
    //
    // replace(), not assign() — the back button must not walk into the report.
    window.location.replace("/");
  }

  return (
    <button
      onClick={bail}
      className="tap rounded-xl border border-line bg-raised px-4 text-sm font-medium text-muted transition-colors hover:border-danger hover:text-danger"
    >
      {label}
    </button>
  );
}
