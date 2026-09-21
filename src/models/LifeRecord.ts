import mongoose, { Schema, models, model } from "mongoose";

export type LifeStage =
  | "boyhood"
  | "youth"
  | "midlife"
  | "child"
  | "partner"
  | "other";

export interface ILifeRecord {
  stage: LifeStage;
  title: string;
  content?: string;
  mediaUrl?: string;
  mediaType: "text" | "image" | "video";
  coOwners: string[];
  expiresAt: Date;
  sizeBytes: number;
  createdAt: Date;
  updatedAt: Date;
}

const LifeRecordSchema = new Schema<ILifeRecord>(
  {
    stage: {
      type: String,
      enum: ["boyhood", "youth", "midlife", "child", "partner", "other"],
      required: true,
    },
    title: { type: String, required: true },
    content: String,
    mediaUrl: String,
    mediaType: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
    coOwners: { type: [String], default: [] },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000),
    },
    sizeBytes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const LifeRecord =
  models.LifeRecord || model<ILifeRecord>("LifeRecord", LifeRecordSchema);
