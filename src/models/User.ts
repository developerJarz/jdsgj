import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: 'customer' | 'moderator' | 'admin' | 'superadmin';
  permissions: string[];
  rewardPoints: number;
  avatar?: string;
  birthday?: Date;
  gender?: 'female' | 'male' | 'other' | 'prefer_not_to_say';
  skinType?: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal' | 'acne_prone';
  skinConcerns?: string[];
  hairType?: 'straight' | 'wavy' | 'curly' | 'coily';
  hairConcerns?: string[];
  preferredBrands?: string[];
  beautyGoal?: string;
  membershipTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: Date;
  addresses?: Array<{
    label?: string;
    city: string;
    area?: string;
    address: string;
    phone?: string;
    isDefault: boolean;
  }>;
  savedPaymentPrefs?: {
    method?: string;
    details?: string;
  };
  notificationPrefs: {
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp?: boolean;
    promotions?: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'moderator', 'admin', 'superadmin'],
      default: 'customer',
    },
    permissions: [{ type: String }],
    rewardPoints: { type: Number, default: 50 },
    avatar: { type: String },
    birthday: { type: Date },
    gender: { 
      type: String, 
      enum: ['female', 'male', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say'
    },
    skinType: {
      type: String,
      enum: ['oily', 'dry', 'combination', 'sensitive', 'normal', 'acne_prone'],
    },
    skinConcerns: [{ type: String }],
    hairType: {
      type: String,
      enum: ['straight', 'wavy', 'curly', 'coily'],
    },
    hairConcerns: [{ type: String }],
    preferredBrands: [{ type: String }],
    beautyGoal: { type: String },
    membershipTier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    addresses: [
      {
        label: { type: String },
        city: { type: String },
        area: { type: String },
        address: { type: String },
        phone: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    savedPaymentPrefs: {
      method: { type: String },
      details: { type: String },
    },
    notificationPrefs: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
