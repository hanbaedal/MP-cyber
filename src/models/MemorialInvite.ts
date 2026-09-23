import mongoose, { Schema, models, model, Types } from "mongoose";

export interface IMemorialInvite {
  token: string;
  hallId: Types.ObjectId;
  createdByMemberId?: Types.ObjectId;
  label?: string;
  expiresAt: Date;
  maxUses: number; // 0 = unlimited
  useCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MemorialInviteSchema = new Schema<IMemorialInvite>(
  {
    token: { type: String, required: true, unique: true, index: true },
    hallId: { type: Schema.Types.ObjectId, ref: "MemorialHall", required: true, index: true },
    createdByMemberId: { type: Schema.Types.ObjectId, ref: "Member" },
    label: String,
    expiresAt: { type: Date, required: true, index: true },
    maxUses: { type: Number, default: 0 },
    useCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const MemorialInvite =
  models.MemorialInvite ||
  model<IMemorialInvite>("MemorialInvite", MemorialInviteSchema);
