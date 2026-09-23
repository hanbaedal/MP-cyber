import type { SiteMode } from "@/lib/roles";
import { FAREWELL_MENUS, WELLDying_TOPICS } from "@/lib/roles";

export type AuthUser = {
  authenticated: boolean;
  role: "admin" | "member" | "guest" | null;
  loginId: string | null;
  name: string | null;
  hallId: string | null;
  memberId: string | null;
  memberKind: "owner" | "successor" | null;
  transferStatus: "living" | "transferred" | null;
  ownerMemberId: string | null;
  guest?: boolean;
};

export type NavItem = {
  href: string;
  label: string;
  children?: Array<{ href: string; label: string }>;
};

function welldyingChildren() {
  return WELLDying_TOPICS.map((t) => ({ href: t.href, label: t.title }));
}

function farewellChildren() {
  return FAREWELL_MENUS.map((m) => ({ href: m.href, label: m.title }));
}

/** 본인(생전): 웰다잉 CRUD, 추모 메뉴 숨김 */
function ownerNav(): NavItem[] {
  return [
    { href: "/", label: "홈" },
    {
      href: "/welldying",
      label: "웰다잉 준비 (CRUD)",
      children: welldyingChildren(),
    },
    { href: "/welldying/successor-setup", label: "유족 아이디 지정" },
  ];
}

/** 유족(이관 후): 웰다잉 읽기 + 이별준비 + 추모 CRUD */
function successorNav(hallId: string | null, transferred: boolean): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "홈" },
  ];

  if (transferred) {
    items.push(
      {
        href: "/farewell",
        label: "이별준비",
        children: farewellChildren(),
      },
      {
        href: "/memorial",
        label: "디지털 추모 (CRUD)",
        children: [
          ...(hallId
            ? [{ href: `/memorial/${hallId}`, label: "추모관 관리" }]
            : [{ href: "/memorial", label: "추모관" }]),
          { href: "/memorial", label: "추억앨범·영상" },
          {
            href: hallId ? `/memorial/${hallId}` : "/memorial",
            label: "추모글 관리",
          },
        ],
      },
    );
  } else {
    items.push({
      href: "/",
      label: "이관 대기 중",
      children: [{ href: "/", label: "사후 이관 후 추모 메뉴 개방" }],
    });
  }

  return items;
}

/** 웰다잉 방문자 */
function visitorWelldyingNav(): NavItem[] {
  return [
    { href: "/", label: "홈" },
    {
      href: "/welldying",
      label: "웰다잉 안내",
      children: welldyingChildren(),
    },
    {
      href: "/guide",
      label: "디지털 추모 안내",
      children: [
        { href: "/guide/what", label: "디지털 추모란?" },
        { href: "/guide/why", label: "필요한 이유" },
      ],
    },
    { href: "/memorial", label: "샘플 추모관 보기" },
    { href: "/apply", label: "이용신청" },
    { href: "/login", label: "로그인" },
  ];
}

/** 추모 방문자 */
function visitorMemorialNav(): NavItem[] {
  return [
    { href: "/memorial", label: "고인 찾기·추모관" },
    {
      href: "/farewell",
      label: "이별준비",
      children: farewellChildren(),
    },
    { href: "/apply", label: "추모관 이용신청" },
    { href: "/", label: "웰다잉으로 이동" },
    { href: "/login", label: "로그인" },
  ];
}

/** 초대 링크로 입장한 손님 */
function guestNav(hallId: string | null): NavItem[] {
  return [
    {
      href: hallId ? `/memorial/${hallId}` : "/memorial",
      label: "초대받은 추모관",
    },
    { href: "/memorial", label: "다른 고인 찾기" },
    { href: "/", label: "홈" },
  ];
}

function adminNav(): NavItem[] {
  return [
    { href: "/", label: "홈 (사이트맵)" },
    {
      href: "/welldying",
      label: "본인(생전) 영역",
      children: welldyingChildren(),
    },
    {
      href: "/farewell",
      label: "이별준비 (추모)",
      children: farewellChildren(),
    },
    {
      href: "/memorial",
      label: "유족(추모) 영역",
      children: [
        { href: "/memorial", label: "추모관 목록" },
        { href: "/records", label: "기록저장소" },
      ],
    },
    {
      href: "/admin",
      label: "관리자",
      children: [
        { href: "/admin/applications", label: "회원 등록신청" },
        { href: "/admin", label: "추모관·회원 관리" },
      ],
    },
  ];
}

export function buildNav(user: AuthUser | null, siteMode: SiteMode): NavItem[] {
  if (user?.authenticated && user.role === "admin") {
    return adminNav();
  }

  if (user?.authenticated && user.role === "guest") {
    return guestNav(user.hallId);
  }

  if (user?.authenticated && user.role === "member") {
    if (user.memberKind === "successor") {
      return successorNav(user.hallId, user.transferStatus === "transferred");
    }
    return ownerNav();
  }

  return siteMode === "memorial" ? visitorMemorialNav() : visitorWelldyingNav();
}

export function roleLabel(user: AuthUser | null): string {
  if (!user?.authenticated) return "";
  if (user.role === "admin") return "관리";
  if (user.role === "guest") return "초대손님";
  if (user.memberKind === "successor") {
    return user.transferStatus === "transferred" ? "유족" : "유족(이관 전)";
  }
  return "본인";
}
