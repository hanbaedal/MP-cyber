import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { MemorialHall } from "@/models/MemorialHall";
import { Video } from "@/models/Video";
import { Tribute } from "@/models/Tribute";
import { AlbumItem } from "@/models/AlbumItem";
import { ensureDefaultHall } from "@/lib/seed";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    await ensureDefaultHall();
    const { id } = await ctx.params;
    const hall = await MemorialHall.findById(id).lean();
    if (!hall) {
      return NextResponse.json({ ok: false, message: "추모관을 찾을 수 없습니다." }, { status: 404 });
    }
    const [videos, tributes, albums] = await Promise.all([
      Video.find({ hallId: id }).sort({ sortOrder: 1, createdAt: -1 }).lean(),
      Tribute.find({ hallId: id, isPublic: true }).sort({ createdAt: -1 }).lean(),
      AlbumItem.find({ hallId: id }).sort({ sortOrder: 1, createdAt: -1 }).lean(),
    ]);
    return NextResponse.json({ ok: true, hall, videos, tributes, albums });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
  }
  try {
    await connectMongo();
    const { id } = await ctx.params;
    const body = await request.json();
    const hall = await MemorialHall.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ ok: true, hall });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
