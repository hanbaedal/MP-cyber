import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { isWelldyingSlug, WELLDying_TOPICS } from "@/lib/roles";
import { Member } from "@/models/Member";
import { WelldyingEntry } from "@/models/WelldyingEntry";
import { ensureSampleMembers } from "@/lib/seed";

export const runtime = "nodejs";

function topicTitle(slug: string) {
  return WELLDying_TOPICS.find((t) => t.slug === slug)?.title || slug;
}

export async function GET(request: Request) {
  await ensureSampleMembers();
  await connectMongo();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "";
  const session = await getSession();

  if (slug && !isWelldyingSlug(slug)) {
    return NextResponse.json({ ok: false, message: "invalid slug" }, { status: 400 });
  }

  // 샘플: isSample true
  if (!session || session.role === "admin") {
    const filter = slug ? { slug, isSample: true } : { isSample: true };
    const entries = await WelldyingEntry.find(filter).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ ok: true, entries, canEdit: session?.role === "admin" });
  }

  const ownerId =
    session.memberKind === "successor"
      ? session.ownerMemberId
      : session.memberId;

  if (!ownerId) {
    return NextResponse.json({ ok: true, entries: [], canEdit: false });
  }

  const filter = slug
    ? { ownerMemberId: ownerId, slug, isSample: false }
    : { ownerMemberId: ownerId, isSample: false };
  const entries = await WelldyingEntry.find(filter).sort({ updatedAt: -1 }).lean();
  const canEdit =
    session.memberKind === "owner" && session.transferStatus !== "transferred";

  // 본인 기록 없으면 샘플로 미리보기
  if (entries.length === 0 && slug) {
    const samples = await WelldyingEntry.find({ slug, isSample: true }).lean();
    return NextResponse.json({
      ok: true,
      entries: samples,
      canEdit,
      showingSample: true,
    });
  }

  return NextResponse.json({ ok: true, entries, canEdit });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  // 본인만 작성 (이관 전)
  if (session.role === "member") {
    if (session.memberKind !== "owner" || session.transferStatus === "transferred") {
      return NextResponse.json(
        { ok: false, message: "생전 본인 계정만 작성·수정할 수 있습니다." },
        { status: 403 },
      );
    }
  } else if (session.role !== "admin") {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json();
  const slug = String(body.slug || "");
  if (!isWelldyingSlug(slug)) {
    return NextResponse.json({ ok: false, message: "invalid slug" }, { status: 400 });
  }

  await connectMongo();

  let ownerMemberId = session.memberId;
  if (session.role === "admin") {
    ownerMemberId = String(body.ownerMemberId || session.memberId || "");
    if (!ownerMemberId) {
      const anyOwner = await Member.findOne({ memberKind: "owner" });
      ownerMemberId = anyOwner ? String(anyOwner._id) : "";
    }
  }
  if (!ownerMemberId) {
    return NextResponse.json({ ok: false, message: "소유자를 찾을 수 없습니다." }, { status: 400 });
  }

  const photoUrls = Array.isArray(body.photoUrls)
    ? body.photoUrls.map(String).filter(Boolean).slice(0, 3)
    : [];
  const videoUrl = body.videoUrl ? String(body.videoUrl) : undefined;
  const text = String(body.body || "");
  const title = String(body.title || topicTitle(slug));

  const entry = await WelldyingEntry.findOneAndUpdate(
    { ownerMemberId, slug, isSample: false },
    {
      $set: {
        title,
        body: text,
        photoUrls,
        videoUrl,
        isSample: false,
      },
    },
    { upsert: true, new: true },
  );

  return NextResponse.json({ ok: true, entry });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || (session.role === "member" && session.memberKind !== "owner")) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
  }
  if (session.role === "member" && session.transferStatus === "transferred") {
    return NextResponse.json({ ok: false, message: "이관 후에는 삭제할 수 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "";
  if (!isWelldyingSlug(slug) || !session.memberId) {
    return NextResponse.json({ ok: false, message: "invalid" }, { status: 400 });
  }

  await connectMongo();
  await WelldyingEntry.deleteOne({
    ownerMemberId: session.memberId,
    slug,
    isSample: false,
  });
  return NextResponse.json({ ok: true });
}
