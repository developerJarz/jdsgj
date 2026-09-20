import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  role?: 'customer' | 'moderator' | 'admin' | 'all';
  type: 'order_new' | 'order_status' | 'low_stock' | 'new_review' | 'return_request' | 'promotion' | 'system';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['customer', 'moderator', 'admin', 'all'], default: 'customer' },
    type: {
      type: String,
      enum: ['order_new', 'order_status', 'low_stock', 'new_review', 'return_request', 'promotion', 'system'],
      required: true,
      default: 'system',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
