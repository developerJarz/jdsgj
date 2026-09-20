import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  id: number | string;
  name: string;
  slug: string;
  price: number;
  regular_price: number;
  sale_price: number;
  cost_price: number;
  has_sale: boolean;
  discount_percentage: number;
  stock: number;
  low_stock_threshold: number;
  sold_count: number;
  rating: number;
  reviews_count: number;
  brand: string;
  brand_slug: string;
  category: string;
  category_slug: string;
  categories: string[];
  thumbnail: string;
  images: string[];
  short_description?: string;
  description?: string;
  how_to_use?: string;
  ingredients?: string;
  sku?: string;
  tags: string[];
  specifications: Array<{ key: string; value: string }>;
  weight?: number;
  dimensions?: string;
  reward_points?: number;
  is_new?: boolean;
  is_active?: boolean;
  featured: boolean;
  bestseller: boolean;
  seo_title?: string;
  seo_description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: Schema.Types.Mixed, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true },
    regular_price: { type: Number, required: true },
    sale_price: { type: Number, required: true },
    cost_price: { type: Number, default: 0 },
    has_sale: { type: Boolean, default: false },
    discount_percentage: { type: Number, default: 0 },
    stock: { type: Number, default: 20 },
    low_stock_threshold: { type: Number, default: 5 },
    sold_count: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    reviews_count: { type: Number, default: 0 },
    brand: { type: String, required: true },
    brand_slug: { type: String, required: true },
    category: { type: String, required: true },
    category_slug: { type: String, required: true },
    categories: [{ type: String }],
    thumbnail: { type: String, required: true },
    images: [{ type: String }],
    short_description: { type: String },
    description: { type: String },
    how_to_use: { type: String },
    ingredients: { type: String },
    sku: { type: String },
    tags: [{ type: String }],
    specifications: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
    weight: { type: Number },
    dimensions: { type: String },
    reward_points: { type: Number, default: 10 },
    is_new: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    seo_title: { type: String },
    seo_description: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ category_slug: 1 });
ProductSchema.index({ brand_slug: 1 });
ProductSchema.index({ sale_price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ sold_count: -1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ name: 'text', brand: 'text', category: 'text' });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
