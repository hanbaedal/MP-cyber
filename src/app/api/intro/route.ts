import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    videoUrl:
      process.env.INTRO_VIDEO_URL ||
      process.env.NEXT_PUBLIC_INTRO_VIDEO_URL ||
      "/intro/intro.mp4",
    bgmUrl:
      process.env.INTRO_BGM_URL ||
      process.env.NEXT_PUBLIC_INTRO_BGM_URL ||
      "/intro/bgm.mp3",
  });
}
