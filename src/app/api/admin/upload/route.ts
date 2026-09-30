import { NextResponse } from 'next/server';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import { activeStorageProvider, uploadImage, validateImage } from '@/lib/storage';

const MAX_FILES_PER_REQUEST = 8;

export async function GET(req: Request) {
  const { errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;
  return NextResponse.json({ success: true, provider: activeStorageProvider() });
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ success: false, message: 'Expected multipart form data' }, { status: 400 });
  }

  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ success: false, message: 'No images received' }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json({ success: false, message: `Upload at most ${MAX_FILES_PER_REQUEST} images at a time` }, { status: 400 });
  }

  const invalid = files.map(validateImage).filter(Boolean);
  if (invalid.length > 0) {
    return NextResponse.json({ success: false, message: invalid.join('; ') }, { status: 400 });
  }

  try {
    const uploaded = await Promise.all(files.map((file) => uploadImage(file, user?.userId)));

    await logAuditEvent({
      user,
      action: 'media.upload',
      target: 'Media',
      details: `Uploaded ${uploaded.length} image(s) to ${uploaded[0].provider}`,
      req,
    });

    return NextResponse.json({ success: true, images: uploaded });
  } catch (err: any) {
    console.error('Image upload error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Upload failed' }, { status: 500 });
  }
}
