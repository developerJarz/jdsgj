import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReturnRequest extends Document {
  order: mongoose.Types.ObjectId;
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  userName?: string;
  userPhone?: string;
  items: Array<{
    product: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
  }>;
  reason: string;
  description?: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  refundAmount?: number;
  adminNotes?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnRequestSchema = new Schema<IReturnRequest>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    orderNumber: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    userPhone: { type: String },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    reason: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    refundAmount: { type: Number, default: 0 },
    adminNotes: { type: String },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

const ReturnRequest: Model<IReturnRequest> =
  mongoose.models.ReturnRequest || mongoose.model<IReturnRequest>('ReturnRequest', ReturnRequestSchema);

export default ReturnRequest;
