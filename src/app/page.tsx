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
  { title: "디지털 추모란?", desc: "개념과 배경", href: "/guide/what", tone: "sky" },
  { title: "필요한 이유", desc: "기존 방식과의 차이", href: "/guide/why", tone: "peach" },
  { title: "이용신청", desc: "아이디 발급 요청", href: "/apply", tone: "lilac" },
];

const memberSitemap = [
  { title: "홈", desc: "사이트맵", href: "/", tone: "mint" },
  { title: "내 추모관", desc: "추모실·글·앨범", href: "hall", tone: "peach" },
  { title: "추모관 목록", desc: "공개 샘플 보기", href: "/memorial", tone: "sky" },
  { title: "기록저장소", desc: "생애 기록", href: "/records", tone: "cream" },
  { title: "안내", desc: "디지털 추모란?", href: "/guide/what", tone: "lilac" },
];

const adminSitemap = [
  { title: "홈", desc: "사이트맵", href: "/", tone: "mint" },
  { title: "회원 등록신청", desc: "승인·문자 발송", href: "/admin/applications", tone: "peach" },
  { title: "추모관 관리", desc: "콘텐츠 CRUD", href: "/admin", tone: "sky" },
  { title: "추모관 목록", desc: "공개 목록", href: "/memorial", tone: "cream" },
  { title: "안내 페이지", desc: "디지털 추모 안내", href: "/guide/what", tone: "lilac" },
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

      <section className="section prose-home">
        <h2 className="section-title">디지털 추모란?</h2>
        <div className="prose-block">
          <p>
            디지털 추모는 온라인과 디지털 기술을 활용해 고인을 기리고 기억하는
            새로운 추모 방식입니다. 묘소·장례식장 방문이 어렵더라도, 시간과
            장소의 제약 없이 고인을 추모하고 가족과 추억을 나눌 수 있습니다.
          </p>
          <p>
            코로나 이후 비대면이 일상화되며 온라인 추모관, 디지털 제사상,
            사진·영상·음성 기록 공유 등 다양한 형태로 확산되고 있습니다.
          </p>
        </div>
        <div className="cta-row">
          <Link href="/guide/what" className="btn-ghost">
            자세히 보기
          </Link>
          <Link href="/guide/why" className="btn-ghost">
            필요한 이유
          </Link>
        </div>
      </section>
    </div>
  );
}
