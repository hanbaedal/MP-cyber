import Link from "next/link";

const SNS = [
  {
    label: "페이스북",
    href: "https://www.facebook.com/share/1AgidWsma4/",
    className: "sns-facebook",
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14.5 8.5V6.8c0-.7.1-1.1 1.2-1.1H17V3h-2.3C11.8 3 11 4.5 11 6.6v1.9H9v2.8h2V21h3.5v-9.7h2.4l.3-2.8h-2.7z"
        />
      </svg>
    ),
  },
  {
    label: "인스타그램",
    href: "https://www.instagram.com/hanbaedal",
    className: "sns-instagram",
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3zm0 7.7A3 3 0 1 1 15 12a3 3 0 0 1-3 3zm5.9-8.9a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1zM12 4.6c-2 0-2.3 0-3.1.1a4 4 0 0 0-2.7 1.1 4 4 0 0 0-1.1 2.7c-.1.8-.1 1.1-.1 3.1s0 2.3.1 3.1a4 4 0 0 0 1.1 2.7 4 4 0 0 0 2.7 1.1c.8.1 1.1.1 3.1.1s2.3 0 3.1-.1a4 4 0 0 0 2.7-1.1 4 4 0 0 0 1.1-2.7c.1-.8.1-1.1.1-3.1s0-2.3-.1-3.1a4 4 0 0 0-1.1-2.7 4 4 0 0 0-2.7-1.1c-.8-.1-1.1-.1-3.1-.1zm0 11.6a4.3 4.3 0 1 1 4.3-4.3 4.3 4.3 0 0 1-4.3 4.3zm5.6-9.6a1.6 1.6 0 1 0-1.6 1.6 1.6 1.6 0 0 0 1.6-1.6z"
        />
      </svg>
    ),
  },
  {
    label: "네이버카페",
    href: "https://cafe.naver.com/dahyangsanbang",
    className: "sns-naver",
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M15.5 6v5.4L8.7 6H6v12h2.5v-5.4L15.3 18H18V6z"
        />
      </svg>
    ),
  },
  {
    label: "유튜브",
    href: "https://www.youtube.com/@%EC%B5%9C%EC%B0%BD%EA%B8%B8-p2g",
    className: "sns-youtube",
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.2V8.8L15.5 12z"
        />
      </svg>
    ),
  },
  {
    label: "카카오톡",
    href: "https://pf.kakao.com/_AFxlGX/chat",
    className: "sns-kakao",
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 4C7.6 4 4 6.9 4 10.4c0 2.2 1.5 4.2 3.7 5.3l-.9 3.3 3.6-2.3c.5.1 1 .1 1.6.1 4.4 0 8-2.9 8-6.4S16.4 4 12 4z"
        />
      </svg>
    ),
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="footer-copy">COPYRIGHT HaeSoo ALL RIGHTS RESERVED.</p>
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
              className={`sns-icon ${s.className}`}
              aria-label={s.label}
              title={s.label}
            >
              {s.svg}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
