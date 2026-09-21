import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { LifeRecord } from "@/models/LifeRecord";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 100 * 1024 * 1024;

export async function GET() {
  try {
    await connectMongo();
    const records = await LifeRecord.find().sort({ createdAt: -1 }).lean();
    const used = records.reduce((sum, r) => sum + (r.sizeBytes || 0), 0);
    return NextResponse.json({
      ok: true,
      records,
      usage: { used, max: MAX_BYTES },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    return NextResponse.json({ ok: false, message, records: [], usage: { used: 0, max: MAX_BYTES } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
  }
  await connectMongo();
  const body = await request.json();
  const records = await LifeRecord.find();
  const used = records.reduce((sum, r) => sum + (r.sizeBytes || 0), 0);
  const sizeBytes = Number(body.sizeBytes || 0);
  if (used + sizeBytes > MAX_BYTES) {
    return NextResponse.json({ ok: false, message: "저장 공간(100MB)을 초과합니다." }, { status: 400 });
  }
  const record = await LifeRecord.create({
    stage: body.stage,
    title: body.title,
    content: body.content,
    mediaUrl: body.mediaUrl,
    mediaType: body.mediaType || "text",
    coOwners: body.coOwners || [],
    sizeBytes,
  });
  return NextResponse.json({ ok: true, record });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  await connectMongo();
  await LifeRecord.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
