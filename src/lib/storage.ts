import 'server-only';
import { createHash } from 'crypto';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import MediaAsset from '@/models/MediaAsset';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
// Vercel serverless request bodies are capped at 4.5 MB
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type StorageProvider = 'cloudinary' | 'database';

export interface UploadedImage {
  url: string;
  provider: StorageProvider;
  publicId?: string;
  bytes: number;
}

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

export function activeStorageProvider(): StorageProvider {
  return cloudinaryConfig() ? 'cloudinary' : 'database';
}

/** Signed upload via Cloudinary's REST API (no SDK dependency needed). */
async function uploadToCloudinary(file: File, config: NonNullable<ReturnType<typeof cloudinaryConfig>>): Promise<UploadedImage> {
  const folder = process.env.CLOUDINARY_FOLDER || 'shajgoj/products';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  // Signature: sha1 of the alphabetically sorted params + API secret
  const signature = createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${config.apiSecret}`)
    .digest('hex');

  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  form.append('timestamp', timestamp);
  form.append('api_key', config.apiKey);
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Cloudinary upload failed');
  }

  // f_auto,q_auto lets Cloudinary serve WebP/AVIF at an optimal quality
  const url = String(json.secure_url).replace('/image/upload/', '/image/upload/f_auto,q_auto/');
  return { url, provider: 'cloudinary', publicId: json.public_id, bytes: json.bytes };
}

async function uploadToDatabase(file: File, uploadedBy?: string): Promise<UploadedImage> {
  await connectToDatabase();
  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await MediaAsset.create({
    filename: file.name.slice(0, 200) || 'upload',
    contentType: file.type,
    size: buffer.length,
    data: buffer,
    uploadedBy: uploadedBy && mongoose.Types.ObjectId.isValid(uploadedBy) ? uploadedBy : undefined,
  });
  return { url: `/api/media/${asset._id}`, provider: 'database', bytes: buffer.length };
}

export function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return `${file.name}: only JPG, PNG, WebP, AVIF or GIF images are allowed`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: image must be under 4 MB`;
  return null;
}

export async function uploadImage(file: File, uploadedBy?: string): Promise<UploadedImage> {
  const config = cloudinaryConfig();
  return config ? uploadToCloudinary(file, config) : uploadToDatabase(file, uploadedBy);
}
