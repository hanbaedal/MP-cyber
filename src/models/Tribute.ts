import mongoose, { Schema, models, model, Types } from "mongoose";

export interface ITribute {
  hallId: Types.ObjectId;
  author: string;
  content: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TributeSchema = new Schema<ITribute>(
  {
    hallId: { type: Schema.Types.ObjectId, ref: "MemorialHall", required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Tribute = models.Tribute || model<ITribute>("Tribute", TributeSchema);
