import Link from "next/link";

const menus = [
  {
    title: "디지털 추모관",
    desc: "3D 추모실에서 영상·추모글·추억앨범으로 고인을 기억합니다.",
    href: "/memorial",
  },
  {
    title: "디지털 기록저장소",
    desc: "소년·청년·중년, 자녀·동반자와의 추억을 생애주기별로 남깁니다.",
    href: "/records",
  },
  {
    title: "개인화 추모공간",
    desc: "현대식·전통식·공원형·카페형 테마로 공간을 구성합니다.",
    href: "/memorial",
  },
  {
    title: "관리자",
    desc: "영상, 추모글, 앨범, 추모관 설정을 관리합니다.",
    href: "/admin",
  },
];

export default function HomePage() {
  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Memorial Platform</p>
        <h1>일상 속 추모, 아름다운 엔딩을 위한 준비</h1>
        <p className="lede">
          자신에 대한 기록과 소중한 사람을 위한 추모관을 한곳에서.
          언제 어디서나 기억하고, 나누고, 준비할 수 있는 디지털 추모 공간입니다.
        </p>
        <div className="cta-row">
          <Link href="/memorial" className="btn">
            추모관 입장
          </Link>
          <Link href="/records" className="btn-ghost">
            기록저장소
          </Link>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">주요 메뉴</h2>
        <p className="lede">이미지에서 제안된 핵심 기능을 바탕으로 구성했습니다.</p>
        <div className="menu-grid">
          {menus.map((m) => (
            <Link key={m.title} href={m.href} className="feature-card">
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">서비스 안내</h2>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>3D 추모실</h3>
            <p>웹에서 바로 둘러보는 추모 공간. 테마별 분위기와 제단·영정 구성을 제공합니다.</p>
          </article>
          <article className="feature-card">
            <h3>콘텐츠 기억</h3>
            <p>영상, 추모글, 추억앨범을 모아 가족과 지인이 함께 나눌 수 있습니다.</p>
          </article>
          <article className="feature-card">
            <h3>기록저장소</h3>
            <p>100MB 저장, 3년 운영(연장 가능), 배우자·자녀 등과 공동 운영을 지원합니다.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
