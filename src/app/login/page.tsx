"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState({
    name: "",
    loginId: "",
    password: "",
    phone: "",
    relation: "자녀",
  });
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message || "로그인 실패");
      return;
    }
    router.push("/");
    router.refresh();
  }

  function onSignup(e: FormEvent) {
    e.preventDefault();
    // 1차: 신청 접수 UX (관리자 발급 모델 유지)
    setSent(true);
  }

  if (sent) {
    return (
      <div className="page narrow">
        <p className="eyebrow">Signup</p>
        <h1 className="section-title">가입 신청 완료</h1>
        <p className="lede">
          접수되었습니다. 관리자 확인 후 아이디를 안내드립니다.
        </p>
        <div className="panel" style={{ marginTop: "0.75rem" }}>
          <p>
            <strong>{signup.name}</strong> / {signup.loginId}
          </p>
          <p>
            {signup.phone} · {signup.relation}
          </p>
        </div>
        <div className="cta-row" style={{ marginTop: "0.75rem" }}>
          <Link href="/" className="btn">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <p className="eyebrow">Account</p>
      <h1 className="section-title">{mode === "login" ? "로그인" : "회원가입"}</h1>
      <p className="lede">
        {mode === "login"
          ? "회원 아이디 또는 관리자(admin)로 로그인하세요."
          : "희망 아이디·비밀번호를 남겨 주세요. 승인 후 사용합니다."}
      </p>

      <div className="tabs" style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          className={mode === "login" ? "tab active" : "tab"}
          onClick={() => setMode("login")}
        >
          로그인
        </button>
        <button
          type="button"
          className={mode === "signup" ? "tab active" : "tab"}
          onClick={() => setMode("signup")}
        >
          회원가입
        </button>
      </div>

      {mode === "login" ? (
        <form className="panel" onSubmit={onLogin} style={{ marginTop: "0.55rem" }}>
          <input
            placeholder="아이디 (예: member01 / admin)"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            autoComplete="username"
          />
          <PasswordInput
            value={password}
            onChange={setPassword}
            required
            placeholder="비밀번호"
          />
          <button className="btn btn-block" type="submit">
            로그인
          </button>
          {message ? <p className="form-msg">{message}</p> : null}
          <p className="form-msg">샘플: member01 / sample1234 · 관리자: admin / admin1234</p>
        </form>
      ) : (
        <form className="panel" onSubmit={onSignup} style={{ marginTop: "0.55rem" }}>
          <input
            placeholder="이름 *"
            value={signup.name}
            onChange={(e) => setSignup({ ...signup, name: e.target.value })}
            required
          />
          <input
            placeholder="희망 아이디 *"
            value={signup.loginId}
            onChange={(e) => setSignup({ ...signup, loginId: e.target.value })}
            required
            autoComplete="username"
          />
          <PasswordInput
            value={signup.password}
            onChange={(v) => setSignup({ ...signup, password: v })}
            required
            placeholder="희망 비밀번호 *"
            autoComplete="new-password"
          />
          <input
            placeholder="휴대폰 *"
            value={signup.phone}
            onChange={(e) => setSignup({ ...signup, phone: e.target.value })}
            required
            inputMode="tel"
          />
          <select
            value={signup.relation}
            onChange={(e) => setSignup({ ...signup, relation: e.target.value })}
          >
            <option>배우자</option>
            <option>자녀</option>
            <option>가족</option>
            <option>지인</option>
            <option>기타</option>
          </select>
          <button className="btn btn-block" type="submit">
            가입 신청
          </button>
          <p className="form-msg">바로 가입되지 않고, 관리자 승인 후 이용할 수 있습니다.</p>
        </form>
      )}

      <p className="form-msg" style={{ marginTop: "0.75rem" }}>
        샘플: 본인 <code>member01</code> / 유족(이관전) <code>family01</code> / 유족(이관후){" "}
        <code>family02</code> · 비밀번호 <code>sample1234</code> · 관리자{" "}
        <code>admin</code>
      </p>
      <p className="form-msg" style={{ marginTop: "0.35rem" }}>
        간단 신청만 하시려면 <Link href="/apply">이용신청</Link>으로 이동하세요.
      </p>
    </div>
  );
}
