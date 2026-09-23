import mongoose, { Schema, models, model, Types } from "mongoose";
import type { WelldyingSlug } from "@/lib/roles";

export interface IWelldyingEntry {
  ownerMemberId: Types.ObjectId;
  slug: WelldyingSlug;
  title: string;
  body: string;
  photoUrls: string[];
  videoUrl?: string;
  isSample: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WelldyingEntrySchema = new Schema<IWelldyingEntry>(
  {
    ownerMemberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true,
    },
    slug: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    photoUrls: { type: [String], default: [] },
    videoUrl: String,
    isSample: { type: Boolean, default: false },
  },
  { timestamps: true },
);

WelldyingEntrySchema.index({ ownerMemberId: 1, slug: 1 }, { unique: true });

export const WelldyingEntry =
  models.WelldyingEntry || model<IWelldyingEntry>("WelldyingEntry", WelldyingEntrySchema);
