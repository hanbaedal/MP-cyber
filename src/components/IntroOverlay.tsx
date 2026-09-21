"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import WellDyingLogo from "@/components/WellDyingLogo";

type IntroConfig = {
  videoUrl: string;
  youtubeEmbed: string | null;
  isYouTube: boolean;
  bgmUrl: string;
};

/** 접속 시 풀스크린 영상 + BGM (브라우저는 보통 터치 후 소리 허용) */
export default function IntroOverlay() {
  const [show, setShow] = useState(true);
  const [config, setConfig] = useState<IntroConfig | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [needTapForSound, setNeedTapForSound] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  function finish() {
    audioRef.current?.pause();
    videoRef.current?.pause();
    setShow(false);
  }

  const playBgm = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    try {
      audio.muted = false;
      audio.volume = 1;
      if (audio.paused) {
        audio.currentTime = 0;
      }
      await audio.play();
      setSoundOn(true);
      setNeedTapForSound(false);
      return true;
    } catch {
      setNeedTapForSound(true);
      setSoundOn(false);
      return false;
    }
  }, []);

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
    if (audio) {
      audio.src = config.bgmUrl || "/intro/bgm.mp3";
      audio.loop = true;
      audio.load();
    }

    // 자동재생 시도 (많은 브라우저에서 차단 → 터치로 해제)
    const t = window.setTimeout(() => {
      playBgm();
    }, 80);

    if (!config.isYouTube && videoRef.current) {
      const v = videoRef.current;
      v.muted = true;
      v.play().catch(() => setVideoError(true));
    }

    return () => window.clearTimeout(t);
  }, [show, config, playBgm]);

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

  function onUnlockSound() {
    if (!soundOn) {
      playBgm();
    }
  }

  if (!show) return null;

  return (
    <div
      className="intro-overlay"
      role="dialog"
      aria-label="인트로"
      onPointerDown={onUnlockSound}
    >
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

      <audio ref={audioRef} preload="auto" loop playsInline />

      {videoError && !config?.isYouTube ? (
        <div className="intro-start">
          <p>영상을 불러오지 못했습니다</p>
        </div>
      ) : null}

      <div className="intro-copy">
        <div className="intro-copy-titles">
          <WellDyingLogo size="lg" className="intro-logo" />
          <p>일상생활속 추모</p>
          <p>아름다운 엔딩을 위한 준비</p>
        </div>
        <div className="intro-copy-desc">
          <p>시공간의 제약 없이</p>
          <p>언제든 찾아가 마음을 전할 수 있는</p>
          <p>온라인 추모 공간</p>
          <p className="intro-copy-gap" aria-hidden="true">
            &nbsp;
          </p>
          <p>나와 남겨질 이들을 위해</p>
          <p>삶의 마지막을 주체적으로 준비</p>
        </div>
        {needTapForSound ? (
          <p className="intro-sound-hint">화면을 터치하면 음악이 재생됩니다</p>
        ) : null}
      </div>

      <button
        type="button"
        className="btn-ghost intro-skip floating"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        건너뛰기
      </button>
    </div>
  );
}
