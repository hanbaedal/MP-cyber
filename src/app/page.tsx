import Link from "next/link";

const menus = [
  { title: "샘플 추모관", desc: "데모로 먼저 둘러보기", href: "/memorial", chip: "방문" },
  { title: "기록저장소", desc: "생애주기 추억 보관", href: "/records", chip: "안내" },
  { title: "이용신청", desc: "아이디 발급 요청", href: "/apply", chip: "신청" },
  { title: "로그인", desc: "회원·관리자 접속", href: "/admin", chip: "회원" },
];

export default function HomePage() {
  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Digital Memorial</p>
        <h1>일상 속 추모</h1>
        <p className="lede">
          추모실·추모글·추억앨범을 모바일에 맞춰 간편하게.
          샘플을 본 뒤 이용신청으로 시작해 보세요.
        </p>
        <div className="cta-row">
          <Link href="/memorial" className="btn">
            샘플 보기
          </Link>
          <Link href="/apply" className="btn-ghost">
            이용신청
          </Link>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">바로가기</h2>
        <div className="menu-grid">
          {menus.map((m) => (
            <Link key={m.title} href={m.href} className="feature-card">
              <span className="chip">{m.chip}</span>
              <h3 style={{ marginTop: "0.35rem" }}>{m.title}</h3>
              <p>{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">이용 흐름</h2>
        <div className="compact-list">
          <div className="compact-link">
            <div>
              <strong>1. 샘플 둘러보기</strong>
              <div>
                <span>추모실·글·앨범 예시 확인</span>
              </div>
            </div>
            <span className="chip">무료</span>
          </div>
          <div className="compact-link">
            <div>
              <strong>2. 이용신청</strong>
              <div>
                <span>연락처·관계만 간단히 제출</span>
              </div>
            </div>
            <span className="chip">1분</span>
          </div>
          <div className="compact-link">
            <div>
              <strong>3. 아이디 발급</strong>
              <div>
                <span>관리자 확인 후 안내</span>
              </div>
            </div>
            <span className="chip">승인</span>
          </div>
        </div>
      </section>
    </div>
  );
}
