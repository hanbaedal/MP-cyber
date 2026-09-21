import { notFound } from "next/navigation";
import MemorialClient from "@/components/MemorialClient";
import { ensureDefaultHall } from "@/lib/seed";
import { MemorialHall } from "@/models/MemorialHall";
import { Video } from "@/models/Video";
import { Tribute } from "@/models/Tribute";
import { AlbumItem } from "@/models/AlbumItem";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function MemorialDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    await ensureDefaultHall();
    const hall = await MemorialHall.findById(id).lean();
    if (!hall) notFound();

    const [videos, tributes, albums] = await Promise.all([
      Video.find({ hallId: id }).sort({ sortOrder: 1 }).lean(),
      Tribute.find({ hallId: id, isPublic: true }).sort({ createdAt: -1 }).lean(),
      AlbumItem.find({ hallId: id }).sort({ sortOrder: 1 }).lean(),
    ]);

    return (
      <div className="page">
        <MemorialClient
          data={{
            hall: {
              _id: String(hall._id),
              title: hall.title,
              deceasedName: hall.deceasedName,
              lifespan: hall.lifespan,
              summary: hall.summary,
              portraitUrl: hall.portraitUrl,
              theme: hall.theme,
            },
            videos: videos.map((v) => ({
              _id: String(v._id),
              title: v.title,
              url: v.url,
              description: v.description,
            })),
            tributes: tributes.map((t) => ({
              _id: String(t._id),
              author: t.author,
              content: t.content,
              createdAt: String(t.createdAt),
            })),
            albums: albums.map((a) => ({
              _id: String(a._id),
              title: a.title,
              imageUrl: a.imageUrl,
              caption: a.caption,
            })),
          }}
        />
      </div>
    );
  } catch {
    return (
      <div className="page">
        <div className="panel">
          <h3>추모관을 열 수 없습니다</h3>
          <p>`MONGODB_URI` 연결을 확인해 주세요.</p>
        </div>
      </div>
    );
  }
}
