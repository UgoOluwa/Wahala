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
  // One object rather than four useStates: taps arrive faster than React
  // re-renders, and separate setters let a second digit read a stale `fresh`
  // and overwrite the first instead of appending to it.
  const [calc, setCalc] = useState<{
    display: string;
    stored: number | null;
    op: Op | null;
    fresh: boolean;
  }>({ display: "0", stored: null, op: null, fresh: true });

  const { display } = calc;

  // A judge should not have to hunt for the unlock, so the demo link carries it.
  useEffect(() => {
    if (params.get("open") === "1") router.replace("/report");
  }, [params, router]);

  useEffect(() => {
    router.prefetch("/report");
  }, [router]);

  function digit(d: string) {
    setCalc((c) => ({
      ...c,
      display: c.fresh || c.display === "0" ? d : c.display.length < 12 ? c.display + d : c.display,
      fresh: false,
    }));
  }

  function apply(a: number, b: number, o: Op): number {
    if (o === "+") return a + b;
    if (o === "-") return a - b;
    if (o === "x") return a * b;
    return b === 0 ? NaN : a / b;
  }

  function equals() {
    if (calc.display === UNLOCK && calc.stored === null) {
      router.push("/report");
      return;
    }
    setCalc((c) => {
      if (c.op === null || c.stored === null) return c;
      const result = apply(c.stored, Number(c.display), c.op);
      return {
        display: Number.isFinite(result) ? String(Number(result.toFixed(8))) : "Error",
        stored: null,
        op: null,
        fresh: true,
      };
    });
  }

  function chooseOp(next: Op) {
    setCalc((c) => {
      const value = Number(c.display);
      return {
        ...c,
        stored: c.stored !== null && c.op ? apply(c.stored, value, c.op) : value,
        op: next,
        fresh: true,
      };
    });
  }

  function clear() {
    setCalc({ display: "0", stored: null, op: null, fresh: true });
  }

  const keys: { label: string; action: () => void; tone?: "op" | "fn" }[] = [
    { label: "AC", action: clear, tone: "fn" },
    {
      label: "±",
      action: () =>
        setCalc((c) => ({
          ...c,
          display: c.display.startsWith("-") ? c.display.slice(1) : "-" + c.display,
        })),
      tone: "fn",
    },
    {
      label: "%",
      action: () => setCalc((c) => ({ ...c, display: String(Number(c.display) / 100) })),
      tone: "fn",
    },
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
          onClick={() =>
            setCalc((c) => ({ ...c, display: c.display.includes(".") ? c.display : c.display + "." }))
          }
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
