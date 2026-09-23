"use client";

import { useEffect, useState } from "react";

type Entry = {
  title: string;
  body: string;
  photoUrls?: string[];
  videoUrl?: string;
};

export default function FarewellNotePage() {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/welldying?slug=ending-note")
      .then((r) => r.json())
      .then((j) => {
        setEntry(j.entries?.[0] || null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <section className="hero compact-hero">
        <p className="eyebrow">이별준비</p>
        <h1>고인의 노트</h1>
        <p className="lede">
          생전에 남긴 엔딩 노트입니다. 유족·추모객은 읽기만 할 수 있습니다.
        </p>
      </section>

      {loading ? (
        <p className="empty">불러오는 중…</p>
      ) : (
        <div className="prose-block">
          <h2>{entry?.title || "엔딩 노트"}</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>
            {entry?.body || "아직 공개된 노트가 없습니다."}
          </p>
          {entry?.photoUrls?.filter(Boolean).length ? (
            <div className="photo-row">
              {entry.photoUrls.filter(Boolean).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" />
              ))}
            </div>
          ) : null}
          {entry?.videoUrl ? (
            <p>
              <a href={entry.videoUrl} target="_blank" rel="noopener noreferrer">
                영상 보기
              </a>
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
