"use client";

import { useEffect, useRef, useState } from "react";

type IntroConfig = {
  videoUrl: string;
  youtubeEmbed: string | null;
  isYouTube: boolean;
  bgmUrl: string;
};

/** 접속 시 바로 영상+BGM 재생 (시작하기 없음) */
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

  if (!show) return null;

  return (
    <div className="intro-overlay">
      {config?.isYouTube && config.youtubeEmbed ? (
        <iframe
          className="intro-video intro-youtube"
          src={config.youtubeEmbed}
          title="intro"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          ref={videoRef}
          className="intro-video"
          src={config?.videoUrl || "/intro/intro.mp4"}
          playsInline
          muted
          autoPlay
          preload="auto"
          onEnded={finish}
          onError={() => setVideoError(true)}
        />
      )}

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
          <p className="intro-hint">
            YouTube면 NEXT_PUBLIC_INTRO_VIDEO 에 watch 주소를 넣고 재배포하세요
          </p>
        </div>
      ) : null}

      <button type="button" className="btn-ghost intro-skip floating" onClick={finish}>
        건너뛰기
      </button>
    </div>
  );
}
