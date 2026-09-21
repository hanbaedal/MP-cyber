import mongoose, { Schema, models, model } from "mongoose";

export type HallTheme = "modern" | "traditional" | "park" | "cafe";

export interface IMemorialHall {
  title: string;
  deceasedName: string;
  lifespan?: string;
  summary?: string;
  portraitUrl?: string;
  theme: HallTheme;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MemorialHallSchema = new Schema<IMemorialHall>(
  {
    title: { type: String, required: true },
    deceasedName: { type: String, required: true },
    lifespan: String,
    summary: String,
    portraitUrl: String,
    theme: {
      type: String,
      enum: ["modern", "traditional", "park", "cafe"],
      default: "modern",
    },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const MemorialHall =
  models.MemorialHall || model<IMemorialHall>("MemorialHall", MemorialHallSchema);
