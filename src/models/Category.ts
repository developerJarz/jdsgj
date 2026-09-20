import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  description?: string;
  parent?: mongoose.Types.ObjectId | string | null;
  product_count: number;
  isActive: boolean;
  order: number;
  level: number;
  seo_title?: string;
  seo_description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    image: { type: String },
    icon: { type: String, default: '📦' },
    description: { type: String },
    parent: { type: Schema.Types.Mixed, default: null },
    product_count: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    seo_title: { type: String },
    seo_description: { type: String },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ order: 1 });

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
