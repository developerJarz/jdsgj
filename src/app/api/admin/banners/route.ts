import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Banner } from '@/models/Banner';
import { ensureDatabaseSeeded } from '@/lib/seed';
import mongoose from 'mongoose';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import { invalidateStorefront } from '@/lib/cacheTags';

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseSeeded();
    const banners = await Banner.find().sort({ order: 1 }).lean();
    return NextResponse.json(banners);
  } catch (err: any) {
    console.warn('Banners fetch error (fallback):', err.message);
    const bannersData = require('@/data/banners.json');
    return NextResponse.json(bannersData);
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.widget_name) {
      return NextResponse.json({ success: false, message: 'Widget name is required' }, { status: 400 });
    }

    const id = data.id || `banner-${Date.now()}`;
    const banner = await Banner.findOneAndUpdate(
      { id },
      {
        ...data,
        id,
        order: data.order ?? 0,
        isActive: data.isActive !== false,
      },
      { new: true, upsert: true }
    );

    await logAuditEvent({ user, action: 'banner.create', target: 'Banner', targetId: id, details: `Saved banner section: ${data.widget_name}`, req });
    invalidateStorefront('banners');

    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    console.error('Create banner error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const data = await req.json();
    const { bannerId, ...updates } = data;

    if (!bannerId) {
      return NextResponse.json({ success: false, message: 'bannerId is required' }, { status: 400 });
    }

    const query = mongoose.Types.ObjectId.isValid(bannerId)
      ? { $or: [{ _id: bannerId }, { id: bannerId }, { widget_name: bannerId }] }
      : { $or: [{ id: bannerId }, { widget_name: bannerId }] };

    let banner = await Banner.findOneAndUpdate(
      query,
      { $set: updates },
      { new: true }
    );

    if (!banner) {
      banner = await Banner.create({
        id: bannerId,
        widget_name: updates.widget_name || bannerId,
        ...updates
      });
    }

    await logAuditEvent({ user, action: 'banner.update', target: 'Banner', targetId: String(bannerId), details: `Updated banner section: ${banner.widget_name}`, req });
    invalidateStorefront('banners');

    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    console.error('Update banner error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
