import mongoose, { Schema, models, model, Types } from "mongoose";
import type { MemberKind, TransferStatus } from "@/lib/roles";

export interface IMember {
  loginId: string;
  name: string;
  password: string;
  phone?: string;
  relation?: string;
  hallId?: Types.ObjectId;
  memberKind: MemberKind;
  transferStatus: TransferStatus;
  ownerMemberId?: Types.ObjectId;
  /** 추모만 가입 (본인 웰다잉 없음) */
  memorialOnly?: boolean;
  isActive: boolean;
  isLaunchFree?: boolean;
  planYears?: number;
  planExpiresAt?: Date;
  deathDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    loginId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    phone: String,
    relation: String,
    hallId: { type: Schema.Types.ObjectId, ref: "MemorialHall" },
    memberKind: {
      type: String,
      enum: ["owner", "successor"],
      default: "owner",
      index: true,
    },
    transferStatus: {
      type: String,
      enum: ["living", "transferred"],
      default: "living",
      index: true,
    },
    ownerMemberId: { type: Schema.Types.ObjectId, ref: "Member", index: true },
    memorialOnly: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isLaunchFree: { type: Boolean, default: false },
    planYears: Number,
    planExpiresAt: Date,
    deathDate: Date,
  },
  { timestamps: true },
);

export const Member = models.Member || model<IMember>("Member", MemberSchema);
