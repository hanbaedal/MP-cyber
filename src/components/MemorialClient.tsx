"use client";

import dynamic from "next/dynamic";
import { FormEvent, useMemo, useState } from "react";

const MemorialRoom3D = dynamic(() => import("@/components/MemorialRoom3D"), {
  ssr: false,
  loading: () => <div className="room3d-fallback">3D 추모실 준비 중…</div>,
});

type HallPayload = {
  hall: {
    _id: string;
    title: string;
    deceasedName: string;
    lifespan?: string;
    summary?: string;
    portraitUrl?: string;
    theme: "modern" | "traditional" | "park" | "cafe";
  };
  videos: Array<{ _id: string; title: string; url: string; description?: string }>;
  tributes: Array<{ _id: string; author: string; content: string; createdAt: string }>;
  albums: Array<{ _id: string; title: string; imageUrl: string; caption?: string }>;
};

const TABS = [
  { id: "room", label: "추모실" },
  { id: "videos", label: "영상" },
  { id: "tributes", label: "추모글" },
  { id: "albums", label: "추억앨범" },
] as const;

export default function MemorialClient({ data }: { data: HallPayload }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("room");
  const [tributes, setTributes] = useState(data.tributes);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const themeLabel = useMemo(() => {
    const map = {
      modern: "현대식",
      traditional: "전통식",
      park: "공원형",
      cafe: "카페형",
    };
    return map[data.hall.theme];
  }, [data.hall.theme]);

  async function submitTribute(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/tributes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hallId: data.hall._id,
        author: author || "익명",
        content,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message || "등록에 실패했습니다.");
      return;
    }
    setTributes((prev) => [json.tribute, ...prev]);
    setAuthor("");
    setContent("");
    setMessage("추모글이 등록되었습니다.");
  }

  return (
    <div className="memorial-view">
      <section className="memorial-hero">
        <div>
          <p className="eyebrow">{themeLabel} 추모공간</p>
          <h1>{data.hall.title}</h1>
          <p className="lede">
            {data.hall.deceasedName}
            {data.hall.lifespan ? ` · ${data.hall.lifespan}` : ""}
          </p>
          {data.hall.summary ? <p className="summary">{data.hall.summary}</p> : null}
        </div>
        {data.hall.portraitUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.hall.portraitUrl}
            alt={data.hall.deceasedName}
            className="portrait"
          />
        ) : null}
      </section>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "tab active" : "tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "room" && (
        <MemorialRoom3D
          theme={data.hall.theme}
          name={data.hall.deceasedName}
          portraitUrl={data.hall.portraitUrl}
        />
      )}

      {tab === "videos" && (
        <div className="grid-cards">
          {data.videos.length === 0 ? (
            <p className="empty">등록된 영상이 없습니다.</p>
          ) : (
            data.videos.map((v) => (
              <article key={v._id} className="content-card">
                <h3>{v.title}</h3>
                {v.description ? <p>{v.description}</p> : null}
                <div className="video-wrap">
                  <iframe
                    src={v.url.includes("embed") ? v.url : v.url}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {tab === "tributes" && (
        <div className="tribute-layout">
          <form className="panel" onSubmit={submitTribute}>
            <h3>추모글 남기기</h3>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="이름"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="추모의 마음을 남겨 주세요"
              required
              rows={4}
            />
            <button type="submit" className="btn">
              등록
            </button>
            {message ? <p className="form-msg">{message}</p> : null}
          </form>
          <div className="tribute-list">
            {tributes.map((t) => (
              <article key={t._id} className="content-card">
                <h3>{t.author}</h3>
                <p>{t.content}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === "albums" && (
        <div className="album-grid">
          {data.albums.length === 0 ? (
            <p className="empty">등록된 사진이 없습니다.</p>
          ) : (
            data.albums.map((a) => (
              <figure key={a._id} className="album-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.imageUrl} alt={a.title} />
                <figcaption>
                  <strong>{a.title}</strong>
                  {a.caption ? <span>{a.caption}</span> : null}
                </figcaption>
              </figure>
            ))
          )}
        </div>
      )}
    </div>
  );
}
