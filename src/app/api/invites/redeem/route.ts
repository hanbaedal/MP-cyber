import { NextResponse } from "next/server";
import { createGuestSession, getSession } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { MemorialInvite } from "@/models/MemorialInvite";
import { MemorialHall } from "@/models/MemorialHall";

export const runtime = "nodejs";

/** 초대 토큰 사용 → 게스트 세션 발급 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token || "").trim();
    if (!token) {
      return NextResponse.json({ ok: false, message: "token 필요" }, { status: 400 });
    }

    await connectMongo();
    const invite = await MemorialInvite.findOne({ token, isActive: true });
    if (!invite) {
      return NextResponse.json({ ok: false, message: "유효하지 않은 초대 링크입니다." }, { status: 404 });
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ ok: false, message: "만료된 초대 링크입니다." }, { status: 410 });
    }
    if (invite.maxUses > 0 && invite.useCount >= invite.maxUses) {
      return NextResponse.json({ ok: false, message: "사용 횟수를 초과한 링크입니다." }, { status: 410 });
    }

    const hall = await MemorialHall.findById(invite.hallId);
    if (!hall) {
      return NextResponse.json({ ok: false, message: "추모관을 찾을 수 없습니다." }, { status: 404 });
    }

    // 이미 회원/관리자로 로그인 중이면 게스트로 덮지 않음 — 안내만
    const existing = await getSession();
    if (existing && (existing.role === "member" || existing.role === "admin")) {
      return NextResponse.json({
        ok: true,
        skippedLogin: true,
        hallId: String(hall._id),
        hallTitle: hall.title,
        message: "이미 로그인되어 있습니다. 추모관으로 이동합니다.",
      });
    }

    const remainingMs = invite.expiresAt.getTime() - Date.now();
    const expiresInSec = Math.max(3600, Math.floor(remainingMs / 1000));

    await createGuestSession({
      hallId: String(hall._id),
      inviteToken: token,
      hallTitle: hall.title,
      expiresInSec,
    });

    invite.useCount += 1;
    await invite.save();

    return NextResponse.json({
      ok: true,
      hallId: String(hall._id),
      hallTitle: hall.title,
      deceasedName: hall.deceasedName,
      guest: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
