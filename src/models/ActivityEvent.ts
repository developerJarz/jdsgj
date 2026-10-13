import mongoose, { Schema, Document, Model } from 'mongoose';
import type { UserTokenPayload } from '@/lib/auth';

export const ACTIVITY_TYPES = [
  'page_view',
  'product_view',
  'add_to_cart',
  'wishlist_add',
  'search',
  'checkout_start',
  'order_placed',
  'login',
  'signup',
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface IActivityEvent extends Document {
  type: ActivityType;
  path?: string;
  productId?: string;
  productName?: string;
  query?: string;
  value?: number;
  sessionId?: string;
  visitorId?: string;
  user?: mongoose.Types.ObjectId;
  userName?: string;
  userRole?: UserTokenPayload['role'];
  referrer?: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  createdAt: Date;
}

const ActivityEventSchema = new Schema<IActivityEvent>(
  {
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    path: { type: String, maxlength: 300 },
    productId: { type: String, maxlength: 100 },
    productName: { type: String, maxlength: 200 },
    query: { type: String, maxlength: 120 },
    value: { type: Number },
    sessionId: { type: String, maxlength: 64 },
    visitorId: { type: String, maxlength: 64 },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, maxlength: 120 },
    userRole: { type: String, enum: ['customer', 'moderator', 'admin', 'superadmin'] },
    referrer: { type: String, maxlength: 300 },
    device: { type: String, enum: ['mobile', 'tablet', 'desktop'] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Raw events are kept for 90 days so the collection can't grow unbounded.
ActivityEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
ActivityEventSchema.index({ type: 1, createdAt: -1 });
ActivityEventSchema.index({ sessionId: 1, createdAt: -1 });

// Next.js development reloads can reuse a model registered before this field
// existed. Add it to that model so role snapshots are persisted immediately.
const existingModel = mongoose.models.ActivityEvent as Model<IActivityEvent> | undefined;
if (existingModel && !existingModel.schema.path('userRole')) {
  existingModel.schema.add({ userRole: ActivityEventSchema.obj.userRole });
}

export const ActivityEvent: Model<IActivityEvent> =
  existingModel || mongoose.model<IActivityEvent>('ActivityEvent', ActivityEventSchema);

export default ActivityEvent;
