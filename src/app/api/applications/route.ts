import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Application } from "@/models/Application";
import { Member } from "@/models/Member";
import {
  APPLY_TYPE_LABEL,
  LAUNCH_FREE_QUOTA,
  LAUNCH_FREE_YEARS,
  PAID_PLANS,
  type ApplyType,
  type PaidPlanYears,
} from "@/lib/pricing";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

async function countLaunchFreeMembers() {
  return Member.countDocuments({ isLaunchFree: true });
}

export async function GET() {
  await connectMongo();
  const used = await countLaunchFreeMembers();
  const remaining = Math.max(0, LAUNCH_FREE_QUOTA - used);

  if (await isAdminAuthenticated()) {
    const items = await Application.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      ok: true,
      items,
      pricing: {
        launchFreeQuota: LAUNCH_FREE_QUOTA,
        launchFreeYears: LAUNCH_FREE_YEARS,
        launchFreeRemaining: remaining,
        plans: PAID_PLANS,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    pricing: {
      launchFreeQuota: LAUNCH_FREE_QUOTA,
      launchFreeYears: LAUNCH_FREE_YEARS,
      launchFreeRemaining: remaining,
      plans: PAID_PLANS,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const applyType = String(body.applyType || "") as ApplyType;
    if (!["welldying", "memorial_family", "memorial_only"].includes(applyType)) {
      return NextResponse.json({ ok: false, message: "신청 유형을 선택해 주세요." }, { status: 400 });
    }

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const preferredLoginId = String(body.preferredLoginId || "").trim().toLowerCase();
    const preferredPassword = String(body.preferredPassword || "");
    const relation = String(body.relation || "").trim();
    const memo = String(body.memo || "").trim();
    const ownerLoginId = String(body.ownerLoginId || "").trim().toLowerCase();

    if (!name || !phone || !preferredLoginId || !preferredPassword) {
      return NextResponse.json(
        { ok: false, message: "이름·연락처·희망 아이디·비밀번호는 필수입니다." },
        { status: 400 },
      );
    }

    if (preferredLoginId === "admin" || preferredLoginId.length < 4) {
      return NextResponse.json(
        { ok: false, message: "아이디는 4자 이상이며 admin은 사용할 수 없습니다." },
        { status: 400 },
      );
    }

    if (preferredPassword.length < 6) {
      return NextResponse.json(
        { ok: false, message: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 },
      );
    }

    if (applyType === "memorial_family" && !ownerLoginId) {
      return NextResponse.json(
        { ok: false, message: "연결할 본인(웰다잉) 아이디를 입력해 주세요." },
        { status: 400 },
      );
    }

    await connectMongo();

    const idTaken =
      (await Member.findOne({ loginId: preferredLoginId })) ||
      (await Application.findOne({
        preferredLoginId,
        status: "pending",
      }));
    if (idTaken) {
      return NextResponse.json(
        { ok: false, message: "이미 사용 중이거나 신청 중인 아이디입니다." },
        { status: 409 },
      );
    }

    if (applyType === "memorial_family") {
      const owner = await Member.findOne({
        loginId: ownerLoginId,
        memberKind: "owner",
      });
      if (!owner) {
        return NextResponse.json(
          { ok: false, message: "해당 본인(웰다잉) 아이디를 찾을 수 없습니다." },
          { status: 400 },
        );
      }
    }

    const used = await countLaunchFreeMembers();
    const remaining = Math.max(0, LAUNCH_FREE_QUOTA - used);
    let isLaunchFree = remaining > 0;
    let planYears: number = LAUNCH_FREE_YEARS;

    if (!isLaunchFree) {
      const years = Number(body.planYears) as PaidPlanYears;
      if (![3, 5, 10].includes(years)) {
        return NextResponse.json(
          { ok: false, message: "유료 이용 기간(3/5/10년)을 선택해 주세요." },
          { status: 400 },
        );
      }
      planYears = years;
    }

    const app = await Application.create({
      applyType,
      name,
      phone,
      preferredLoginId,
      preferredPassword,
      relation,
      memo,
      ownerLoginId: applyType === "memorial_family" ? ownerLoginId : undefined,
      planYears,
      isLaunchFree,
      status: "pending",
    });

    return NextResponse.json({
      ok: true,
      id: String(app._id),
      applyTypeLabel: APPLY_TYPE_LABEL[applyType],
      isLaunchFree,
      planYears,
      message: isLaunchFree
        ? `접수되었습니다. 선착순 무료(${LAUNCH_FREE_YEARS}년) 대상입니다. 관리자 승인 후 이용 가능합니다.`
        : `접수되었습니다. ${planYears}년 이용권으로 신청되었습니다. 관리자 승인 후 이용 가능합니다.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
