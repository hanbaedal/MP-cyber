"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/nav";

export default function SuccessorSetupPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then(setUser);
  }, []);

  if (!user?.authenticated || user.memberKind !== "owner") {
    return (
      <div className="page">
        <h1>유족 아이디 지정</h1>
        <p>생전 본인 회원만 이용할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="hero compact-hero">
        <p className="eyebrow">준비</p>
        <h1>유족 아이디 지정</h1>
        <p className="lede">
          사후 이관 시 지정한 유족 아이디로 로그인하면, 웰다잉 기록은 읽기만 하고
          추모 메뉴를 관리하게 됩니다. (샘플: family01 / sample1234 → member01)
        </p>
      </section>
      <div className="prose-block">
        <p>
          현재 계정: <strong>{user.loginId}</strong> · 이관 상태:{" "}
          <strong>{user.transferStatus === "transferred" ? "이관됨" : "생전(living)"}</strong>
        </p>
        <p>
          다음 단계에서 관리자 승인 또는 본인 이관 실행 API를 연결할 예정입니다. 지금은
          시드 데이터로 <code>family01</code>(이관 전), <code>family02</code>(member02 이관
          후)를 제공합니다.
        </p>
      </div>
    </div>
  );
}
