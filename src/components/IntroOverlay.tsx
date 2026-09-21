"use client";

import { useEffect, useRef, useState } from "react";

/** 접속 시 바로 영상+음악을 재생합니다. (시작하기 화면 없음) */
export default function IntroOverlay() {
  const [show, setShow] = useState(true);
  const [videoUrl, setVideoUrl] = useState("/intro/intro.mp4");
  const [bgmUrl, setBgmUrl] = useState("/intro/bgm.mp3");
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  function finish() {
    audioRef.current?.pause();
    videoRef.current?.pause();
    setShow(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/intro")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.videoUrl) setVideoUrl(json.videoUrl);
        if (json.bgmUrl) setBgmUrl(json.bgmUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    let cancelled = false;

    async function playAll() {
      try {
        audio!.currentTime = 0;
        await audio!.play();
      } catch {
        // 일부 브라우저는 소리 자동재생을 막을 수 있음
      }
      try {
        video!.muted = true;
        await video!.play();
        // 영상은 무음으로 자동재생, 소리는 bgm 담당
      } catch {
        if (!cancelled) setVideoError(true);
      }
    }

    // src 반영 후 재생
    const t = window.setTimeout(playAll, 50);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [show, videoUrl, bgmUrl]);

  if (!show) return null;

  return (
    <div className="intro-overlay">
      <video
        ref={videoRef}
        className="intro-video"
        key={videoUrl}
        src={videoUrl}
        playsInline
        muted
        autoPlay
        preload="auto"
        onEnded={finish}
        onError={() => setVideoError(true)}
      />
      <audio ref={audioRef} key={bgmUrl} src={bgmUrl} preload="auto" loop autoPlay />

      {videoError ? (
        <div className="intro-start">
          <p>영상을 불러오지 못했습니다</p>
          <p className="intro-hint">
            Render에 INTRO_VIDEO_URL(공개 mp4 주소)을 등록해 주세요
          </p>
        </div>
      ) : null}

      <button type="button" className="btn-ghost intro-skip floating" onClick={finish}>
        건너뛰기
      </button>
    </div>
  );
}
