import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { MemberKind, SessionRole, TransferStatus } from "@/lib/roles";

const COOKIE = "mp_session";

export type SessionPayload = {
  role: SessionRole;
  loginId?: string;
  name?: string;
  memberId?: string;
  hallId?: string;
  memberKind?: MemberKind;
  transferStatus?: TransferStatus;
  ownerMemberId?: string;
  /** 게스트 초대 입장 */
  guest?: boolean;
  inviteToken?: string;
};

function getSecret() {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "mp-cyber-dev-secret";
  return new TextEncoder().encode(secret);
}

async function setSession(payload: SessionPayload, maxAgeSec = 60 * 60 * 24 * 7) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${Math.max(1, Math.floor(maxAgeSec / 3600))}h`)
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec,
  });
}

export async function createAdminSession() {
  await setSession({ role: "admin", loginId: "admin", name: "관리자" });
}

export async function createMemberSession(data: {
  memberId: string;
  loginId: string;
  name: string;
  hallId?: string;
  memberKind: MemberKind;
  transferStatus: TransferStatus;
  ownerMemberId?: string;
}) {
  await setSession({
    role: "member",
    memberId: data.memberId,
    loginId: data.loginId,
    name: data.name,
    hallId: data.hallId,
    memberKind: data.memberKind,
    transferStatus: data.transferStatus,
    ownerMemberId: data.ownerMemberId,
  });
}

/** 초대 링크로 입장한 임시 게스트 (해당 추모관만) */
export async function createGuestSession(data: {
  hallId: string;
  inviteToken: string;
  hallTitle?: string;
  expiresInSec?: number;
}) {
  const maxAge = data.expiresInSec ?? 60 * 60 * 24 * 14;
  await setSession(
    {
      role: "guest",
      guest: true,
      hallId: data.hallId,
      inviteToken: data.inviteToken,
      name: "초대 손님",
      loginId: "guest",
    },
    maxAge,
  );
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
  jar.delete("mp_admin");
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value || jar.get("mp_admin")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    let role: SessionRole = "admin";
    if (payload.role === "member") role = "member";
    if (payload.role === "guest" || payload.guest === true) role = "guest";

    const memberKind =
      payload.memberKind === "successor"
        ? "successor"
        : role === "member"
          ? "owner"
          : undefined;
    const transferStatus =
      payload.transferStatus === "transferred" ? "transferred" : "living";

    return {
      role,
      loginId: typeof payload.loginId === "string" ? payload.loginId : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined,
      memberId: typeof payload.memberId === "string" ? payload.memberId : undefined,
      hallId: typeof payload.hallId === "string" ? payload.hallId : undefined,
      memberKind,
      transferStatus: role === "member" ? transferStatus : undefined,
      ownerMemberId:
        typeof payload.ownerMemberId === "string" ? payload.ownerMemberId : undefined,
      guest: role === "guest",
      inviteToken:
        typeof payload.inviteToken === "string" ? payload.inviteToken : undefined,
    };
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated() {
  const session = await getSession();
  return session?.role === "admin";
}

export async function clearAdminSession() {
  await clearSession();
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "admin1234";
  return password === expected;
}
