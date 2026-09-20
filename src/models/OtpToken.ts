import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtpToken extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const OtpTokenSchema = new Schema<IOtpToken>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete expired OTP tokens after 15 minutes
OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpTokenSchema.index({ email: 1 });

export const OtpToken: Model<IOtpToken> =
  mongoose.models.OtpToken || mongoose.model<IOtpToken>('OtpToken', OtpTokenSchema);

export default OtpToken;
