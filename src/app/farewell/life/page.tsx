"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WELLDying_TOPICS } from "@/lib/roles";

type Entry = {
  slug: string;
  title: string;
  body: string;
};

export default function FarewellLifePage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    fetch("/api/welldying")
      .then((r) => r.json())
      .then((j) => setEntries(j.entries || []));
  }, []);

  const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e]));

  return (
    <div className="page">
      <section className="hero compact-hero">
        <p className="eyebrow">이별준비</p>
        <h1>생애 기록</h1>
        <p className="lede">
          고인이 웰다잉으로 남긴 준비와 일상 기록입니다. (읽기 전용)
        </p>
      </section>

      <ul className="welldying-index-list">
        {WELLDying_TOPICS.filter((t) => t.slug !== "digital-hall").map((t) => {
          const e = bySlug[t.slug];
          return (
            <li key={t.slug}>
              <div className="farewell-life-card">
                <strong>{t.title}</strong>
                <span>{e?.body || t.summary}</span>
                {t.slug === "ending-note" ? (
                  <Link href="/farewell/note">노트 자세히 보기 →</Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
