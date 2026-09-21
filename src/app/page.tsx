"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/** Typed into the calculator, this opens the real app. Nothing else reveals it. */
const UNLOCK = "112";

type Op = "+" | "-" | "x" | "/";

function Calculator() {
  const router = useRouter();
  const params = useSearchParams();
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [fresh, setFresh] = useState(true);

  // A judge should not have to hunt for the unlock, so the demo link carries it.
  useEffect(() => {
    if (params.get("open") === "1") router.replace("/report");
  }, [params, router]);

  useEffect(() => {
    router.prefetch("/report");
  }, [router]);

  function digit(d: string) {
    setDisplay((cur) => (fresh || cur === "0" ? d : cur.length < 12 ? cur + d : cur));
    setFresh(false);
  }

  function apply(a: number, b: number, o: Op): number {
    if (o === "+") return a + b;
    if (o === "-") return a - b;
    if (o === "x") return a * b;
    return b === 0 ? NaN : a / b;
  }

  function equals() {
    if (display === UNLOCK && stored === null) {
      router.push("/report");
      return;
    }
    if (op === null || stored === null) return;
    const result = apply(stored, Number(display), op);
    setDisplay(Number.isFinite(result) ? String(Number(result.toFixed(8))) : "Error");
    setStored(null);
    setOp(null);
    setFresh(true);
  }

  function chooseOp(next: Op) {
    const value = Number(display);
    setStored(stored !== null && op ? apply(stored, value, op) : value);
    setOp(next);
    setFresh(true);
  }

  function clear() {
    setDisplay("0");
    setStored(null);
    setOp(null);
    setFresh(true);
  }

  const keys: { label: string; action: () => void; tone?: "op" | "fn" }[] = [
    { label: "AC", action: clear, tone: "fn" },
    { label: "±", action: () => setDisplay((d) => (d.startsWith("-") ? d.slice(1) : "-" + d)), tone: "fn" },
    { label: "%", action: () => setDisplay((d) => String(Number(d) / 100)), tone: "fn" },
    { label: "÷", action: () => chooseOp("/"), tone: "op" },
    ...["7", "8", "9"].map((d) => ({ label: d, action: () => digit(d) })),
    { label: "×", action: () => chooseOp("x"), tone: "op" as const },
    ...["4", "5", "6"].map((d) => ({ label: d, action: () => digit(d) })),
    { label: "−", action: () => chooseOp("-"), tone: "op" as const },
    ...["1", "2", "3"].map((d) => ({ label: d, action: () => digit(d) })),
    { label: "+", action: () => chooseOp("+"), tone: "op" as const },
  ];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-end px-4 pb-8">
      <div className="px-2 pb-6 text-right">
        <div className="truncate text-[64px] font-light leading-none tabular-nums">{display}</div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {keys.map((k) => (
          <button
            key={k.label}
            onClick={k.action}
            className={`aspect-square rounded-2xl text-2xl font-light transition-colors active:opacity-70 ${
              k.tone === "op"
                ? "bg-pending/90 text-ink font-normal"
                : k.tone === "fn"
                  ? "bg-line text-fg"
                  : "bg-raised text-fg"
            }`}
          >
            {k.label}
          </button>
        ))}

        <button
          onClick={() => digit("0")}
          className="col-span-2 rounded-2xl bg-raised text-2xl font-light transition-colors active:opacity-70"
        >
          0
        </button>
        <button
          onClick={() => setDisplay((d) => (d.includes(".") ? d : d + "."))}
          className="aspect-square rounded-2xl bg-raised text-2xl font-light transition-colors active:opacity-70"
        >
          .
        </button>
        <button
          onClick={equals}
          className="aspect-square rounded-2xl bg-pending/90 text-2xl text-ink transition-colors active:opacity-70"
        >
          =
        </button>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Calculator />
    </Suspense>
  );
}
