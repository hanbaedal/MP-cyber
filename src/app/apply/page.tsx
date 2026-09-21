"use client";

import { FormEvent, useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import Link from "next/link";

export default function ApplyPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    relation: "자녀",
    purpose: "추모관",
    password: "",
    memo: "",
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="page narrow">
        <p className="eyebrow">Application</p>
        <h1 className="section-title">접수 완료</h1>
        <p className="lede" style={{ marginTop: "0.4rem" }}>
          이용신청이 접수되었습니다. 확인 후 연락드리겠습니다.
        </p>
        <div className="panel" style={{ marginTop: "0.8rem" }}>
          <p>
            <strong>{form.name}</strong> / {form.phone}
          </p>
          <p>
            {form.relation} · {form.purpose}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <p className="eyebrow">Application</p>
      <h1 className="section-title">이용신청</h1>
      <p className="lede">필수 항목만 남겨 주세요. 관리자 확인 후 아이디를 발급합니다.</p>

      <form className="panel" onSubmit={onSubmit} style={{ marginTop: "0.75rem" }}>
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
          autoComplete="tel"
        />
        <PasswordInput
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          placeholder="희망 비밀번호 (선택)"
          autoComplete="new-password"
        />
        <select
          value={form.relation}
          onChange={(e) => setForm({ ...form, relation: e.target.value })}
        >
          <option>배우자</option>
          <option>자녀</option>
          <option>가족</option>
          <option>지인</option>
          <option>기타</option>
        </select>
        <select
          value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
        >
          <option>추모관</option>
          <option>기록저장소</option>
          <option>둘 다</option>
        </select>
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
        <button className="btn btn-block" type="submit">
          신청하기
        </button>
        <p className="form-msg">
          계정이 있으면 <Link href="/login">로그인</Link>하세요.
        </p>
      </form>
    </div>
  );
}
