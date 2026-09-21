"use client";

import { useRef, useState } from "react";

/** 사이트에 새로 접속(새로고침 포함)할 때마다 인트로를 표시합니다. */
export default function IntroOverlay() {
  const [show, setShow] = useState(true);
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  function finish() {
    audioRef.current?.pause();
    videoRef.current?.pause();
    setShow(false);
  }

  async function startPlayback() {
    setStarted(true);
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
      if (videoRef.current) {
        await videoRef.current.play();
      }
    } catch {
      // 브라우저 자동재생 제한 시 사용자 재시도
    }
  }

  if (!show) return null;

  return (
    <div className="intro-overlay">
      <video
        ref={videoRef}
        className="intro-video"
        src={process.env.NEXT_PUBLIC_INTRO_VIDEO_URL || "/intro/intro.mp4"}
        playsInline
        preload="metadata"
        onEnded={finish}
      />
      <audio
        ref={audioRef}
        src={process.env.NEXT_PUBLIC_INTRO_BGM_URL || "/intro/bgm.mp3"}
        preload="auto"
        loop
      />

      {!started ? (
        <div className="intro-start">
          <p>사이버 추모관</p>
          <button type="button" className="btn" onClick={startPlayback}>
            시작하기
          </button>
          <button type="button" className="btn-ghost intro-skip" onClick={finish}>
            건너뛰기
          </button>
        </div>
      ) : (
        <button type="button" className="btn-ghost intro-skip floating" onClick={finish}>
          건너뛰기
        </button>
      )}
    </div>
  );
}
