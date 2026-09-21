import Link from "next/link";

const links = [
  { href: "/", label: "홈" },
  { href: "/memorial", label: "디지털 추모관" },
  { href: "/records", label: "기록저장소" },
  { href: "/admin", label: "관리자" },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">MP</span>
          <span className="brand-text">사이버 추모관</span>
        </Link>
        <nav className="site-nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
