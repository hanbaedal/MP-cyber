import mongoose, { Schema, models, model, Types } from "mongoose";
import type { MemberKind, TransferStatus } from "@/lib/roles";

export interface IMember {
  loginId: string;
  name: string;
  password: string;
  phone?: string;
  relation?: string;
  hallId?: Types.ObjectId;
  /** 본인(생전) / 유족(지정) */
  memberKind: MemberKind;
  /** 본인 계정에만: 생전 living → 사후 transferred */
  transferStatus: TransferStatus;
  /** 유족 계정: 연결 본인 member _id */
  ownerMemberId?: Types.ObjectId;
  isActive: boolean;
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
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Member = models.Member || model<IMember>("Member", MemberSchema);
