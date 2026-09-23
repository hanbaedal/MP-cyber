import Link from "next/link";
import { FAREWELL_MENUS } from "@/lib/roles";

export default function FarewellIndexPage() {
  return (
    <div className="page">
      <section className="hero compact-hero">
        <p className="eyebrow">Farewell</p>
        <h1>이별준비</h1>
        <p className="lede">
          고인이 생전에 남긴 기록과, 가족이 전하는 공지·추모객 방명록을 한곳에서
          봅니다.
        </p>
      </section>
      <ul className="welldying-index-list">
        {FAREWELL_MENUS.map((m) => (
          <li key={m.slug}>
            <Link href={m.href}>
              <strong>{m.title}</strong>
              <span>{m.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
