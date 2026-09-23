import mongoose, { Schema, models, model, Types } from "mongoose";

export interface IFamilyBoardPost {
  hallId?: Types.ObjectId;
  title: string;
  body: string;
  authorName: string;
  authorMemberId?: Types.ObjectId;
  isSample: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FamilyBoardPostSchema = new Schema<IFamilyBoardPost>(
  {
    hallId: { type: Schema.Types.ObjectId, ref: "MemorialHall", index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    authorName: { type: String, required: true },
    authorMemberId: { type: Schema.Types.ObjectId, ref: "Member" },
    isSample: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const FamilyBoardPost =
  models.FamilyBoardPost ||
  model<IFamilyBoardPost>("FamilyBoardPost", FamilyBoardPostSchema);
