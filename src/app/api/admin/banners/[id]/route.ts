import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Banner } from '@/models/Banner';
import mongoose from 'mongoose';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import { invalidateStorefront } from '@/lib/cacheTags';

const byAnyId = (id: string) =>
  mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { id: id }, { widget_name: id }] }
    : { $or: [{ id: id }, { widget_name: id }] };

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const { id } = await params;
    const { _id, createdAt, updatedAt, ...data } = await req.json();

    let banner = await Banner.findOneAndUpdate(byAnyId(id), { $set: data }, { new: true });

    if (!banner) {
      banner = await Banner.create({
        id,
        widget_name: data.widget_name || id,
        ...data,
      });
    }

    await logAuditEvent({ user, action: 'banner.update', target: 'Banner', targetId: id, details: `Updated banner section: ${banner.widget_name}`, req });
    invalidateStorefront('banners');

    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    console.error('Banner update error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const { id } = await params;

    const result = await Banner.findOneAndDelete(byAnyId(id));
    if (!result) {
      return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 });
    }

    await logAuditEvent({ user, action: 'banner.delete', target: 'Banner', targetId: id, details: `Deleted banner section: ${result.widget_name}`, req });
    invalidateStorefront('banners');

    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
