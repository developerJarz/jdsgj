import mongoose, { Schema, Model } from 'mongoose';

// One document per settings area (e.g. _id 'storefront'). `content` is
// validated by normalizeSiteContent before every save.
interface ISiteSettings {
  _id: string;
  content: Record<string, unknown>;
  updatedBy?: string;
  updatedAt: Date;
}

const schema = new Schema<ISiteSettings>({
  _id: { type: String, required: true },
  content: { type: Schema.Types.Mixed, default: {} },
  updatedBy: { type: String },
}, { timestamps: true, minimize: false });

const SiteSettings: Model<ISiteSettings> =
  (mongoose.models.SiteSettings as Model<ISiteSettings>) || mongoose.model<ISiteSettings>('SiteSettings', schema);
export default SiteSettings;
