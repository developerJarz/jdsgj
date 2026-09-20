import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  applicableCategories?: string[];
  applicableProducts?: mongoose.Types.ObjectId[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true, default: 'percentage' },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableCategories: [{ type: String }],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    description: { type: String },
  },
  { timestamps: true }
);

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;
