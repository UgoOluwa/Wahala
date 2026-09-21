import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const report = await store.get(ref);
  if (!report) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ report });
}
