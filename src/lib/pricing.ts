/** 선착순 무료·유료 기간 정책 */

export const LAUNCH_FREE_QUOTA = 100;
export const LAUNCH_FREE_YEARS = 3;

export type PaidPlanYears = 3 | 5 | 10;

export const PAID_PLANS: Array<{
  years: PaidPlanYears;
  label: string;
  priceKrw: number;
  note: string;
}> = [
  { years: 3, label: "3년 (표준)", priceKrw: 120_000, note: "기본 이용권" },
  { years: 5, label: "5년", priceKrw: 180_000, note: "연환산 약 10% 할인" },
  { years: 10, label: "10년", priceKrw: 300_000, note: "장기 보관 프리미엄" },
];

export type ApplyType = "welldying" | "memorial_family" | "memorial_only";

export const APPLY_TYPE_LABEL: Record<ApplyType, string> = {
  welldying: "웰다잉(본인) 이용신청",
  memorial_family: "추모(지정 유족) 이용신청",
  memorial_only: "추모만 이용신청",
};

export function formatKrw(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function addYears(from: Date, years: number) {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + years);
  return d;
}
