"use client";

import { FormEvent, useEffect, useState } from "react";

type RecordItem = {
  _id: string;
  stage: string;
  title: string;
  content?: string;
  mediaUrl?: string;
  mediaType: string;
  coOwners: string[];
  expiresAt: string;
  sizeBytes: number;
};

const STAGE_LABEL: Record<string, string> = {
  boyhood: "소년",
  youth: "청년",
  midlife: "중년",
  child: "나의 자녀",
  partner: "나의 동반자",
  other: "기타",
};

export default function RecordsClient() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [used, setUsed] = useState(0);
  const [max, setMax] = useState(100 * 1024 * 1024);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    stage: "youth",
    title: "",
    content: "",
    mediaUrl: "",
    mediaType: "text",
    coOwners: "",
    sizeBytes: "1024",
  });

  async function load() {
    const res = await fetch("/api/records");
    const json = await res.json();
    if (!res.ok) {
      setError(json.message || "기록을 불러오지 못했습니다.");
      return;
    }
    setRecords(json.records || []);
    setUsed(json.usage?.used || 0);
    setMax(json.usage?.max || max);
    setError("");
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        coOwners: form.coOwners
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        sizeBytes: Number(form.sizeBytes || 0),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message || "등록 실패 (관리자 로그인 필요)");
      return;
    }
    setForm({
      stage: "youth",
      title: "",
      content: "",
      mediaUrl: "",
      mediaType: "text",
      coOwners: "",
      sizeBytes: "1024",
    });
    await load();
  }

  const pct = Math.min(100, Math.round((used / max) * 100));

  return (
    <div className="page">
      <p className="eyebrow">Life Archive</p>
      <h1 className="section-title">디지털 기록저장소</h1>
      <p className="lede">
        나의 소년, 청년, 중년 그리고 나의 자녀, 나의 동반자와의 소중한 추억을 기록해 보세요.
      </p>

      <div className="panel" style={{ marginTop: "1.5rem" }}>
        <h3>서비스 특징</h3>
        <p>소중한 사람과 함께 운영할 수 있습니다. (배우자, 자녀 등)</p>
        <p>운영기간 3년, 이후 의사에 따라 연장 가능합니다.</p>
        <p>저장공간 100MB — 글, 사진, 영상 등 다양한 콘텐츠를 등록할 수 있습니다.</p>
        <div className="usage-bar" style={{ marginTop: "0.8rem" }}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="form-msg">
          사용량 {(used / (1024 * 1024)).toFixed(2)}MB / {(max / (1024 * 1024)).toFixed(0)}MB
        </p>
      </div>

      {error ? <p className="form-msg">{error}</p> : null}

      <div className="tribute-layout" style={{ marginTop: "1.2rem" }}>
        <form className="panel" onSubmit={onSubmit}>
          <h3>기록 추가 (관리자)</h3>
          <select
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value })}
          >
            {Object.entries(STAGE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input
            placeholder="제목"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="내용"
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <input
            placeholder="미디어 URL (선택)"
            value={form.mediaUrl}
            onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
          />
          <input
            placeholder="공동운영자 (쉼표 구분)"
            value={form.coOwners}
            onChange={(e) => setForm({ ...form, coOwners: e.target.value })}
          />
          <input
            placeholder="용량(bytes)"
            value={form.sizeBytes}
            onChange={(e) => setForm({ ...form, sizeBytes: e.target.value })}
          />
          <button className="btn" type="submit">
            저장
          </button>
        </form>

        <div className="table-list">
          {records.length === 0 ? (
            <p className="empty">아직 기록이 없습니다.</p>
          ) : (
            records.map((r) => (
              <article key={r._id} className="content-card">
                <h3>
                  [{STAGE_LABEL[r.stage] || r.stage}] {r.title}
                </h3>
                {r.content ? <p>{r.content}</p> : null}
                {r.coOwners?.length ? (
                  <p>공동운영: {r.coOwners.join(", ")}</p>
                ) : null}
                <p className="form-msg">
                  만료: {new Date(r.expiresAt).toLocaleDateString("ko-KR")}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
