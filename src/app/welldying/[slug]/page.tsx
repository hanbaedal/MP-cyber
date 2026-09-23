"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  isWelldyingSlug,
  WELLDying_TOPICS,
  type WelldyingSlug,
} from "@/lib/roles";
import type { AuthUser } from "@/lib/nav";

type Entry = {
  _id?: string;
  title: string;
  body: string;
  photoUrls?: string[];
  videoUrl?: string;
};

export default function WelldyingDetailPage() {
  const params = useParams();
  const slugParam = String(params.slug || "");
  const topic = WELLDying_TOPICS.find((t) => t.slug === slugParam);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [showingSample, setShowingSample] = useState(false);
  const [body, setBody] = useState("");
  const [photoUrls, setPhotoUrls] = useState(["", "", ""]);
  const [videoUrl, setVideoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isWelldyingSlug(slugParam)) return;
    const auth = await fetch("/api/auth").then((r) => r.json());
    setUser(auth);
    const res = await fetch(`/api/welldying?slug=${slugParam}`);
    const json = await res.json();
    setCanEdit(!!json.canEdit);
    setShowingSample(!!json.showingSample);
    const first = json.entries?.[0] as Entry | undefined;
    if (first) {
      setEntry(first);
      setBody(first.body || "");
      const photos = [...(first.photoUrls || []), "", "", ""].slice(0, 3);
      setPhotoUrls(photos);
      setVideoUrl(first.videoUrl || "");
    } else {
      setBody("");
      setEntry({ title: topic?.title || slugParam, body: "" });
    }
  }, [slugParam, topic]);

  useEffect(() => {
    load();
  }, [load]);

  if (!topic || !isWelldyingSlug(slugParam)) {
    return (
      <div className="page">
        <p>존재하지 않는 메뉴입니다.</p>
        <Link href="/welldying">목록으로</Link>
      </div>
    );
  }

  const slug = slugParam as WelldyingSlug;
  const isEndingNote = slug === "ending-note";
  const accessNote =
    user?.role === "admin"
      ? "관리자: 전체 영역을 확인할 수 있습니다."
      : user?.memberKind === "owner"
        ? user.transferStatus === "transferred"
          ? "이관 후 본인 계정은 읽기 전용입니다."
          : "생전 본인: 작성·수정·삭제할 수 있습니다."
        : user?.memberKind === "successor"
          ? "유족: 고인의 기록은 읽기만 가능합니다."
          : "방문자: 안내 및 샘플만 볼 수 있습니다.";

  async function save() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/welldying", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title: topic!.title,
        body,
        photoUrls: photoUrls.filter(Boolean).slice(0, 3),
        videoUrl: videoUrl || undefined,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.ok) {
      setMessage(json.message || "저장 실패");
      return;
    }
    setMessage("저장되었습니다.");
    setShowingSample(false);
    load();
  }

  async function remove() {
    if (!confirm("이 기록을 삭제할까요?")) return;
    const res = await fetch(`/api/welldying?slug=${slug}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) {
      setMessage(json.message || "삭제 실패");
      return;
    }
    setMessage("삭제되었습니다.");
    setBody("");
    setPhotoUrls(["", "", ""]);
    setVideoUrl("");
  }

  return (
    <div className="page welldying-detail">
      <section className="hero compact-hero">
        <p className="eyebrow">웰다잉</p>
        <h1>{topic.title}</h1>
        <p className="lede">{topic.summary}</p>
        <p className="access-note">{accessNote}</p>
        {showingSample ? (
          <p className="sample-note">현재 샘플 안내를 보고 있습니다.</p>
        ) : null}
      </section>

      {slug === "digital-hall" ? (
        <div className="cta-row">
          <Link href="/memorial" className="btn">
            디지털 추모관 목록
          </Link>
          {user?.hallId ? (
            <Link href={`/memorial/${user.hallId}`} className="btn-ghost">
              내 추모관
            </Link>
          ) : null}
        </div>
      ) : null}

      <section className="welldying-editor tone-box">
        <h2>{canEdit ? "내 기록 작성" : "기록 내용"}</h2>
        {canEdit ? (
          <>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="내용을 작성해 주세요."
            />
            {isEndingNote ? (
              <div className="media-fields">
                <p className="field-label">사진 URL (최대 3장)</p>
                {photoUrls.map((url, i) => (
                  <input
                    key={i}
                    value={url}
                    onChange={(e) => {
                      const next = [...photoUrls];
                      next[i] = e.target.value;
                      setPhotoUrls(next);
                    }}
                    placeholder={`사진 ${i + 1} URL`}
                  />
                ))}
                <p className="field-label">동영상 URL (1개)</p>
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="YouTube embed 또는 영상 URL"
                />
              </div>
            ) : null}
            <div className="cta-row">
              <button type="button" className="btn" onClick={save} disabled={saving}>
                {saving ? "저장 중…" : "저장"}
              </button>
              <button type="button" className="btn-ghost" onClick={remove}>
                삭제
              </button>
            </div>
          </>
        ) : (
          <div className="prose-block">
            <p>{entry?.body || topic.summary}</p>
            {entry?.photoUrls?.filter(Boolean).length ? (
              <div className="photo-row">
                {entry.photoUrls.filter(Boolean).map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" />
                ))}
              </div>
            ) : null}
            {entry?.videoUrl ? (
              <p>
                <a href={entry.videoUrl} target="_blank" rel="noopener noreferrer">
                  영상 보기
                </a>
              </p>
            ) : null}
          </div>
        )}
        {message ? <p className="form-message">{message}</p> : null}
      </section>

      <p>
        <Link href="/welldying">← 웰다잉 목록</Link>
      </p>
    </div>
  );
}
