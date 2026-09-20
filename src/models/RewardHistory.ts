import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRewardHistory extends Document {
  user: mongoose.Types.ObjectId;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  description: string;
  order?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RewardHistorySchema = new Schema<IRewardHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true },
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'adjusted'],
      required: true,
      default: 'earned',
    },
    description: { type: String, required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RewardHistorySchema.index({ user: 1, createdAt: -1 });

const RewardHistory: Model<IRewardHistory> =
  mongoose.models.RewardHistory || mongoose.model<IRewardHistory>('RewardHistory', RewardHistorySchema);

export default RewardHistory;
