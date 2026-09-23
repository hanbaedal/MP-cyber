import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { FamilyBoardPost } from "@/models/FamilyBoardPost";
import { ensureSampleMembers } from "@/lib/seed";

export const runtime = "nodejs";

export async function GET(request: Request) {
  await ensureSampleMembers();
  await connectMongo();
  const { searchParams } = new URL(request.url);
  const hallId = searchParams.get("hallId");

  const filter = hallId
    ? { $or: [{ hallId }, { isSample: true }] }
    : { isSample: true };

  const posts = await FamilyBoardPost.find(filter).sort({ createdAt: -1 }).lean();

  // 샘플이 없으면 하나 생성
  if (posts.length === 0) {
    const sample = await FamilyBoardPost.create({
      title: "가족 일정 안내",
      body: "이번 주말 온라인 추모에 함께해 주세요. (샘플 공지)",
      authorName: "유족",
      isSample: true,
    });
    return NextResponse.json({ ok: true, posts: [sample], canEdit: false });
  }

  const session = await getSession();
  const canEdit =
    session?.role === "admin" ||
    (session?.memberKind === "successor" &&
      session.transferStatus === "transferred");

  return NextResponse.json({ ok: true, posts, canEdit });
}

export async function POST(request: Request) {
  const session = await getSession();
  const canEdit =
    session?.role === "admin" ||
    (session?.memberKind === "successor" &&
      session.transferStatus === "transferred");
  if (!canEdit) {
    return NextResponse.json({ ok: false, message: "유족만 작성할 수 있습니다." }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body.title || "").trim();
  const text = String(body.body || "").trim();
  if (!title || !text) {
    return NextResponse.json({ ok: false, message: "제목과 내용이 필요합니다." }, { status: 400 });
  }

  await connectMongo();
  const post = await FamilyBoardPost.create({
    hallId: session?.hallId || undefined,
    title,
    body: text,
    authorName: session?.name || "유족",
    authorMemberId: session?.memberId,
    isSample: false,
  });

  return NextResponse.json({ ok: true, post });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  const canEdit =
    session?.role === "admin" ||
    (session?.memberKind === "successor" &&
      session.transferStatus === "transferred");
  if (!canEdit) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, message: "id required" }, { status: 400 });
  }

  await connectMongo();
  await FamilyBoardPost.deleteOne({ _id: id, isSample: false });
  return NextResponse.json({ ok: true });
}
