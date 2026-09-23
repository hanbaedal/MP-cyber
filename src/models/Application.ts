import mongoose, { Schema, models, model, Types } from "mongoose";
import type { ApplyType } from "@/lib/pricing";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface IApplication {
  applyType: ApplyType;
  name: string;
  phone: string;
  preferredLoginId: string;
  preferredPassword: string;
  relation?: string;
  memo?: string;
  /** 유족 신청 시 연결할 본인 로그인 아이디 */
  ownerLoginId?: string;
  /** 유료 선택 (선착순 무료면 free_launch로 저장) */
  planYears: number;
  isLaunchFree: boolean;
  status: ApplicationStatus;
  adminNote?: string;
  createdMemberId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    applyType: {
      type: String,
      enum: ["welldying", "memorial_family", "memorial_only"],
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    preferredLoginId: { type: String, required: true, index: true },
    preferredPassword: { type: String, required: true },
    relation: String,
    memo: String,
    ownerLoginId: String,
    planYears: { type: Number, required: true },
    isLaunchFree: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNote: String,
    createdMemberId: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  { timestamps: true },
);

export const Application =
  models.Application || model<IApplication>("Application", ApplicationSchema);
