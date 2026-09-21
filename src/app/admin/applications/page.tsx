"use client";

/**
 * 회원 등록신청 관리 (1차 UI 골격)
 * - 리스트 → 모달 → 승인 시 계정 생성 + 솔라피 문자 (연동 예정)
 */
import { useMemo, useState } from "react";

type Application = {
  _id: string;
  name: string;
  phone: string;
  relation: string;
  purpose: string;
  memo?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const DEMO: Application[] = [
  {
    _id: "1",
    name: "최유진",
    phone: "010-5555-1001",
    relation: "자녀",
    purpose: "추모관",
    memo: "어머니 추모관 개설 희망",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    name: "강태호",
    phone: "010-5555-1002",
    relation: "배우자",
    purpose: "둘 다",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];

export default function ApplicationsPage() {
  const [items, setItems] = useState(DEMO);
  const [selected, setSelected] = useState<Application | null>(null);
  const [message, setMessage] = useState("");

  const pending = useMemo(
    () => items.filter((i) => i.status === "pending"),
    [items],
  );

  function approve(app: Application) {
    const loginId = `m${Date.now().toString().slice(-6)}`;
    const password = Math.random().toString(36).slice(-8);
    setItems((prev) =>
      prev.map((i) => (i._id === app._id ? { ...i, status: "approved" } : i)),
    );
    setSelected(null);
    setMessage(
      `${app.name}님 승인 완료. 아이디 ${loginId} / 비밀번호 ${password} (문자 발송은 솔라피 연동 후 자동 전송)`,
    );
    // TODO: POST /api/applications/approve + Solapi SMS
  }

  function reject(app: Application) {
    setItems((prev) =>
      prev.map((i) => (i._id === app._id ? { ...i, status: "rejected" } : i)),
    );
    setSelected(null);
    setMessage(`${app.name}님 신청을 반려했습니다.`);
  }

  return (
    <div className="page">
      <p className="eyebrow">Admin</p>
      <h1 className="section-title">회원 등록신청</h1>
      <p className="lede">신청 목록을 확인하고 승인 시 아이디·비밀번호를 발급합니다.</p>
      {message ? <p className="form-msg" style={{ marginTop: "0.5rem" }}>{message}</p> : null}

      <div className="table-list" style={{ marginTop: "0.85rem" }}>
        {pending.length === 0 ? (
          <p className="empty">대기 중인 신청이 없습니다.</p>
        ) : (
          pending.map((app) => (
            <button
              key={app._id}
              type="button"
              className="row app-row"
              onClick={() => setSelected(app)}
            >
              <span>
                <strong>{app.name}</strong> · {app.phone}
              </span>
              <span className="chip">{app.purpose}</span>
            </button>
          ))
        )}
      </div>

      {selected ? (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h3>신청 상세</h3>
            <p>이름: {selected.name}</p>
            <p>연락처: {selected.phone}</p>
            <p>관계: {selected.relation}</p>
            <p>목적: {selected.purpose}</p>
            {selected.memo ? <p>메모: {selected.memo}</p> : null}
            <div className="cta-row" style={{ marginTop: "0.75rem" }}>
              <button type="button" className="btn" onClick={() => approve(selected)}>
                승인 · 계정발급
              </button>
              <button type="button" className="btn-ghost" onClick={() => reject(selected)}>
                반려
              </button>
              <button type="button" className="btn-ghost" onClick={() => setSelected(null)}>
                닫기
              </button>
            </div>
            <p className="form-msg">
              승인 시 이름·아이디·비밀번호를 솔라피 문자로 발송할 예정입니다.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
