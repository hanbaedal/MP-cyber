"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { APPLY_TYPE_LABEL, type ApplyType } from "@/lib/pricing";

type Application = {
  _id: string;
  applyType: ApplyType;
  name: string;
  phone: string;
  preferredLoginId: string;
  relation?: string;
  memo?: string;
  ownerLoginId?: string;
  planYears: number;
  isLaunchFree: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [message, setMessage] = useState("");
  const [transferId, setTransferId] = useState("member01");
  const [deathDate, setDeathDate] = useState("");
  const [pricing, setPricing] = useState<{
    launchFreeRemaining: number;
    launchFreeQuota: number;
  } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/applications");
    const json = await res.json();
    if (json.items) setItems(json.items);
    if (json.pricing) {
      setPricing({
        launchFreeRemaining: json.pricing.launchFreeRemaining,
        launchFreeQuota: json.pricing.launchFreeQuota,
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = useMemo(
    () => items.filter((i) => i.status === "pending"),
    [items],
  );

  async function approve(app: Application) {
    const res = await fetch("/api/applications/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", id: app._id }),
    });
    const json = await res.json();
    setSelected(null);
    setMessage(
      json.ok
        ? `${json.message}${json.loginId ? ` / ID ${json.loginId}` : ""}${json.password ? ` / PW ${json.password}` : ""} (문자 연동 예정)`
        : json.message || "실패",
    );
    load();
  }

  async function reject(app: Application) {
    const res = await fetch("/api/applications/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", id: app._id }),
    });
    const json = await res.json();
    setSelected(null);
    setMessage(json.message || (json.ok ? "반려됨" : "실패"));
    load();
  }

  async function doTransfer() {
    if (!transferId.trim()) return;
    const res = await fetch("/api/applications/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "transfer",
        ownerLoginId: transferId.trim(),
        deathDate: deathDate || undefined,
      }),
    });
    const json = await res.json();
    setMessage(json.message || (json.ok ? "이관 완료" : "실패"));
  }

  return (
    <div className="page">
      <p className="eyebrow">Admin</p>
      <h1 className="section-title">회원 등록신청</h1>
      <p className="lede">
        승인 시 계정 생성. 본인 활성 시 유족은 비활성, 이관 시 본인 비활성·유족 활성.
        {pricing
          ? ` 선착순 무료 남은 자리 ${pricing.launchFreeRemaining}/${pricing.launchFreeQuota}.`
          : ""}
      </p>
      {message ? (
        <p className="form-msg" style={{ marginTop: "0.5rem" }}>
          {message}
        </p>
      ) : null}

      <div className="panel" style={{ marginTop: "0.75rem" }}>
        <h3 style={{ margin: "0 0 0.45rem", fontSize: "0.95rem" }}>사후 이관</h3>
        <div className="cta-row">
          <input
            placeholder="본인 로그인 아이디"
            value={transferId}
            onChange={(e) => setTransferId(e.target.value)}
            style={{ maxWidth: "12rem" }}
          />
          <input
            type="date"
            value={deathDate}
            onChange={(e) => setDeathDate(e.target.value)}
            style={{ maxWidth: "11rem" }}
          />
          <button type="button" className="btn" onClick={doTransfer}>
            이관 실행
          </button>
        </div>
      </div>

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
                <strong>{app.name}</strong> · {app.phone} · {app.preferredLoginId}
              </span>
              <span className="chip">
                {APPLY_TYPE_LABEL[app.applyType]}
                {app.isLaunchFree ? " · 무료" : ` · ${app.planYears}년`}
              </span>
            </button>
          ))
        )}
      </div>

      {selected ? (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h3>신청 상세</h3>
            <p>유형: {APPLY_TYPE_LABEL[selected.applyType]}</p>
            <p>이름: {selected.name}</p>
            <p>연락처: {selected.phone}</p>
            <p>희망 ID: {selected.preferredLoginId}</p>
            {selected.ownerLoginId ? <p>연결 본인: {selected.ownerLoginId}</p> : null}
            <p>관계: {selected.relation || "-"}</p>
            <p>
              요금: {selected.isLaunchFree ? "선착순 무료" : `${selected.planYears}년`}
            </p>
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
