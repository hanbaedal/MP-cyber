import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { AlbumItem } from "@/models/AlbumItem";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const hallId = new URL(request.url).searchParams.get("hallId");
  if (!hallId) {
    return NextResponse.json({ ok: false, message: "hallId 필요" }, { status: 400 });
  }
  await connectMongo();
  const albums = await AlbumItem.find({ hallId }).sort({ sortOrder: 1 }).lean();
  return NextResponse.json({ ok: true, albums });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
  }
  await connectMongo();
  const body = await request.json();
  const album = await AlbumItem.create(body);
  return NextResponse.json({ ok: true, album });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  await connectMongo();
  await AlbumItem.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
