import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Image storage used until Cloudinary is configured (see lib/storage.ts).
 * Files are served by app/api/media/[id]/route.ts.
 */
export interface IMediaAsset extends Document {
  filename: string;
  contentType: string;
  size: number;
  data: Buffer;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    filename: { type: String, required: true, maxlength: 200 },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const MediaAsset: Model<IMediaAsset> =
  mongoose.models.MediaAsset || mongoose.model<IMediaAsset>('MediaAsset', MediaAssetSchema);

export default MediaAsset;
