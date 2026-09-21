import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const report = await store.get(ref);
  if (!report) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Cancelling after the deadline is refused rather than quietly accepted: by
  // then responders may already be moving, and telling someone it was called
  // off when it was not would be the worst possible lie.
  if (report.armedUntil && Date.now() >= report.armedUntil) {
    return NextResponse.json({ error: "already fired", report }, { status: 409 });
  }

  const updated = { ...report, cancelled: true };
  await store.put(updated);
  return NextResponse.json({ report: updated });
}
