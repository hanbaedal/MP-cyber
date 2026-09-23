export type SiteMode = "welldying" | "memorial";

export type MemberKind = "owner" | "successor";

export type TransferStatus = "living" | "transferred";

export type SessionRole = "admin" | "member" | "guest";

export type WelldyingSlug =
  | "daily-memorial"
  | "digital-hall"
  | "ending-prep"
  | "advance-directive"
  | "ending-note"
  | "belongings"
  | "funeral";

export const WELLDying_TOPICS: Array<{
  slug: WelldyingSlug;
  title: string;
  summary: string;
  tone: string;
  icon: "heart" | "monitor" | "sun" | "document" | "note" | "box" | "tree";
  href: string;
}> = [
  {
    slug: "daily-memorial",
    title: "일상생활 속 추모",
    summary:
      "기억을 일상으로 가져오기. 추모는 거창한 의식이 아니라, 고인과의 추억을 일상 속에 자연스럽게 스며들게 하는 것에서 시작합니다.",
    tone: "mint",
    icon: "heart",
    href: "/welldying/daily-memorial",
  },
  {
    slug: "digital-hall",
    title: "디지털 추모관",
    summary:
      "시공간의 제약 없이 언제든 찾아가 마음을 전할 수 있는 온라인 추모 공간입니다.",
    tone: "sky",
    icon: "monitor",
    href: "/welldying/digital-hall",
  },
  {
    slug: "ending-prep",
    title: "아름다운 엔딩을 위한 준비",
    summary:
      "나와 남겨질 이들을 위해 삶의 마지막을 주체적으로 준비하는 것은, 남은 삶을 더욱 풍요롭게 만듭니다.",
    tone: "peach",
    icon: "sun",
    href: "/welldying/ending-prep",
  },
  {
    slug: "advance-directive",
    title: "사전연명의료의향서 작성",
    summary:
      "스스로 결정을 내리지 못할 때를 대비해, 무의미한 연명의료를 받지 않겠다는 의사를 법적 문서로 미리 등록해 두는 것입니다.",
    tone: "lilac",
    icon: "document",
    href: "/welldying/advance-directive",
  },
  {
    slug: "ending-note",
    title: "엔딩 노트(Ending Note) 기록",
    summary:
      "자산 정보, 장례 희망 사항, 비밀번호와 가족에게 전하고 싶은 메시지를 미리 적어 둡니다. 사진 3장·영상 1개를 함께 남길 수 있습니다.",
    tone: "cream",
    icon: "note",
    href: "/welldying/ending-note",
  },
  {
    slug: "belongings",
    title: "유품 정리와 미니멀 라이프",
    summary:
      "진짜 소중한 것만 남기고 정리하면, 남겨진 이들이 유품 정리로 겪는 부담을 줄일 수 있습니다.",
    tone: "rose",
    icon: "box",
    href: "/welldying/belongings",
  },
  {
    slug: "funeral",
    title: "장례 방식 미리 고민하기",
    summary:
      "전통 장례·자연장·가족장 등 원하는 형태를 미리 생각해 가족과 공유해 두는 것이 좋습니다.",
    tone: "mint",
    icon: "tree",
    href: "/welldying/funeral",
  },
];

export const SITE_MODE_KEY = "wd-site-mode";

export function isWelldyingSlug(value: string): value is WelldyingSlug {
  return WELLDying_TOPICS.some((t) => t.slug === value);
}

/** 추모 영역 — 이별준비 소메뉴 */
export const FAREWELL_MENUS: Array<{
  slug: string;
  title: string;
  summary: string;
  href: string;
}> = [
  {
    slug: "guide",
    title: "이별준비 안내",
    summary: "이별준비의 의미와 남겨질 이를 위한 이유를 안내합니다.",
    href: "/farewell/guide",
  },
  {
    slug: "note",
    title: "고인의 노트",
    summary: "생전에 남긴 엔딩 노트와 메시지·사진·영상을 읽습니다.",
    href: "/farewell/note",
  },
  {
    slug: "life",
    title: "생애 기록",
    summary: "일상·준비·유품·장례 희망 등 고인이 남긴 웰다잉 기록을 봅니다.",
    href: "/farewell/life",
  },
  {
    slug: "board",
    title: "가족 게시판",
    summary: "가족이 남기는 공지와 일정 (유족 작성, 방문 열람).",
    href: "/farewell/board",
  },
  {
    slug: "guestbook",
    title: "방명록",
    summary: "추모객이 마음을 전하는 조문 메시지입니다.",
    href: "/farewell/guestbook",
  },
];

