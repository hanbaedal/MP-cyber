import { NextResponse } from "next/server";
import {
  createAdminSession,
  clearAdminSession,
  isAdminAuthenticated,
  verifyAdminPassword,
} from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminAuthenticated() });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!verifyAdminPassword(String(body.password || ""))) {
    return NextResponse.json({ ok: false, message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
