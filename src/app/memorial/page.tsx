import Link from "next/link";
import { ensureDefaultHall } from "@/lib/seed";
import { MemorialHall } from "@/models/MemorialHall";

export const dynamic = "force-dynamic";

export default async function MemorialListPage() {
  let halls: Array<{
    _id: string;
    title: string;
    deceasedName: string;
    lifespan?: string;
    summary?: string;
  }> = [];
  let error = "";

  try {
    await ensureDefaultHall();
    const docs = await MemorialHall.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    halls = docs.map((d) => ({
      _id: String(d._id),
      title: d.title,
      deceasedName: d.deceasedName,
      lifespan: d.lifespan,
      summary: d.summary,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "추모관을 불러오지 못했습니다.";
  }

  return (
    <div className="page">
      <p className="eyebrow">Memorial</p>
      <h1 className="section-title">디지털 추모관</h1>
      <p className="lede">샘플 추모관을 선택해 입장하세요.</p>

      {error ? (
        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <h3>연결 안내</h3>
          <p>{error}</p>
          <p>Render/로컬에 `MONGODB_URI` 환경변수를 설정해 주세요.</p>
        </div>
      ) : (
        <div className="menu-grid" style={{ marginTop: "1.5rem" }}>
          {halls.map((h) => (
            <Link key={h._id} href={`/memorial/${h._id}`} className="feature-card">
              <h3>{h.title}</h3>
              <p>
                {h.deceasedName}
                {h.lifespan ? ` · ${h.lifespan}` : ""}
              </p>
              {h.summary ? <p>{h.summary}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
