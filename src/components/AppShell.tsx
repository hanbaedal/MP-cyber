"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import IntroOverlay from "@/components/IntroOverlay";
import WellDyingLogo from "@/components/WellDyingLogo";

export type AuthUser = {
  authenticated: boolean;
  role: "admin" | "member" | null;
  loginId: string | null;
  name: string | null;
  hallId: string | null;
};

type NavItem = {
  href: string;
  label: string;
  children?: Array<{ href: string; label: string }>;
};

function buildNav(user: AuthUser | null): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "홈" },
    {
      href: "/guide",
      label: "디지털 추모 안내",
      children: [
        { href: "/guide/what", label: "디지털 추모란?" },
        { href: "/guide/why", label: "필요한 이유" },
      ],
    },
    {
      href: "/memorial",
      label: "디지털 추모관",
      children: user?.hallId
        ? [{ href: `/memorial/${user.hallId}`, label: "내 추모관" }]
        : [{ href: "/memorial", label: "샘플 목록" }],
    },
    { href: "/records", label: "기록저장소" },
    { href: "/apply", label: "이용신청" },
  ];

  if (user?.role === "admin") {
    items.push({
      href: "/admin",
      label: "관리자",
      children: [
        { href: "/admin/applications", label: "회원 등록신청" },
        { href: "/admin", label: "추모관 관리" },
      ],
    });
  }

  return items;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "/memorial": true,
    "/guide": true,
    "/admin": true,
  });

  const loadUser = useCallback(async () => {
    const res = await fetch("/api/auth");
    const json = await res.json();
    setUser(json);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser, pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    setUser({
      authenticated: false,
      role: null,
      loginId: null,
      name: null,
      hallId: null,
    });
    router.push("/");
    router.refresh();
  }

  const nav = buildNav(user);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="header-left">
            <button
              type="button"
              className="explorer-toggle"
              onClick={() => setOpen((v) => !v)}
              aria-label="메뉴"
            >
              ☰
            </button>
            <Link href="/" className="brand">
              <WellDyingLogo size="sm" className="brand-logo" />
              <span className="brand-text">사이버 추모관</span>
            </Link>
          </div>
          <div className="header-right">
            {user?.authenticated ? (
              <>
                <span className="user-chip">
                  {user.name || user.loginId}
                  {user.role === "admin" ? " · 관리" : ""}
                </span>
                <button type="button" className="btn-ghost header-auth-btn" onClick={logout}>
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/login" className="btn header-auth-btn">
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      {open ? (
        <button
          type="button"
          className="explorer-backdrop"
          aria-label="메뉴 닫기"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside className={`explorer ${open ? "open" : ""}`}>
        <div className="explorer-title">탐색기</div>
        <ul className="explorer-tree">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hasChildren = !!item.children?.length;
            const isOpen = expanded[item.href] ?? active;

            return (
              <li key={item.href}>
                <div className="explorer-row">
                  {hasChildren ? (
                    <button
                      type="button"
                      className="tree-twist"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [item.href]: !isOpen,
                        }))
                      }
                      aria-label="펼치기"
                    >
                      {isOpen ? "▾" : "▸"}
                    </button>
                  ) : (
                    <span className="tree-twist ghost">•</span>
                  )}
                  <Link
                    href={item.href}
                    className={active ? "active" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </div>
                {hasChildren && isOpen ? (
                  <ul className="explorer-children">
                    {item.children!.map((child) => {
                      const childActive =
                        pathname === child.href ||
                        pathname.startsWith(`${child.href}/`);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={childActive ? "active" : undefined}
                            onClick={() => setOpen(false)}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </aside>

      <main className="app-main">
        {children}
        <SiteFooter />
      </main>
      <IntroOverlay />
    </div>
  );
}
