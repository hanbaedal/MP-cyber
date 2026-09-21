"use client";

import { useEffect, useRef, useState } from "react";

type IntroConfig = {
  videoUrl: string;
  youtubeEmbed: string | null;
  isYouTube: boolean;
  bgmUrl: string;
};

/** 접속 시 풀스크린(반응형)으로 영상+BGM 재생 */
export default function IntroOverlay() {
  const [show, setShow] = useState(true);
  const [config, setConfig] = useState<IntroConfig | null>(null);
  const [videoError, setVideoError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  function finish() {
    audioRef.current?.pause();
    videoRef.current?.pause();
    setShow(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/intro")
      .then((r) => r.json())
      .then((json: IntroConfig) => {
        if (!cancelled) setConfig(json);
      })
      .catch(() => {
        if (!cancelled) {
          setConfig({
            videoUrl: "/intro/intro.mp4",
            youtubeEmbed: null,
            isYouTube: false,
            bgmUrl: "/intro/bgm.mp3",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!show || !config) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(() => {});

    if (!config.isYouTube && videoRef.current) {
      const v = videoRef.current;
      v.muted = true;
      v.play().catch(() => setVideoError(true));
    }
  }, [show, config]);

  // 모바일 주소창 높이 변화 대응
  useEffect(() => {
    if (!show) return;
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--intro-vh",
        `${window.innerHeight}px`,
      );
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="intro-overlay" role="dialog" aria-label="인트로">
      <div className="intro-media">
        {config?.isYouTube && config.youtubeEmbed ? (
          <iframe
            className="intro-youtube"
            src={config.youtubeEmbed}
            title="intro"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            className="intro-file"
            src={config?.videoUrl || "/intro/intro.mp4"}
            playsInline
            muted
            autoPlay
            loop
            preload="auto"
            onError={() => setVideoError(true)}
          />
        )}
      </div>

      <audio
        ref={audioRef}
        src={config?.bgmUrl || "/intro/bgm.mp3"}
        preload="auto"
        loop
        autoPlay
      />

      {videoError && !config?.isYouTube ? (
        <div className="intro-start">
          <p>영상을 불러오지 못했습니다</p>
        </div>
      ) : null}

      <div className="intro-copy">
        <div className="intro-copy-titles">
          <p>일상생활속 추모</p>
          <p>아름다운 엔딩을 위한 준비</p>
        </div>
        <div className="intro-copy-desc">
          <p>나에 대한 기록(생애주기별 추억 저장소)</p>
          <p>소중한 사람을 언제나 기억하고 공유하는 추모관</p>
          <p>아름다운 마지막을 직접 준비하는 장례 체험까지 이용해 보세요.</p>
        </div>
      </div>

      <button type="button" className="btn-ghost intro-skip floating" onClick={finish}>
        건너뛰기
      </button>
    </div>
  );
}
