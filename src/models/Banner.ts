import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBannerItem {
  id: number | string;
  title?: string;
  image: string;
  url: string;
  alt?: string;
}

export interface IBanner extends Document {
  id: string;
  widget_name: string;
  title?: string;
  columns: number;
  items: IBannerItem[];
  isActive: boolean;
  order: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    id: { type: String, required: true, unique: true },
    widget_name: { type: String, required: true },
    title: { type: String },
    columns: { type: Number, default: 1 },
    items: [
      {
        id: { type: Schema.Types.Mixed },
        title: { type: String },
        image: { type: String, required: true },
        url: { type: String, required: true },
        alt: { type: String },
      },
    ],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export const Banner: Model<IBanner> =
  mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);
