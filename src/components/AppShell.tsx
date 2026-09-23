"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import IntroOverlay from "@/components/IntroOverlay";
import WellDyingLogo from "@/components/WellDyingLogo";
import { buildNav, roleLabel, type AuthUser } from "@/lib/nav";
import { SITE_MODE_KEY, type SiteMode } from "@/lib/roles";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [siteMode, setSiteMode] = useState<SiteMode>("welldying");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "/memorial": true,
    "/guide": true,
    "/admin": true,
    "/welldying": true,
    "/farewell": true,
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
    const saved = localStorage.getItem(SITE_MODE_KEY) as SiteMode | null;
    if (saved === "memorial" || saved === "welldying") {
      setSiteMode(saved);
    } else if (pathname.startsWith("/memorial") || pathname.startsWith("/farewell")) {
      setSiteMode("memorial");
    }
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function switchMode(mode: SiteMode) {
    setSiteMode(mode);
    localStorage.setItem(SITE_MODE_KEY, mode);
    router.push(mode === "memorial" ? "/memorial" : "/");
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    setUser({
      authenticated: false,
      role: null,
      loginId: null,
      name: null,
      hallId: null,
      memberId: null,
      memberKind: null,
      transferStatus: null,
      ownerMemberId: null,
    });
    router.push("/");
    router.refresh();
  }

  const nav = buildNav(user, siteMode);
  const isVisitor = !user?.authenticated || user.role === "guest";
  const chip = roleLabel(user);

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
            <Link href="/" className="brand" aria-label="Well-Dying 홈">
              <WellDyingLogo size="sm" className="brand-logo" />
            </Link>
            {isVisitor ? (
              <div className="mode-switch" role="group" aria-label="방문 모드">
                <button
                  type="button"
                  className={siteMode === "welldying" ? "active" : undefined}
                  onClick={() => switchMode("welldying")}
                >
                  웰다잉
                </button>
                <button
                  type="button"
                  className={siteMode === "memorial" ? "active" : undefined}
                  onClick={() => switchMode("memorial")}
                >
                  추모
                </button>
              </div>
            ) : null}
          </div>
          <div className="header-right">
            {user?.authenticated ? (
              <>
                <span className="user-chip">
                  {user.name || user.loginId}
                  {chip ? ` · ${chip}` : ""}
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
        <div className="explorer-title">
          탐색기
          {isVisitor ? (
            <span className="explorer-mode-tag">
              {siteMode === "memorial" ? "추모 방문" : "웰다잉 방문"}
            </span>
          ) : null}
        </div>
        <ul className="explorer-tree">
          {nav.map((item) => {
            const childActive = item.children?.some(
              (c) => pathname === c.href || pathname.startsWith(`${c.href}/`),
            );
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`) ||
                  !!childActive;
            const hasChildren = !!item.children?.length;
            const isOpen = expanded[item.href] ?? active;

            return (
              <li key={`${item.href}-${item.label}`}>
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
                        <li key={`${child.href}-${child.label}`}>
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
