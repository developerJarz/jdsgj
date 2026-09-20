import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Banner } from '@/models/Banner';
import bannersData from '@/data/banners.json';

export async function GET() {
  try {
    await connectToDatabase();
    const banners = await Banner.find().sort({ order: 1 }).lean();
    if (banners.length === 0) {
      return NextResponse.json(bannersData);
    }
    return NextResponse.json(banners);
  } catch (err: any) {
    console.warn('Banners fetch error (fallback):', err.message);
    return NextResponse.json(bannersData);
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.widget_name) {
      return NextResponse.json({ success: false, message: 'Widget name is required' }, { status: 400 });
    }

    const id = data.id || `banner-${Date.now()}`;
    const banner = await Banner.create({
      ...data,
      id,
      order: data.order ?? 0,
      isActive: data.isActive !== false,
    });

    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    console.error('Create banner error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const { bannerId, ...updates } = data;

    if (!bannerId) {
      return NextResponse.json({ success: false, message: 'bannerId is required' }, { status: 400 });
    }

    const banner = await Banner.findOneAndUpdate(
      { $or: [{ _id: bannerId }, { id: bannerId }] },
      { $set: updates },
      { new: true }
    );

    if (!banner) {
      return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
