import { NextResponse } from "next/server";

export const runtime = "nodejs";

function resolveVideoUrl() {
  return (
    process.env.INTRO_VIDEO_URL ||
    process.env.NEXT_PUBLIC_INTRO_VIDEO_URL ||
    process.env.NEXT_PUBLIC_INTRO_VIDEO ||
    "/intro/intro.mp4"
  );
}

function resolveBgmUrl() {
  return (
    process.env.INTRO_BGM_URL ||
    process.env.NEXT_PUBLIC_INTRO_BGM_URL ||
    "/intro/bgm.mp3"
  );
}

/** YouTube watch/share/shorts URL → embed URL 또는 null */
export function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = u.pathname.replace(/^\//, "").split("/")[0];
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2] || "";
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2] || "";
      } else {
        id = u.searchParams.get("v") || "";
      }
    }

    if (!id) return null;
    // mute=1 자동재생, playsinline 모바일, 전체화면 느낌
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&fs=0&iv_load_policy=3`;
  } catch {
    return null;
  }
}

export async function GET() {
  const videoUrl = resolveVideoUrl();
  const youtubeEmbed = toYouTubeEmbed(videoUrl);

  return NextResponse.json({
    videoUrl,
    youtubeEmbed,
    isYouTube: !!youtubeEmbed,
    bgmUrl: resolveBgmUrl(),
  });
}
