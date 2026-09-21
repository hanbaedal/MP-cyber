"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const desktopLinks = [
  { href: "/", label: "홈" },
  { href: "/memorial", label: "추모관" },
  { href: "/records", label: "기록" },
  { href: "/apply", label: "이용신청" },
  { href: "/admin", label: "관리" },
];

const mobileLinks = [
  { href: "/", label: "홈", icon: "⌂" },
  { href: "/memorial", label: "추모관", icon: "▣" },
  { href: "/records", label: "기록", icon: "▤" },
  { href: "/apply", label: "신청", icon: "✎" },
  { href: "/admin", label: "관리", icon: "⚙" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">MP</span>
            <span className="brand-text">사이버 추모관</span>
          </Link>
          <nav className="site-nav-desktop">
            {desktopLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={pathname === l.href ? "active" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <nav className="bottom-nav" aria-label="모바일 메뉴">
        {mobileLinks.map((l) => {
          const active =
            l.href === "/"
              ? pathname === "/"
              : pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link key={l.href} href={l.href} className={active ? "active" : undefined}>
              <span className="icon" aria-hidden>
                {l.icon}
              </span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
