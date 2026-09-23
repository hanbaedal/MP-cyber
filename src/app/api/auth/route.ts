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
    memberKind: session?.memberKind ?? null,
    transferStatus: session?.transferStatus ?? null,
    ownerMemberId: session?.ownerMemberId ?? null,
    guest: session?.role === "guest" || !!session?.guest,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loginId = String(body.loginId || body.username || "").trim();
    const password = String(body.password || "");

    if ((!loginId || loginId === "admin") && verifyAdminPassword(password)) {
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
    const member = await Member.findOne({ loginId });
    if (!member || member.password !== password) {
      return NextResponse.json(
        { ok: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    let transferStatus = member.transferStatus || "living";
    let hallId = member.hallId ? String(member.hallId) : undefined;
    let ownerMemberId = member.ownerMemberId ? String(member.ownerMemberId) : undefined;

    // 유족: 본인 계정의 이관 상태·추모관을 따름
    if (member.memberKind === "successor" && member.ownerMemberId) {
      const owner = await Member.findById(member.ownerMemberId);
      if (!owner) {
        return NextResponse.json(
          { ok: false, message: "연결된 본인 계정을 찾을 수 없습니다." },
          { status: 401 },
        );
      }
      transferStatus = owner.transferStatus || "living";
      hallId = owner.hallId ? String(owner.hallId) : hallId;
      ownerMemberId = String(owner._id);

      // 본인 생전이면 유족 로그인 불가
      if (owner.transferStatus !== "transferred") {
        return NextResponse.json(
          {
            ok: false,
            message:
              "본인(웰다잉) 계정이 활성인 동안 유족 아이디는 로그인할 수 없습니다. 이관 후 이용해 주세요.",
          },
          { status: 403 },
        );
      }
    }

    // 본인 이관 후 로그인 불가
    if (member.memberKind === "owner" && member.transferStatus === "transferred") {
      return NextResponse.json(
        {
          ok: false,
          message: "이관이 완료되어 본인 계정은 로그인할 수 없습니다. 유족 계정으로 이용해 주세요.",
        },
        { status: 403 },
      );
    }

    if (!member.isActive) {
      return NextResponse.json(
        { ok: false, message: "비활성 계정입니다. 관리자에게 문의해 주세요." },
        { status: 403 },
      );
    }

    if (member.planExpiresAt && new Date(member.planExpiresAt) < new Date()) {
      return NextResponse.json(
        { ok: false, message: "이용 기간이 만료되었습니다. 연장이 필요합니다." },
        { status: 403 },
      );
    }

    await createMemberSession({
      memberId: String(member._id),
      loginId: member.loginId,
      name: member.name,
      hallId,
      memberKind: member.memberKind || "owner",
      transferStatus,
      ownerMemberId,
    });

    return NextResponse.json({
      ok: true,
      role: "member",
      name: member.name,
      loginId: member.loginId,
      hallId: hallId ?? null,
      memberKind: member.memberKind || "owner",
      transferStatus,
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
