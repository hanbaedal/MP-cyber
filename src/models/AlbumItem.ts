import mongoose, { Schema, models, model, Types } from "mongoose";

export interface IAlbumItem {
  hallId: Types.ObjectId;
  title: string;
  imageUrl: string;
  caption?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const AlbumItemSchema = new Schema<IAlbumItem>(
  {
    hallId: { type: Schema.Types.ObjectId, ref: "MemorialHall", required: true },
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    caption: String,
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const AlbumItem =
  models.AlbumItem || model<IAlbumItem>("AlbumItem", AlbumItemSchema);
