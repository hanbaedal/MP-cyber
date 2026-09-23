"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type HallListItem = {
  _id: string;
  title: string;
  deceasedName: string;
  lifespan?: string;
  summary?: string;
};

export default function MemorialSearchList({ halls }: { halls: HallListItem[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return halls;
    return halls.filter((h) => {
      const hay = `${h.deceasedName} ${h.title} ${h.lifespan || ""} ${h.summary || ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [halls, q]);

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <form
        className="panel"
        onSubmit={(e) => e.preventDefault()}
        style={{ marginBottom: "1.25rem" }}
      >
        <h3>고인 찾기</h3>
        <p className="lede" style={{ fontSize: "0.95rem", margin: "0.35rem 0 0.75rem" }}>
          성함·추모관 이름·연도 등으로 공개 추모관을 검색한 뒤 입장해 추모글을 남길 수
          있습니다. 유족에게 받은 초대 링크가 있으면 로그인 없이 바로 입장됩니다.
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="예: 홍길동, 2024…"
          aria-label="고인·추모관 검색"
          autoComplete="off"
        />
        {q.trim() ? (
          <p className="form-msg" style={{ marginTop: "0.5rem" }}>
            {filtered.length}건
          </p>
        ) : null}
      </form>

      {filtered.length === 0 ? (
        <p className="empty">
          {q.trim()
            ? "검색 결과가 없습니다. 철자를 확인하거나 유족에게 초대 링크를 요청해 주세요."
            : "공개된 추모관이 없습니다."}
        </p>
      ) : (
        <div className="menu-grid">
          {filtered.map((h) => (
            <Link key={h._id} href={`/memorial/${h._id}`} className="feature-card">
              <h3>{h.title}</h3>
              <p>
                {h.deceasedName}
                {h.lifespan ? ` · ${h.lifespan}` : ""}
              </p>
              {h.summary ? <p>{h.summary}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
