import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import type { Report } from "@/lib/report";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as Report;
  if (!body?.ref || !body?.incident) {
    return NextResponse.json({ error: "malformed report" }, { status: 400 });
  }

  const report: Report = { ...body, replies: body.replies ?? [] };
  await store.put(report);

  return NextResponse.json({ ok: true, ref: report.ref });
}

export async function GET() {
  return NextResponse.json({ reports: await store.list(), backend: store.backend });
}
