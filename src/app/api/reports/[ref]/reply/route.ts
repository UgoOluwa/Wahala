import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import type { Reply } from "@/lib/report";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const body = (await req.json()) as Partial<Reply>;

  const reply: Reply = {
    at: Date.now(),
    agency: body.agency ?? "Response desk",
    messageKey: body.messageKey ?? null,
    message: body.message ?? "",
    etaMinutes: typeof body.etaMinutes === "number" ? body.etaMinutes : null,
  };

  const updated = await store.reply(ref, reply);
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ report: updated });
}
