"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Post = {
  _id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  isSample?: boolean;
};

export default function FarewellBoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/farewell/board");
    const json = await res.json();
    setPosts(json.posts || []);
    setCanEdit(!!json.canEdit);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/farewell/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    const json = await res.json();
    if (!json.ok) {
      setMessage(json.message || "작성 실패");
      return;
    }
    setTitle("");
    setBody("");
    setMessage("등록되었습니다.");
    load();
  }

  async function remove(id: string) {
    if (!confirm("삭제할까요?")) return;
    await fetch(`/api/farewell/board?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="page">
      <section className="hero compact-hero">
        <p className="eyebrow">이별준비</p>
        <h1>가족 게시판</h1>
        <p className="lede">유족이 남기는 공지와 일정입니다. 방문자는 열람만 가능합니다.</p>
      </section>

      {canEdit ? (
        <form className="panel" onSubmit={onSubmit} style={{ marginBottom: "0.85rem" }}>
          <input
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="내용"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          <button className="btn" type="submit">
            글 등록
          </button>
          {message ? <p className="form-msg">{message}</p> : null}
        </form>
      ) : null}

      <div className="table-list">
        {posts.length === 0 ? (
          <p className="empty">게시글이 없습니다.</p>
        ) : (
          posts.map((p) => (
            <article key={p._id} className="row farewell-board-row">
              <div>
                <strong>{p.title}</strong>
                <p style={{ margin: "0.25rem 0 0", color: "var(--muted)", fontSize: "0.84rem" }}>
                  {p.body}
                </p>
                <span className="chip">
                  {p.authorName} · {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              {canEdit && !p.isSample ? (
                <button type="button" className="btn-ghost" onClick={() => remove(p._id)}>
                  삭제
                </button>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
