import { connectMongo } from "@/lib/mongodb";
import { MemorialHall } from "@/models/MemorialHall";
import { Video } from "@/models/Video";
import { Tribute } from "@/models/Tribute";
import { AlbumItem } from "@/models/AlbumItem";

export async function ensureDefaultHall() {
  await connectMongo();
  let hall = await MemorialHall.findOne({ isPublished: true }).sort({ createdAt: 1 });
  if (hall) return hall;

  hall = await MemorialHall.create({
    title: "별빛 추모관",
    deceasedName: "홍길동",
    lifespan: "1950 — 2024",
    summary: "일상 속에서 기억하고 나누는 디지털 추모 공간입니다.",
    portraitUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    theme: "modern",
    isPublished: true,
  });

  await Video.create({
    hallId: hall._id,
    title: "추모 영상",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "고인을 기억하는 영상입니다.",
    sortOrder: 0,
  });

  await Tribute.create({
    hallId: hall._id,
    author: "가족",
    content: "언제나 따뜻한 마음으로 우리를 보살펴 주셨습니다. 고맙습니다.",
    isPublic: true,
  });

  await AlbumItem.create([
    {
      hallId: hall._id,
      title: "젊은 날",
      imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop",
      caption: "가족과 함께한 시간",
      sortOrder: 0,
    },
    {
      hallId: hall._id,
      title: "산책",
      imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop",
      caption: "좋아하는 풍경",
      sortOrder: 1,
    },
  ]);

  return hall;
}
