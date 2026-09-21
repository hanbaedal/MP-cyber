import mongoose, { Schema, models, model, Types } from "mongoose";

export interface IMember {
  loginId: string;
  name: string;
  password: string;
  phone?: string;
  relation?: string;
  hallId?: Types.ObjectId;
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
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Member = models.Member || model<IMember>("Member", MemberSchema);
