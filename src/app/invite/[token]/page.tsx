"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function InviteRedeemPage() {
  const params = useParams();
  const router = useRouter();
  const token = String(params.token || "");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("초대 링크를 확인하는 중…");
  const [hallId, setHallId] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("잘못된 링크입니다.");
      return;
    }
    fetch("/api/invites/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok) {
          setStatus("error");
          setMessage(json.message || "입장할 수 없습니다.");
          return;
        }
        setStatus("ok");
        setHallId(json.hallId);
        setMessage(
          json.skippedLogin
            ? json.message
            : `${json.deceasedName || "고인"} 추모관에 초대 손님으로 입장합니다.`,
        );
        const id = json.hallId;
        window.setTimeout(() => {
          router.replace(`/memorial/${id}`);
          router.refresh();
        }, 900);
      })
      .catch(() => {
        setStatus("error");
        setMessage("네트워크 오류로 입장하지 못했습니다.");
      });
  }, [token, router]);

  return (
    <div className="page narrow">
      <p className="eyebrow">Invite</p>
      <h1 className="section-title">추모 초대</h1>
      <p className="lede" style={{ marginTop: "0.5rem" }}>
        {message}
      </p>
      {status === "error" ? (
        <div className="cta-row" style={{ marginTop: "1rem" }}>
          <Link href="/memorial" className="btn">
            공개 추모관 찾기
          </Link>
          <Link href="/" className="btn-ghost">
            홈
          </Link>
        </div>
      ) : null}
      {status === "ok" && hallId ? (
        <p className="form-msg">
          이동하지 않으면{" "}
          <Link href={`/memorial/${hallId}`}>여기</Link>를 눌러 주세요.
        </p>
      ) : null}
    </div>
  );
}
