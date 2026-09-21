import mongoose, { Schema, models, model, Types } from "mongoose";

export interface IVideo {
  hallId: Types.ObjectId;
  title: string;
  url: string;
  description?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    hallId: { type: Schema.Types.ObjectId, ref: "MemorialHall", required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: String,
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Video = models.Video || model<IVideo>("Video", VideoSchema);
