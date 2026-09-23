"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Hall = { _id: string; title: string; deceasedName: string };
type Tribute = {
  _id: string;
  author: string;
  content: string;
  createdAt: string;
};

export default function FarewellGuestbookPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [hallId, setHallId] = useState("");
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/halls")
      .then((r) => r.json())
      .then((j) => {
        const list = j.halls || j || [];
        setHalls(Array.isArray(list) ? list : []);
        if (list[0]?._id) setHallId(String(list[0]._id));
      });
  }, []);

  const load = useCallback(async () => {
    if (!hallId) return;
    const res = await fetch(`/api/tributes?hallId=${hallId}`);
    const json = await res.json();
    setTributes(json.tributes || json || []);
  }, [hallId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/tributes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hallId, author, content }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message || "등록 실패");
      return;
    }
    setAuthor("");
    setContent("");
    setMessage("방명록에 등록되었습니다.");
    load();
  }

  return (
    <div className="page">
      <section className="hero compact-hero">
        <p className="eyebrow">이별준비</p>
        <h1>방명록</h1>
        <p className="lede">추모객이 마음을 전하는 공간입니다.</p>
      </section>

      {halls.length > 0 ? (
        <select
          value={hallId}
          onChange={(e) => setHallId(e.target.value)}
          style={{ marginBottom: "0.75rem", maxWidth: "20rem" }}
        >
          {halls.map((h) => (
            <option key={h._id} value={h._id}>
              {h.title} ({h.deceasedName})
            </option>
          ))}
        </select>
      ) : (
        <p className="empty">
          공개 추모관이 없습니다. <Link href="/memorial">추모관 목록</Link>
        </p>
      )}

      <form className="panel" onSubmit={onSubmit} style={{ marginBottom: "0.85rem" }}>
        <input
          placeholder="이름"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <textarea
          placeholder="추모의 글"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button className="btn" type="submit" disabled={!hallId}>
          남기기
        </button>
        {message ? <p className="form-msg">{message}</p> : null}
      </form>

      <div className="table-list">
        {tributes.length === 0 ? (
          <p className="empty">아직 방명록이 없습니다.</p>
        ) : (
          tributes.map((t) => (
            <article key={t._id} className="row">
              <div>
                <strong>{t.author}</strong>
                <p style={{ margin: "0.25rem 0 0", color: "var(--muted)", fontSize: "0.84rem" }}>
                  {t.content}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
