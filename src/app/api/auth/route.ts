import { NextResponse } from "next/server";
import {
  createAdminSession,
  createMemberSession,
  clearSession,
  getSession,
  verifyAdminPassword,
} from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { Member } from "@/models/Member";
import { ensureSampleMembers } from "@/lib/seed";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    authenticated: !!session,
    role: session?.role ?? null,
    loginId: session?.loginId ?? null,
    name: session?.name ?? null,
    hallId: session?.hallId ?? null,
    memberId: session?.memberId ?? null,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loginId = String(body.loginId || body.username || "").trim();
    const password = String(body.password || "");

    // 관리자: admin / ADMIN_PASSWORD 또는 비밀번호만
    if (
      (!loginId || loginId === "admin") &&
      verifyAdminPassword(password)
    ) {
      await createAdminSession();
      return NextResponse.json({
        ok: true,
        role: "admin",
        name: "관리자",
        loginId: "admin",
      });
    }

    if (!loginId || !password) {
      return NextResponse.json(
        { ok: false, message: "아이디와 비밀번호를 입력해 주세요." },
        { status: 400 },
      );
    }

    await ensureSampleMembers();
    await connectMongo();
    const member = await Member.findOne({ loginId, isActive: true });
    if (!member || member.password !== password) {
      return NextResponse.json(
        { ok: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    await createMemberSession({
      memberId: String(member._id),
      loginId: member.loginId,
      name: member.name,
      hallId: member.hallId ? String(member.hallId) : undefined,
    });

    return NextResponse.json({
      ok: true,
      role: "member",
      name: member.name,
      loginId: member.loginId,
      hallId: member.hallId ? String(member.hallId) : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
