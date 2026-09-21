import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Video } from "@/models/Video";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const hallId = new URL(request.url).searchParams.get("hallId");
  if (!hallId) {
    return NextResponse.json({ ok: false, message: "hallId 필요" }, { status: 400 });
  }
  await connectMongo();
  const videos = await Video.find({ hallId }).sort({ sortOrder: 1 }).lean();
  return NextResponse.json({ ok: true, videos });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
  }
  await connectMongo();
  const body = await request.json();
  const video = await Video.create(body);
  return NextResponse.json({ ok: true, video });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  await connectMongo();
  await Video.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
