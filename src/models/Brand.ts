import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  order: number;
  product_count: number;
  is_top: boolean;
  seo_title?: string;
  seo_description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    logo: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    product_count: { type: Number, default: 0 },
    is_top: { type: Boolean, default: false },
    seo_title: { type: String },
    seo_description: { type: String },
  },
  { timestamps: true }
);

BrandSchema.index({ slug: 1 });
BrandSchema.index({ isActive: 1, order: 1 });

export const Brand: Model<IBrand> =
  mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
