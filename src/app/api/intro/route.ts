import { NextResponse } from "next/server";

export const runtime = "nodejs";

function isYouTubeUrl(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be";
  } catch {
    return false;
  }
}

function resolveVideoUrl() {
  const candidates = [
    process.env.INTRO_VIDEO_URL,
    process.env.NEXT_PUBLIC_INTRO_VIDEO_URL,
    process.env.NEXT_PUBLIC_INTRO_VIDEO,
  ].filter((v): v is string => !!v && v.trim().length > 0);

  // 서버 파일 우선: YouTube 주소는 무시하고 로컬 mp4 사용
  for (const c of candidates) {
    if (isYouTubeUrl(c)) continue;
    return c;
  }

  return "/intro/intro.mp4";
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
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1&playsinline=1&fs=0&iv_load_policy=3`;
  } catch {
    return null;
  }
}

export async function GET() {
  const videoUrl = resolveVideoUrl();
  const youtubeEmbed = isYouTubeUrl(videoUrl) ? toYouTubeEmbed(videoUrl) : null;

  return NextResponse.json({
    videoUrl,
    youtubeEmbed,
    isYouTube: !!youtubeEmbed,
    bgmUrl: resolveBgmUrl(),
  });
}
