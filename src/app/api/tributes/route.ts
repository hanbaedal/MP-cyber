import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Tribute } from "@/models/Tribute";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const hallId = new URL(request.url).searchParams.get("hallId");
  if (!hallId) {
    return NextResponse.json({ ok: false, message: "hallId 필요" }, { status: 400 });
  }
  await connectMongo();
  const tributes = await Tribute.find({ hallId, isPublic: true }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, tributes });
}

export async function POST(request: Request) {
  await connectMongo();
  const body = await request.json();
  const isAdmin = await isAdminAuthenticated();
  const tribute = await Tribute.create({
    hallId: body.hallId,
    author: body.author || "익명",
    content: body.content,
    isPublic: isAdmin ? body.isPublic !== false : true,
  });
  return NextResponse.json({ ok: true, tribute });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  await connectMongo();
  await Tribute.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
