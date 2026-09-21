import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { ensureSampleMembers } from "@/lib/seed";
import { Member } from "@/models/Member";
import { MemorialHall } from "@/models/MemorialHall";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureSampleMembers();
    const isAdmin = await isAdminAuthenticated();
    const members = await Member.find().sort({ createdAt: 1 }).lean();
    const hallIds = members.map((m) => m.hallId).filter(Boolean);
    const halls = await MemorialHall.find({ _id: { $in: hallIds } }).lean();
    const hallMap = new Map(halls.map((h) => [String(h._id), h]));

    return NextResponse.json({
      ok: true,
      members: members.map((m) => {
        const hall = m.hallId ? hallMap.get(String(m.hallId)) : undefined;
        return {
          _id: String(m._id),
          loginId: m.loginId,
          name: m.name,
          password: isAdmin ? m.password : undefined,
          phone: m.phone,
          relation: m.relation,
          isActive: m.isActive,
          hallId: m.hallId ? String(m.hallId) : null,
          hallTitle: hall?.title ?? null,
          deceasedName: hall?.deceasedName ?? null,
        };
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    return NextResponse.json({ ok: false, message, members: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
  }

  try {
    await connectMongo();
    const body = await request.json();
    const exists = await Member.findOne({ loginId: body.loginId });
    if (exists) {
      return NextResponse.json({ ok: false, message: "이미 있는 아이디입니다." }, { status: 400 });
    }

    const member = await Member.create({
      loginId: body.loginId,
      name: body.name,
      password: body.password || "sample1234",
      phone: body.phone,
      relation: body.relation,
      hallId: body.hallId || undefined,
      isActive: true,
    });

    return NextResponse.json({ ok: true, member });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
