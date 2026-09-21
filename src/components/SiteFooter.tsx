import Link from "next/link";

const SNS = [
  {
    label: "페이스북",
    href: "https://www.facebook.com/share/1AgidWsma4/",
    icon: "f",
  },
  {
    label: "인스타그램",
    href: "https://www.instagram.com/hanbaedal",
    icon: "◎",
  },
  {
    label: "네이버카페",
    href: "https://cafe.naver.com/dahyangsanbang",
    icon: "N",
  },
  {
    label: "유튜브",
    href: "https://www.youtube.com/@%EC%B5%9C%EC%B0%BD%EA%B8%B8-p2g",
    icon: "▶",
  },
  {
    label: "카카오톡",
    href: "https://pf.kakao.com/_AFxlGX/chat",
    icon: "💬",
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-company">
          <p>주식회사 웰러님</p>
          <p>경기도 부천시 상동 407 1번지 7층 A12호 대양훼미리코인</p>
          <p>032-621-8267</p>
        </div>
        <div className="footer-sns">
          {SNS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="sns-icon"
              aria-label={s.label}
              title={s.label}
            >
              <span>{s.icon}</span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
