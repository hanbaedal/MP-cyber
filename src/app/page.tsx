"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AuthUser = {
  authenticated: boolean;
  role: "admin" | "member" | null;
  name: string | null;
  hallId: string | null;
};

const guestMenus = [
  { title: "샘플 추모관", desc: "데모로 먼저 둘러보기", href: "/memorial", tone: "mint" },
  { title: "기록저장소", desc: "생애주기 추억 보관", href: "/records", tone: "sky" },
  { title: "이용신청", desc: "아이디 발급 요청", href: "/apply", tone: "peach" },
  { title: "로그인", desc: "회원·관리자 접속", href: "/login", tone: "lilac" },
];

const memberSitemap = [
  { title: "홈", desc: "사이트맵", href: "/", tone: "mint" },
  { title: "내 추모관", desc: "추모실·글·앨범", href: "hall", tone: "peach" },
  { title: "추모관 목록", desc: "공개 샘플 보기", href: "/memorial", tone: "sky" },
  { title: "기록저장소", desc: "생애 기록", href: "/records", tone: "cream" },
  { title: "이용신청", desc: "추가 신청", href: "/apply", tone: "lilac" },
];

const adminSitemap = [
  { title: "홈", desc: "사이트맵", href: "/", tone: "mint" },
  { title: "추모관 관리", desc: "콘텐츠 CRUD", href: "/admin", tone: "peach" },
  { title: "추모관 목록", desc: "공개 목록", href: "/memorial", tone: "sky" },
  { title: "기록저장소", desc: "기록 현황", href: "/records", tone: "cream" },
  { title: "회원·신청", desc: "발급·신청", href: "/apply", tone: "lilac" },
  { title: "로그인", desc: "계정 전환", href: "/login", tone: "rose" },
];

export default function HomePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  if (user?.authenticated) {
    const cards =
      user.role === "admin"
        ? adminSitemap
        : memberSitemap.map((c) =>
            c.href === "hall"
              ? {
                  ...c,
                  href: user.hallId ? `/memorial/${user.hallId}` : "/memorial",
                }
              : c,
          );

    return (
      <div className="page">
        <section className="hero compact-hero">
          <p className="eyebrow">Sitemap</p>
          <h1>안녕하세요, {user.name || "회원"}님</h1>
          <p className="lede">필요한 메뉴를 카드에서 바로 이동하세요.</p>
        </section>

        <section className="sitemap-grid">
          {cards.map((c) => (
            <Link key={c.title} href={c.href} className={`sitemap-card tone-${c.tone}`}>
              <strong>{c.title}</strong>
              <span>{c.desc}</span>
            </Link>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="hero compact-hero">
        <p className="eyebrow">Digital Memorial</p>
        <h1>일상 속 추모</h1>
        <p className="lede">
          추모실·추모글·추억앨범을 모바일에 맞춰 간편하게.
          샘플을 본 뒤 이용해 보세요.
        </p>
        <div className="cta-row">
          <Link href="/memorial" className="btn">
            샘플 보기
          </Link>
          <Link href="/login" className="btn-ghost">
            로그인
          </Link>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">바로가기</h2>
        <div className="sitemap-grid">
          {guestMenus.map((m) => (
            <Link key={m.title} href={m.href} className={`sitemap-card tone-${m.tone}`}>
              <strong>{m.title}</strong>
              <span>{m.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
