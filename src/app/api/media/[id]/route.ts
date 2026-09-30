import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import MediaAsset from '@/models/MediaAsset';

// Serves images uploaded before Cloudinary was configured (see lib/storage.ts).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    await connectToDatabase();
    const asset = await MediaAsset.findById(id).select('data contentType size').lean();
    if (!asset) return new Response('Not found', { status: 404 });

    const bytes = asset.data instanceof Buffer ? asset.data : Buffer.from((asset.data as any).buffer ?? asset.data);

    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': asset.contentType,
        'Content-Length': String(bytes.length),
        // Asset ids are immutable, so browsers and the CDN can cache forever
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('Media fetch error:', err);
    return new Response('Error loading image', { status: 500 });
  }
}
