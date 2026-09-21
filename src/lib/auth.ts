import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "mp_session";

export type SessionRole = "admin" | "member";

export type SessionPayload = {
  role: SessionRole;
  loginId?: string;
  name?: string;
  memberId?: string;
  hallId?: string;
};

function getSecret() {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "mp-cyber-dev-secret";
  return new TextEncoder().encode(secret);
}

async function setSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
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
}) {
  await setSession({
    role: "member",
    memberId: data.memberId,
    loginId: data.loginId,
    name: data.name,
    hallId: data.hallId,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
  // 이전 관리자 쿠키 호환 제거
  jar.delete("mp_admin");
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value || jar.get("mp_admin")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role === "member" ? "member" : "admin";
    return {
      role,
      loginId: typeof payload.loginId === "string" ? payload.loginId : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined,
      memberId: typeof payload.memberId === "string" ? payload.memberId : undefined,
      hallId: typeof payload.hallId === "string" ? payload.hallId : undefined,
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
