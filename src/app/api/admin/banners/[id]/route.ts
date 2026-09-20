import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Banner } from '@/models/Banner';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const data = await req.json();

    const banner = await Banner.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { $set: data },
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const result = await Banner.findOneAndDelete({ $or: [{ _id: id }, { id: id }] });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
