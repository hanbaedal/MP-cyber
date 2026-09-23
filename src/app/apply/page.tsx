"use client";

import { FormEvent, useEffect, useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import Link from "next/link";
import {
  APPLY_TYPE_LABEL,
  formatKrw,
  type ApplyType,
  type PaidPlanYears,
} from "@/lib/pricing";

type PricingInfo = {
  launchFreeQuota: number;
  launchFreeYears: number;
  launchFreeRemaining: number;
  plans: Array<{ years: PaidPlanYears; label: string; priceKrw: number; note: string }>;
};

export default function ApplyPage() {
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [applyType, setApplyType] = useState<ApplyType>("welldying");
  const [planYears, setPlanYears] = useState<PaidPlanYears>(3);
  const [sent, setSent] = useState<{ message: string } | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    preferredLoginId: "",
    preferredPassword: "",
    relation: "자녀",
    ownerLoginId: "",
    memo: "",
  });

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((j) => setPricing(j.pricing))
      .catch(() => setPricing(null));
  }, []);

  const freeRemaining = pricing?.launchFreeRemaining ?? 0;
  const isFree = freeRemaining > 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applyType,
        ...form,
        planYears: isFree ? undefined : planYears,
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      setError(json.message || "신청 실패");
      return;
    }
    setSent({ message: json.message });
  }

  if (sent) {
    return (
      <div className="page narrow">
        <p className="eyebrow">Application</p>
        <h1 className="section-title">접수 완료</h1>
        <p className="lede" style={{ marginTop: "0.4rem" }}>
          {sent.message}
        </p>
        <p className="form-msg">
          <Link href="/login">로그인</Link>은 관리자 승인 후 가능합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <p className="eyebrow">Application</p>
      <h1 className="section-title">이용신청</h1>
      <p className="lede">
        웰다잉(본인) / 추모(유족·추모만) 중 선택해 신청하세요. 관리자 승인 후 로그인할 수
        있습니다.
      </p>

      {pricing ? (
        <div className="panel pricing-box" style={{ marginTop: "0.75rem" }}>
          <p>
            <strong>선착순 {pricing.launchFreeQuota}명</strong>:{" "}
            {pricing.launchFreeYears}년 이용 무료
            {isFree
              ? ` (남은 자리 ${freeRemaining}명)`
              : " — 마감, 아래 유료 기간을 선택하세요"}
          </p>
          {!isFree ? (
            <ul className="pricing-list">
              {pricing.plans.map((p) => (
                <li key={p.years}>
                  {p.label}: {formatKrw(p.priceKrw)} · {p.note}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <form className="panel" onSubmit={onSubmit} style={{ marginTop: "0.75rem" }}>
        <label className="field-label">신청 유형 *</label>
        <select
          value={applyType}
          onChange={(e) => setApplyType(e.target.value as ApplyType)}
        >
          {(Object.keys(APPLY_TYPE_LABEL) as ApplyType[]).map((k) => (
            <option key={k} value={k}>
              {APPLY_TYPE_LABEL[k]}
            </option>
          ))}
        </select>

        <input
          placeholder="이름 *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          autoComplete="name"
        />
        <input
          placeholder="휴대폰 *"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
          inputMode="tel"
        />
        <input
          placeholder="희망 아이디 *"
          value={form.preferredLoginId}
          onChange={(e) => setForm({ ...form, preferredLoginId: e.target.value })}
          required
          autoComplete="username"
        />
        <PasswordInput
          value={form.preferredPassword}
          onChange={(v) => setForm({ ...form, preferredPassword: v })}
          placeholder="희망 비밀번호 * (6자 이상)"
          autoComplete="new-password"
        />

        {applyType === "memorial_family" ? (
          <input
            placeholder="연결할 본인(웰다잉) 아이디 *"
            value={form.ownerLoginId}
            onChange={(e) => setForm({ ...form, ownerLoginId: e.target.value })}
            required
          />
        ) : null}

        <select
          value={form.relation}
          onChange={(e) => setForm({ ...form, relation: e.target.value })}
        >
          <option>배우자</option>
          <option>자녀</option>
          <option>가족</option>
          <option>지인</option>
          <option>본인</option>
          <option>기타</option>
        </select>

        {!isFree ? (
          <>
            <label className="field-label">이용 기간 *</label>
            <select
              value={planYears}
              onChange={(e) => setPlanYears(Number(e.target.value) as PaidPlanYears)}
            >
              {(pricing?.plans || []).map((p) => (
                <option key={p.years} value={p.years}>
                  {p.label} — {formatKrw(p.priceKrw)}
                </option>
              ))}
            </select>
          </>
        ) : null}

        <textarea
          placeholder="메모 (선택)"
          rows={3}
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
        />
        <label
          style={{
            display: "flex",
            gap: "0.4rem",
            alignItems: "flex-start",
            fontSize: "0.78rem",
            color: "var(--muted)",
          }}
        >
          <input type="checkbox" required style={{ width: "auto", marginTop: "0.15rem" }} />
          개인정보 수집·이용에 동의합니다.
        </label>
        {error ? <p className="form-msg">{error}</p> : null}
        <button className="btn btn-block" type="submit">
          신청하기
        </button>
        <p className="form-msg">
          · 웰다잉: 승인 후 본인 계정 활성 / 유족은 이관 전까지 비활성
          <br />· 추모(유족): 본인 생전엔 로그인 불가, 이관 후 활성
          <br />
          계정이 있으면 <Link href="/login">로그인</Link>
        </p>
      </form>
    </div>
  );
}
