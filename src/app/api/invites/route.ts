import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { MemorialInvite } from "@/models/MemorialInvite";
import { MemorialHall } from "@/models/MemorialHall";

export const runtime = "nodejs";

function canManageHall(session: Awaited<ReturnType<typeof getSession>>, hallId: string) {
  if (!session) return false;
  if (session.role === "admin") return true;
  return (
    session.role === "member" &&
    session.memberKind === "successor" &&
    session.transferStatus === "transferred" &&
    session.hallId === hallId
  );
}

/** 초대 링크 목록 / 생성 */
export async function GET(request: Request) {
  const session = await getSession();
  const hallId = new URL(request.url).searchParams.get("hallId");
  if (!hallId) {
    return NextResponse.json({ ok: false, message: "hallId 필요" }, { status: 400 });
  }
  if (!canManageHall(session, hallId)) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
  }

  await connectMongo();
  const invites = await MemorialInvite.find({ hallId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, invites });
}

export async function POST(request: Request) {
  const session = await getSession();
  const body = await request.json();
  const hallId = String(body.hallId || "");
  if (!hallId) {
    return NextResponse.json({ ok: false, message: "hallId 필요" }, { status: 400 });
  }
  if (!canManageHall(session, hallId)) {
    return NextResponse.json(
      { ok: false, message: "유족(이관 후) 또는 관리자만 발급할 수 있습니다." },
      { status: 403 },
    );
  }

  await connectMongo();
  const hall = await MemorialHall.findById(hallId);
  if (!hall) {
    return NextResponse.json({ ok: false, message: "추모관을 찾을 수 없습니다." }, { status: 404 });
  }

  const days = Math.min(90, Math.max(1, Number(body.days) || 14));
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const token = randomBytes(24).toString("hex");
  const invite = await MemorialInvite.create({
    token,
    hallId,
    createdByMemberId: session?.memberId,
    label: String(body.label || `${hall.deceasedName} 추모 초대`),
    expiresAt,
    maxUses: Number(body.maxUses) || 0,
    useCount: 0,
    isActive: true,
  });

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
  const path = `/invite/${token}`;
  const url = origin ? `${origin}${path}` : path;

  return NextResponse.json({
    ok: true,
    invite,
    url,
    path,
    expiresAt,
  });
}
