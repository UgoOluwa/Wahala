import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const report = await store.get(ref);
  if (!report) return NextResponse.json({ error: "not found" }, { status: 404 });

  // The reporter already has their callback code locally. Returning it here
  // would mean anyone who read the reference code off their screen could fetch
  // the secret that is supposed to distinguish a real responder from them.
  const { callbackCode: _withheld, ...safe } = report;
  return NextResponse.json({ report: safe });
}
