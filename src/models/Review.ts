import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  adminReply?: string;
  adminReplyAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
    images: [{ type: String }],
    isApproved: { type: Boolean, default: false },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    adminReply: { type: String },
    adminReplyAt: { type: Date },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ isApproved: 1 });
ReviewSchema.index({ rating: 1 });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
