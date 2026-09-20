import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Banner } from '@/models/Banner';
import { ensureDatabaseSeeded } from '@/lib/seed';
import mongoose from 'mongoose';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    await ensureDatabaseSeeded();
    const { id } = await params;
    const data = await req.json();

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id: id }, { widget_name: id }] }
      : { $or: [{ id: id }, { widget_name: id }] };

    let banner = await Banner.findOneAndUpdate(
      query,
      { $set: data },
      { new: true }
    );

    if (!banner) {
      banner = await Banner.create({
        id,
        widget_name: data.widget_name || id,
        ...data,
      });
    }

    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    console.error('Banner update error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id: id }, { widget_name: id }] }
      : { $or: [{ id: id }, { widget_name: id }] };

    const result = await Banner.findOneAndDelete(query);
    if (!result) {
      return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
