import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  category?: string;
  sku?: string;
}

export interface IStatusHistoryEntry {
  status: string;
  changedBy?: mongoose.Types.ObjectId;
  changedByName?: string;
  changedAt: Date;
  note?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    city: string;
    area?: string;
    address: string;
    notes?: string;
  };
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'packed'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'refunded';
  statusHistory: IStatusHistoryEntry[];
  trackingNumber?: string;
  estimatedDelivery?: Date;
  couponCode?: string;
  returnReason?: string;
  refundAmount?: number;
  refundStatus?: 'none' | 'requested' | 'approved' | 'processed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      city: { type: String, required: true },
      area: { type: String },
      address: { type: String, required: true },
      notes: { type: String },
    },
    items: [
      {
        id: { type: Schema.Types.Mixed },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        thumbnail: { type: String },
        category: { type: String },
        sku: { type: String },
      },
    ],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cod', 'bkash', 'nagad', 'card'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
        'refunded',
      ],
      default: 'pending',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        changedByName: { type: String },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
    couponCode: { type: String },
    returnReason: { type: String },
    refundAmount: { type: Number, default: 0 },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'processed'],
      default: 'none',
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'customer.phone': 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
