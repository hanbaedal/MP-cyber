"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type InviteRow = {
  _id: string;
  token: string;
  label?: string;
  expiresAt: string;
  maxUses: number;
  useCount: number;
  isActive: boolean;
};

export default function InvitePanel({ hallId }: { hallId: string }) {
  const [visible, setVisible] = useState(false);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [label, setLabel] = useState("");
  const [days, setDays] = useState(14);
  const [msg, setMsg] = useState("");
  const [lastUrl, setLastUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const auth = await fetch("/api/auth").then((r) => r.json());
    const can =
      auth.authenticated &&
      (auth.role === "admin" ||
        (auth.role === "member" &&
          auth.memberKind === "successor" &&
          auth.transferStatus === "transferred" &&
          auth.hallId === hallId));
    setVisible(!!can);
    if (!can) return;

    const res = await fetch(`/api/invites?hallId=${encodeURIComponent(hallId)}`);
    const json = await res.json();
    if (json.ok) setInvites(json.invites || []);
  }, [hallId]);

  useEffect(() => {
    load();
  }, [load]);

  async function createInvite(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setLastUrl("");
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hallId,
          label: label || undefined,
          days,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setMsg(json.message || "발급 실패");
        return;
      }
      const url =
        json.url ||
        `${typeof window !== "undefined" ? window.location.origin : ""}${json.path}`;
      setLastUrl(url);
      setMsg("초대 링크가 발급되었습니다. 복사해 카톡·문자로 보내 주세요.");
      setLabel("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setMsg("클립보드에 복사했습니다.");
    } catch {
      setMsg("복사에 실패했습니다. 아래 주소를 직접 선택해 주세요.");
    }
  }

  if (!visible) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <section className="panel" style={{ marginTop: "1.25rem" }}>
      <h3>가족·지인 초대 링크</h3>
      <p className="lede" style={{ fontSize: "0.95rem", marginTop: "0.35rem" }}>
        로그인 없이 링크로만 이 추모관에 입장할 수 있습니다. 유족이 카톡·문자로
        공유하세요.
      </p>

      <form
        onSubmit={createInvite}
        className="invite-form"
        style={{ display: "grid", gap: "0.6rem", marginTop: "0.85rem" }}
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="메모 (예: 친척 공유용)"
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          유효 기간
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{ maxWidth: "8rem" }}
          >
            <option value={7}>7일</option>
            <option value={14}>14일</option>
            <option value={30}>30일</option>
            <option value={90}>90일</option>
          </select>
        </label>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "발급 중…" : "초대 링크 만들기"}
        </button>
      </form>

      {lastUrl ? (
        <div style={{ marginTop: "0.75rem" }}>
          <code style={{ wordBreak: "break-all", fontSize: "0.85rem" }}>{lastUrl}</code>
          <div className="cta-row" style={{ marginTop: "0.5rem" }}>
            <button type="button" className="btn" onClick={() => copyUrl(lastUrl)}>
              링크 복사
            </button>
          </div>
        </div>
      ) : null}

      {msg ? <p className="form-msg">{msg}</p> : null}

      {invites.length > 0 ? (
        <ul style={{ marginTop: "1rem", paddingLeft: "1.1rem", fontSize: "0.9rem" }}>
          {invites.slice(0, 8).map((inv) => {
            const url = `${origin}/invite/${inv.token}`;
            const expired = new Date(inv.expiresAt).getTime() < Date.now();
            return (
              <li key={inv._id} style={{ marginBottom: "0.55rem" }}>
                <strong>{inv.label || "초대"}</strong>
                {" · "}
                {expired || !inv.isActive ? "만료/중지" : "유효"}
                {" · "}
                사용 {inv.useCount}
                {inv.maxUses > 0 ? `/${inv.maxUses}` : ""}
                {" · "}
                ~{new Date(inv.expiresAt).toLocaleDateString("ko-KR")}
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ marginLeft: "0.4rem", padding: "0.15rem 0.5rem" }}
                  onClick={() => copyUrl(url)}
                  disabled={expired || !inv.isActive}
                >
                  복사
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
