"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HomeCardIcon from "@/components/HomeCardIcon";
import WellDyingLogo from "@/components/WellDyingLogo";
import { WELLDying_TOPICS, SITE_MODE_KEY, type SiteMode } from "@/lib/roles";
import type { AuthUser } from "@/lib/nav";

const NAMU_WELL_DYING =
  "https://namu.wiki/w/%EC%9B%B0%EB%8B%A4%EC%9E%89";

export default function HomePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [siteMode, setSiteMode] = useState<SiteMode>("welldying");

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then(setUser)
      .catch(() => setUser(null));
    const saved = localStorage.getItem(SITE_MODE_KEY) as SiteMode | null;
    if (saved === "memorial" || saved === "welldying") setSiteMode(saved);
  }, []);

  if (user?.authenticated && user.role === "admin") {
    return (
      <div className="page home-role">
        <section className="home-role-hero">
          <h1>관리자 홈</h1>
          <p>본인(생전) 사이트맵과 유족(추모) 사이트맵을 함께 관리합니다.</p>
        </section>
        <div className="admin-sitemap-grid">
          <section className="admin-sitemap-block tone-mint">
            <h2>본인(생전) 사이트맵</h2>
            <p>회원이 살아 있을 때 작성하는 웰다잉 7가지 CRUD</p>
            <ul>
              {WELLDying_TOPICS.map((t) => (
                <li key={t.slug}>
                  <Link href={t.href}>{t.title}</Link>
                </li>
              ))}
            </ul>
            <Link href="/admin" className="btn">
              회원·추모관 관리
            </Link>
          </section>
          <section className="admin-sitemap-block tone-sky">
            <h2>유족(추모) 사이트맵</h2>
            <p>이관 후 유족이 관리하는 디지털 추모 영역</p>
            <ul>
              <li>
                <Link href="/memorial">디지털 추모관</Link>
              </li>
              <li>
                <Link href="/records">기록저장소·추억 미디어</Link>
              </li>
              <li>
                <Link href="/admin/applications">회원 등록신청</Link>
              </li>
            </ul>
            <Link href="/memorial" className="btn">
              추모관 목록
            </Link>
          </section>
        </div>
      </div>
    );
  }

  if (user?.authenticated && user.memberKind === "successor") {
    const ready = user.transferStatus === "transferred";
    return (
      <div className="page home-role">
        <section className="home-role-hero">
          <h1>유족 홈</h1>
          <p>
            {ready
              ? "고인의 웰다잉 기록은 읽기만 가능하며, 추모 관련 메뉴를 관리할 수 있습니다."
              : "아직 사후 이관 전입니다. 이관 후 추모 메뉴가 열립니다."}
          </p>
        </section>
        <div className="sitemap-grid">
          {ready ? (
            <>
              <Link href="/farewell" className="sitemap-card tone-cream">
                <strong>이별준비</strong>
                <span>디지털 추모 · 고인의 노트·생애 기록·방명록</span>
              </Link>
              <Link
                href={user.hallId ? `/memorial/${user.hallId}` : "/memorial"}
                className="sitemap-card tone-sky"
              >
                <strong>추모관</strong>
                <span>디지털 추모 · 앨범·영상·추모글</span>
              </Link>
              <Link href="/farewell/board" className="sitemap-card tone-peach">
                <strong>가족 게시판</strong>
                <span>디지털 추모 · 유족 공지</span>
              </Link>
            </>
          ) : (
            <div className="sitemap-card tone-lilac">
              <strong>이관 대기</strong>
              <span>관리자 또는 본인 이관 후 추모 메뉴 개방</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (user?.authenticated && user.role === "member") {
    return (
      <div className="page home-role">
        <section className="home-role-hero">
          <h1>본인(생전) 홈</h1>
          <p>웰다잉 7가지를 작성·수정합니다. 추모 메뉴는 이관 전까지 표시되지 않습니다.</p>
        </section>
        <section className="home-card-list home-card-list-static" aria-label="웰다잉 준비">
          {WELLDying_TOPICS.map((card) => (
            <Link
              key={card.slug}
              href={card.href}
              className={`home-info-card tone-${card.tone}`}
            >
              <HomeCardIcon name={card.icon} />
              <div className="home-info-body">
                <h2>{card.title}</h2>
                <p>{card.summary}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    );
  }

  // 방문자: 모드별
  if (siteMode === "memorial") {
    return (
      <div className="page home-role">
        <section className="home-role-hero">
          <h1>추모 방문</h1>
          <p>디지털 추모에서 고인을 찾거나, 이별준비(고인의 기록·방명록)를 이용할 수 있습니다.</p>
          <div className="cta-row">
            <Link href="/memorial" className="btn">
              고인 찾기
            </Link>
            <Link href="/farewell" className="btn-ghost">
              이별준비
            </Link>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                localStorage.setItem(SITE_MODE_KEY, "welldying");
                setSiteMode("welldying");
              }}
            >
              웰다잉으로 이동
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page home-welldying">
      <p className="home-lead">
        <a
          href={NAMU_WELL_DYING}
          target="_blank"
          rel="noopener noreferrer"
          className="home-lead-link"
        >
          웰다잉(Well-dying)
        </a>
        은
        <br className="home-lead-br" />
        인간으로서의 존엄성과 품위를 지키며
        <br className="home-lead-br" />
        자신의 삶을 아름답게 마무리하는 것을 뜻합니다.
      </p>

      <section className="home-card-list" aria-label="웰다잉 안내">
        {WELLDying_TOPICS.map((card) => (
          <Link
            key={card.slug}
            href={card.href}
            className={`home-info-card tone-${card.tone}`}
          >
            <HomeCardIcon name={card.icon} />
            <div className="home-info-body">
              <h2>{card.title}</h2>
              <p>{card.summary}</p>
            </div>
          </Link>
        ))}
        <div className="home-logo-slot">
          <WellDyingLogo size="sm" className="home-grid-logo" />
          <p className="home-slot-msg">
            기억은 일상 속에,
            <br />
            준비는 지금부터.
          </p>
        </div>
      </section>
    </div>
  );
}
