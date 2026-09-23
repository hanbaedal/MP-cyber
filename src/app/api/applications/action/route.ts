import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Application } from "@/models/Application";
import { Member } from "@/models/Member";
import { isAdminAuthenticated } from "@/lib/auth";
import { addYears } from "@/lib/pricing";

export const runtime = "nodejs";

/** 승인 / 반려 / 이관 */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "관리자만 가능합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = String(body.action || "");
    await connectMongo();

    if (action === "transfer") {
      // 본인 이관: 사망일 설정 → 본인 비활성, 유족 활성
      const ownerLoginId = String(body.ownerLoginId || "").trim();
      const deathDate = body.deathDate ? new Date(body.deathDate) : new Date();
      const owner = await Member.findOne({ loginId: ownerLoginId, memberKind: "owner" });
      if (!owner) {
        return NextResponse.json({ ok: false, message: "본인 계정을 찾을 수 없습니다." }, { status: 404 });
      }
      owner.transferStatus = "transferred";
      owner.isActive = false;
      owner.deathDate = deathDate;
      await owner.save();

      await Member.updateMany(
        { ownerMemberId: owner._id, memberKind: "successor" },
        { $set: { isActive: true, transferStatus: "transferred" } },
      );

      return NextResponse.json({
        ok: true,
        message: `${owner.loginId} 이관 완료. 본인 비활성, 유족 계정 활성화.`,
      });
    }

    const id = String(body.id || "");
    const app = await Application.findById(id);
    if (!app) {
      return NextResponse.json({ ok: false, message: "신청을 찾을 수 없습니다." }, { status: 404 });
    }

    if (action === "reject") {
      app.status = "rejected";
      app.adminNote = String(body.adminNote || "");
      await app.save();
      return NextResponse.json({ ok: true, message: "반려 처리되었습니다." });
    }

    if (action !== "approve") {
      return NextResponse.json({ ok: false, message: "unknown action" }, { status: 400 });
    }

    if (app.status === "approved") {
      return NextResponse.json({ ok: false, message: "이미 승인된 신청입니다." }, { status: 400 });
    }

    const exists = await Member.findOne({ loginId: app.preferredLoginId });
    if (exists) {
      return NextResponse.json(
        { ok: false, message: "아이디가 이미 존재합니다. 다른 아이디로 재신청이 필요합니다." },
        { status: 409 },
      );
    }

    const now = new Date();
    const planExpiresAt = addYears(now, app.planYears);

    if (app.applyType === "welldying") {
      const member = await Member.create({
        loginId: app.preferredLoginId,
        name: app.name,
        password: app.preferredPassword,
        phone: app.phone,
        relation: app.relation,
        memberKind: "owner",
        transferStatus: "living",
        isActive: true,
        isLaunchFree: app.isLaunchFree,
        planYears: app.planYears,
        planExpiresAt,
      });
      app.status = "approved";
      app.createdMemberId = member._id;
      await app.save();
      return NextResponse.json({
        ok: true,
        message: `승인: 본인 ${member.loginId} 활성 (유족은 이관 전까지 비활성)`,
        loginId: member.loginId,
        password: app.preferredPassword,
      });
    }

    if (app.applyType === "memorial_family") {
      const owner = await Member.findOne({
        loginId: app.ownerLoginId,
        memberKind: "owner",
      });
      if (!owner) {
        return NextResponse.json(
          { ok: false, message: "연결 본인 계정이 없습니다." },
          { status: 400 },
        );
      }
      const ownerLiving = owner.transferStatus !== "transferred";
      const member = await Member.create({
        loginId: app.preferredLoginId,
        name: app.name,
        password: app.preferredPassword,
        phone: app.phone,
        relation: app.relation,
        hallId: owner.hallId,
        memberKind: "successor",
        transferStatus: owner.transferStatus,
        ownerMemberId: owner._id,
        // 본인 활성(생전)이면 유족 비활성
        isActive: !ownerLiving,
        isLaunchFree: app.isLaunchFree,
        planYears: app.planYears,
        planExpiresAt,
      });
      app.status = "approved";
      app.createdMemberId = member._id;
      await app.save();
      return NextResponse.json({
        ok: true,
        message: ownerLiving
          ? `승인: 유족 ${member.loginId} 생성(본인 생전이라 비활성). 이관 후 로그인 가능.`
          : `승인: 유족 ${member.loginId} 활성.`,
        loginId: member.loginId,
        password: app.preferredPassword,
        inactiveUntilTransfer: ownerLiving,
      });
    }

    // memorial_only
    const member = await Member.create({
      loginId: app.preferredLoginId,
      name: app.name,
      password: app.preferredPassword,
      phone: app.phone,
      relation: app.relation,
      memberKind: "successor",
      transferStatus: "transferred",
      memorialOnly: true,
      isActive: true,
      isLaunchFree: app.isLaunchFree,
      planYears: app.planYears,
      planExpiresAt,
    });
    app.status = "approved";
    app.createdMemberId = member._id;
    await app.save();
    return NextResponse.json({
      ok: true,
      message: `승인: 추모 전용 ${member.loginId} 활성.`,
      loginId: member.loginId,
      password: app.preferredPassword,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
