"use client";

import { FormEvent, useEffect, useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import Link from "next/link";

type Hall = {
  _id: string;
  title: string;
  deceasedName: string;
  lifespan?: string;
  summary?: string;
  portraitUrl?: string;
  theme: string;
};

type Member = {
  _id: string;
  loginId: string;
  name: string;
  password?: string;
  phone?: string;
  relation?: string;
  hallTitle?: string | null;
  deceasedName?: string | null;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [halls, setHalls] = useState<Hall[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedHall, setSelectedHall] = useState("");
  const [message, setMessage] = useState("");
  const [videos, setVideos] = useState<Array<{ _id: string; title: string; url: string }>>([]);
  const [tributes, setTributes] = useState<Array<{ _id: string; author: string; content: string }>>([]);
  const [albums, setAlbums] = useState<Array<{ _id: string; title: string; imageUrl: string }>>([]);

  const [hallForm, setHallForm] = useState({
    title: "",
    deceasedName: "",
    lifespan: "",
    summary: "",
    portraitUrl: "",
    theme: "modern",
  });
  const [videoForm, setVideoForm] = useState({ title: "", url: "", description: "" });
  const [albumForm, setAlbumForm] = useState({ title: "", imageUrl: "", caption: "" });

  async function refreshAuth() {
    const res = await fetch("/api/auth");
    const json = await res.json();
    setAuthed(!!json.authenticated && json.role === "admin");
  }

  async function loadHalls() {
    const res = await fetch("/api/halls");
    const json = await res.json();
    const list = (json.halls || []).map((h: Hall & { _id: { toString?: () => string } }) => ({
      ...h,
      _id: String(h._id),
    }));
    setHalls(list);
    if (!selectedHall && list[0]) setSelectedHall(list[0]._id);
  }

  async function loadMembers() {
    const res = await fetch("/api/members");
    const json = await res.json();
    setMembers(json.members || []);
  }

  async function loadContents(hallId: string) {
    if (!hallId) return;
    const res = await fetch(`/api/halls/${hallId}`);
    const json = await res.json();
    if (!res.ok) return;
    setVideos((json.videos || []).map((v: { _id: string }) => ({ ...v, _id: String(v._id) })));
    setTributes((json.tributes || []).map((t: { _id: string }) => ({ ...t, _id: String(t._id) })));
    setAlbums((json.albums || []).map((a: { _id: string }) => ({ ...a, _id: String(a._id) })));
  }

  useEffect(() => {
    refreshAuth().then(() => {
      loadHalls();
      loadMembers();
    });
  }, []);

  useEffect(() => {
    if (selectedHall) loadContents(selectedHall);
  }, [selectedHall]);

  async function login(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: "admin", password }),
    });
    const json = await res.json();
    if (!res.ok || json.role !== "admin") {
      setMessage(json.message || "관리자 로그인 실패");
      return;
    }
    setMessage("로그인되었습니다.");
    setAuthed(true);
    await loadMembers();
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthed(false);
  }

  async function createHall(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/halls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hallForm),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message || "추모관 생성 실패");
      return;
    }
    setMessage("추모관이 생성되었습니다.");
    setHallForm({
      title: "",
      deceasedName: "",
      lifespan: "",
      summary: "",
      portraitUrl: "",
      theme: "modern",
    });
    await loadHalls();
  }

  async function updateTheme(theme: string) {
    if (!selectedHall) return;
    const res = await fetch(`/api/halls/${selectedHall}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message || "테마 변경 실패");
      return;
    }
    setMessage(`테마가 ${theme}(으)로 변경되었습니다.`);
    await loadHalls();
  }

  async function addVideo(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...videoForm, hallId: selectedHall }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message || "영상 등록 실패");
      return;
    }
    setVideoForm({ title: "", url: "", description: "" });
    await loadContents(selectedHall);
  }

  async function addAlbum(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...albumForm, hallId: selectedHall }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message || "앨범 등록 실패");
      return;
    }
    setAlbumForm({ title: "", imageUrl: "", caption: "" });
    await loadContents(selectedHall);
  }

  async function remove(kind: "videos" | "tributes" | "albums", id: string) {
    const res = await fetch(`/api/${kind}?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      setMessage(json.message || "삭제 실패");
      return;
    }
    await loadContents(selectedHall);
  }

  if (!authed) {
    return (
      <div className="page narrow">
        <h1 className="section-title">관리자 로그인</h1>
        <form className="panel" onSubmit={login} style={{ marginTop: "0.75rem" }}>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="관리자 비밀번호"
            required
          />
          <button className="btn btn-block" type="submit">
            로그인
          </button>
          <p className="form-msg">
            통합 로그인은 <Link href="/login">로그인</Link> (admin / 비밀번호)
          </p>
          {message ? <p className="form-msg">{message}</p> : null}
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="cta-row" style={{ justifyContent: "space-between" }}>
        <h1 className="section-title">관리자</h1>
        <button className="btn-ghost" type="button" onClick={logout}>
          로그아웃
        </button>
      </div>
      {message ? <p className="form-msg">{message}</p> : null}

      <div className="admin-grid" style={{ marginTop: "1rem" }}>
        <section className="panel">
          <h3>샘플 회원 (3명)</h3>
          <div className="table-list">
            {members.length === 0 ? (
              <p className="form-msg">회원 데이터를 불러오는 중이거나 아직 없습니다.</p>
            ) : (
              members.map((m) => (
                <div key={m._id} className="row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                  <strong>
                    {m.name} ({m.loginId})
                  </strong>
                  <span>
                    비번 {m.password || "****"} · {m.relation} · {m.hallTitle || "-"} / {m.deceasedName || "-"}
                  </span>
                </div>
              ))
            )}
          </div>
          <p className="form-msg">공통 샘플 비밀번호: sample1234</p>
        </section>

        <section className="panel">
          <h3>추모관 선택 / 테마</h3>
          <select value={selectedHall} onChange={(e) => setSelectedHall(e.target.value)}>
            {halls.map((h) => (
              <option key={h._id} value={h._id}>
                {h.title} ({h.deceasedName})
              </option>
            ))}
          </select>
          <div className="cta-row">
            {["modern", "traditional", "park", "cafe"].map((t) => (
              <button key={t} type="button" className="btn-ghost" onClick={() => updateTheme(t)}>
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>새 추모관</h3>
          <form onSubmit={createHall} className="admin-grid">
            <input
              placeholder="추모관 이름"
              value={hallForm.title}
              onChange={(e) => setHallForm({ ...hallForm, title: e.target.value })}
              required
            />
            <input
              placeholder="고인 성함"
              value={hallForm.deceasedName}
              onChange={(e) => setHallForm({ ...hallForm, deceasedName: e.target.value })}
              required
            />
            <input
              placeholder="생애 (예: 1950 — 2024)"
              value={hallForm.lifespan}
              onChange={(e) => setHallForm({ ...hallForm, lifespan: e.target.value })}
            />
            <textarea
              placeholder="소개"
              value={hallForm.summary}
              onChange={(e) => setHallForm({ ...hallForm, summary: e.target.value })}
            />
            <input
              placeholder="영정 이미지 URL"
              value={hallForm.portraitUrl}
              onChange={(e) => setHallForm({ ...hallForm, portraitUrl: e.target.value })}
            />
            <select
              value={hallForm.theme}
              onChange={(e) => setHallForm({ ...hallForm, theme: e.target.value })}
            >
              <option value="modern">현대식</option>
              <option value="traditional">전통식</option>
              <option value="park">공원형</option>
              <option value="cafe">카페형</option>
            </select>
            <button className="btn" type="submit">
              생성
            </button>
          </form>
        </section>

        <section className="panel">
          <h3>영상 등록</h3>
          <form onSubmit={addVideo} className="admin-grid">
            <input
              placeholder="제목"
              value={videoForm.title}
              onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
              required
            />
            <input
              placeholder="영상 URL (YouTube embed 권장)"
              value={videoForm.url}
              onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
              required
            />
            <input
              placeholder="설명"
              value={videoForm.description}
              onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
            />
            <button className="btn" type="submit">
              영상 추가
            </button>
          </form>
          <div className="table-list">
            {videos.map((v) => (
              <div key={v._id} className="row">
                <span>{v.title}</span>
                <button className="danger" type="button" onClick={() => remove("videos", v._id)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>추억앨범 등록</h3>
          <form onSubmit={addAlbum} className="admin-grid">
            <input
              placeholder="제목"
              value={albumForm.title}
              onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
              required
            />
            <input
              placeholder="이미지 URL"
              value={albumForm.imageUrl}
              onChange={(e) => setAlbumForm({ ...albumForm, imageUrl: e.target.value })}
              required
            />
            <input
              placeholder="캡션"
              value={albumForm.caption}
              onChange={(e) => setAlbumForm({ ...albumForm, caption: e.target.value })}
            />
            <button className="btn" type="submit">
              사진 추가
            </button>
          </form>
          <div className="table-list">
            {albums.map((a) => (
              <div key={a._id} className="row">
                <span>{a.title}</span>
                <button className="danger" type="button" onClick={() => remove("albums", a._id)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>추모글 관리</h3>
          <div className="table-list">
            {tributes.map((t) => (
              <div key={t._id} className="row">
                <span>
                  {t.author}: {t.content.slice(0, 40)}
                </span>
                <button className="danger" type="button" onClick={() => remove("tributes", t._id)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
