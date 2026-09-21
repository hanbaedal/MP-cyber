const NAMU_WELL_DYING =
  "https://namu.wiki/w/%EC%9B%B0%EB%8B%A4%EC%9E%89";

const cards = [
  {
    title: "일상생활 속 추모",
    body: "기억을 일상으로 가져오기. 추모는 거창한 의식이 아니라, 고인과의 추억을 일상 속에 자연스럽게 스며들게 하는 것에서 시작합니다.",
    tone: "mint",
  },
  {
    title: "디지털 추모관",
    body: "시공간의 제약 없이 언제든 찾아가 마음을 전할 수 있는 온라인 추모 공간입니다. SNS 계정을 활용해 추모의 글을 남길 수도 있습니다.",
    tone: "sky",
  },
  {
    title: "아름다운 엔딩을 위한 준비",
    body: "나와 남겨질 이들을 위해 삶의 마지막을 주체적으로 준비하는 것은, 남은 삶을 더욱 풍요롭게 만듭니다.",
    tone: "peach",
  },
  {
    title: "사전연명의료의향서 작성",
    body: "스스로 결정을 내리지 못할 때를 대비해, 무의미한 연명의료를 받지 않겠다는 의사를 법적 문서로 미리 등록해 두는 것입니다.",
    tone: "lilac",
  },
  {
    title: "엔딩 노트(Ending Note) 기록",
    body: "남겨진 가족을 위해 자산 정보, 장례 희망 사항, 비밀번호 등과 함께, 가족에게 전하고 싶은 메시지를 미리 적어 둡니다.",
    tone: "cream",
  },
  {
    title: "유품 정리와 미니멀 라이프",
    body: "진짜 소중한 것만 남기고 주변을 정리하면, 남겨진 이들이 유품 정리로 겪는 심적·물질적 부담을 줄일 수 있습니다.",
    tone: "rose",
  },
  {
    title: "장례 방식 미리 고민하기",
    body: "전통 장례뿐 아니라 자연장(수목장·잔디장)이나 가족장 등 원하는 형태를 미리 생각해 가족과 공유해 두는 것이 좋습니다.",
    tone: "mint",
  },
] as const;

export default function HomePage() {
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
        은 인간으로서의 존엄성과 품위를 지키며 자신의 삶을 아름답게 마무리하는 것을
        뜻합니다.
      </p>

      <section className="home-card-list" aria-label="웰다잉 안내">
        {cards.map((card) => (
          <article key={card.title} className={`home-info-card tone-${card.tone}`}>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
