import { connectMongo } from "@/lib/mongodb";
import { MemorialHall } from "@/models/MemorialHall";
import { Video } from "@/models/Video";
import { Tribute } from "@/models/Tribute";
import { AlbumItem } from "@/models/AlbumItem";
import { Member } from "@/models/Member";

const SAMPLE_MEMBERS = [
  {
    loginId: "member01",
    name: "김민수",
    password: "sample1234",
    phone: "010-1111-1001",
    relation: "자녀",
    hall: {
      title: "영숙 추모관",
      deceasedName: "김영숙",
      lifespan: "1948 — 2023",
      summary: "따뜻한 밥상과 손길로 가족을 챙기셨던 어머니를 기억합니다.",
      portraitUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
      theme: "traditional" as const,
    },
    tribute: {
      author: "아들 민수",
      content: "엄마의 웃음이 지금도 집 안을 환하게 비춥니다. 고맙고 사랑합니다.",
    },
    video: {
      title: "가족의 하루",
      url: "https://www.youtube.com/embed/pJ7_I9nwh8w",
      description: "함께했던 일상을 떠올리며",
    },
    albums: [
      {
        title: "생일상",
        imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop",
        caption: "가족이 모였던 날",
      },
      {
        title: "봄나들이",
        imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop",
        caption: "좋아하는 꽃길",
      },
    ],
  },
  {
    loginId: "member02",
    name: "이서연",
    password: "sample1234",
    phone: "010-2222-2002",
    relation: "배우자",
    hall: {
      title: "철수 추모관",
      deceasedName: "이철수",
      lifespan: "1955 — 2024",
      summary: "성실함과 유머로 주변을 밝히셨던 남편을 기립니다.",
      portraitUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      theme: "modern" as const,
    },
    tribute: {
      author: "아내 서연",
      content: "함께한 시간이 제게는 가장 큰 선물입니다. 편히 쉬세요.",
    },
    video: {
      title: "추억 영상",
      url: "https://www.youtube.com/embed/pJ7_I9nwh8w",
      description: "함께 찍었던 기록",
    },
    albums: [
      {
        title: "결혼기념일",
        imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
        caption: "약속의 날",
      },
      {
        title: "여행",
        imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
        caption: "좋아하던 바다",
      },
    ],
  },
  {
    loginId: "member03",
    name: "박준호",
    password: "sample1234",
    phone: "010-3333-3003",
    relation: "손자",
    hall: {
      title: "순자 추모관",
      deceasedName: "박순자",
      lifespan: "1939 — 2022",
      summary: "손주를 늘 안아 주시던 할머니의 품을 기억합니다.",
      portraitUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop",
      theme: "park" as const,
    },
    tribute: {
      author: "손자 준호",
      content: "할머니 손맛이 그리워요. 하늘의 별이 되어 지켜봐 주세요.",
    },
    video: {
      title: "할머니와의 기억",
      url: "https://www.youtube.com/embed/pJ7_I9nwh8w",
      description: "짧게 남긴 영상 인사",
    },
    albums: [
      {
        title: "명절",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        caption: "함께한 명절상",
      },
      {
        title: "정원",
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop",
        caption: "가꾸시던 화분",
      },
    ],
  },
];

export async function ensureSampleMembers() {
  await connectMongo();

  const SAMPLE_VIDEO_URL = "https://www.youtube.com/embed/pJ7_I9nwh8w";

  for (const sample of SAMPLE_MEMBERS) {
    const existing = await Member.findOne({ loginId: sample.loginId });
    if (existing) {
      if (existing.hallId) {
        await Video.updateMany(
          { hallId: existing.hallId },
          { $set: { url: SAMPLE_VIDEO_URL } },
        );
      }
      // 기존 샘플에 역할 필드 보강
      if (!existing.memberKind) {
        existing.memberKind = "owner";
      }
      if (!existing.transferStatus) {
        existing.transferStatus = sample.loginId === "member02" ? "transferred" : "living";
      }
      await existing.save();
      continue;
    }

    const hall = await MemorialHall.create({
      ...sample.hall,
      isPublished: true,
    });

    await Video.create({
      hallId: hall._id,
      ...sample.video,
      sortOrder: 0,
    });

    await Tribute.create({
      hallId: hall._id,
      ...sample.tribute,
      isPublic: true,
    });

    await AlbumItem.create(
      sample.albums.map((album, index) => ({
        hallId: hall._id,
        ...album,
        sortOrder: index,
      })),
    );

    await Member.create({
      loginId: sample.loginId,
      name: sample.name,
      password: sample.password,
      phone: sample.phone,
      relation: sample.relation,
      hallId: hall._id,
      memberKind: "owner",
      transferStatus: sample.loginId === "member02" ? "transferred" : "living",
      isActive: true,
    });
  }

  // 유족 샘플 계정 (본인 member01 living / member02 transferred)
  const successorSpecs = [
    {
      loginId: "family01",
      name: "김유족",
      password: "sample1234",
      phone: "010-1111-9001",
      relation: "자녀",
      ownerLoginId: "member01",
    },
    {
      loginId: "family02",
      name: "이가족",
      password: "sample1234",
      phone: "010-2222-9002",
      relation: "배우자",
      ownerLoginId: "member02",
    },
  ];

  for (const spec of successorSpecs) {
    const exists = await Member.findOne({ loginId: spec.loginId });
    if (exists) continue;
    const owner = await Member.findOne({ loginId: spec.ownerLoginId });
    if (!owner) continue;
    await Member.create({
      loginId: spec.loginId,
      name: spec.name,
      password: spec.password,
      phone: spec.phone,
      relation: spec.relation,
      hallId: owner.hallId,
      memberKind: "successor",
      transferStatus: owner.transferStatus || "living",
      ownerMemberId: owner._id,
      isActive: true,
    });
  }

  const sampleOwner = await Member.findOne({ memberKind: "owner" });
  if (sampleOwner) {
    const { WelldyingEntry } = await import("@/models/WelldyingEntry");
    const { WELLDying_TOPICS } = await import("@/lib/roles");
    for (const topic of WELLDying_TOPICS) {
      const exists = await WelldyingEntry.findOne({ slug: topic.slug, isSample: true });
      if (exists) continue;
      await WelldyingEntry.create({
        ownerMemberId: sampleOwner._id,
        slug: topic.slug,
        title: topic.title,
        body: `${topic.summary}\n\n(샘플) 로그인 후 본인 계정으로 자신만의 기록을 남길 수 있습니다. 엔딩 노트에는 사진 3장·영상 1개를 함께 저장할 수 있습니다.`,
        photoUrls: [],
        isSample: true,
      });
    }
  }

  await Video.updateMany(
    {
      url: {
        $in: [
          "https://www.youtube.com/embed/dQw4w9WgXcQ",
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        ],
      },
    },
    { $set: { url: SAMPLE_VIDEO_URL } },
  );

  return Member.countDocuments();
}

export async function ensureDefaultHall() {
  await ensureSampleMembers();
  const hall = await MemorialHall.findOne({ isPublished: true }).sort({ createdAt: 1 });
  if (hall) return hall;

  // 폴백: 샘플 생성에 실패한 경우 최소 1개
  return MemorialHall.create({
    title: "별빛 추모관",
    deceasedName: "홍길동",
    lifespan: "1950 — 2024",
    summary: "일상 속에서 기억하고 나누는 디지털 추모 공간입니다.",
    portraitUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    theme: "modern",
    isPublished: true,
  });
}
