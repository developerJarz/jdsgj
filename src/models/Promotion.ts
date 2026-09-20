import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPromotion extends Document {
  name: string;
  type: 'flash_sale' | 'campaign' | 'discount_deal' | 'bundle';
  description?: string;
  startDate: Date;
  endDate: Date;
  products: mongoose.Types.ObjectId[];
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  banner_image?: string;
  badge_text?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['flash_sale', 'campaign', 'discount_deal', 'bundle'],
      required: true,
      default: 'flash_sale',
    },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    discount_type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discount_value: { type: Number, required: true, min: 0 },
    banner_image: { type: String },
    badge_text: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Promotion: Model<IPromotion> =
  mongoose.models.Promotion || mongoose.model<IPromotion>('Promotion', PromotionSchema);

export default Promotion;
