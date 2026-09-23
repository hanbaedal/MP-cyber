import Link from "next/link";
import { WELLDying_TOPICS } from "@/lib/roles";

export default function WelldyingIndexPage() {
  return (
    <div className="page">
      <section className="hero compact-hero">
        <p className="eyebrow">Well-Dying</p>
        <h1>웰다잉 준비 7가지</h1>
        <p className="lede">
          생전 회원은 작성·수정하고, 유족은 이관 후 읽기만 하며, 방문자는 안내·샘플을
          봅니다.
        </p>
      </section>
      <ul className="welldying-index-list">
        {WELLDying_TOPICS.map((t) => (
          <li key={t.slug}>
            <Link href={t.href}>
              <strong>{t.title}</strong>
              <span>{t.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
