import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPageSection extends Document {
  page: 'home' | 'shop' | 'about' | 'contact';
  section_type: 'banner_carousel' | 'categories_grid' | 'product_slider' | 'flash_sale' | 'two_column_banner' | 'custom_html';
  title: string;
  subtitle?: string;
  config: Record<string, any>;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PageSectionSchema = new Schema<IPageSection>(
  {
    page: { type: String, enum: ['home', 'shop', 'about', 'contact'], default: 'home' },
    section_type: {
      type: String,
      enum: ['banner_carousel', 'categories_grid', 'product_slider', 'flash_sale', 'two_column_banner', 'custom_html'],
      required: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    config: { type: Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PageSectionSchema.index({ page: 1, order: 1 });

const PageSection: Model<IPageSection> =
  mongoose.models.PageSection || mongoose.model<IPageSection>('PageSection', PageSectionSchema);

export default PageSection;
