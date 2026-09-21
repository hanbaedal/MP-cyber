import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { MemorialHall } from "@/models/MemorialHall";
import { ensureDefaultHall } from "@/lib/seed";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureDefaultHall();
    const halls = await MemorialHall.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, halls });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    return NextResponse.json({ ok: false, message, halls: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
  }
  try {
    await connectMongo();
    const body = await request.json();
    const hall = await MemorialHall.create({
      title: body.title,
      deceasedName: body.deceasedName,
      lifespan: body.lifespan,
      summary: body.summary,
      portraitUrl: body.portraitUrl,
      theme: body.theme || "modern",
      isPublished: body.isPublished !== false,
    });
    return NextResponse.json({ ok: true, hall });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
