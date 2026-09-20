import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MegaMenu } from '@/models/MegaMenu';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const data = await req.json();

    const menuItem = await MegaMenu.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!menuItem) {
      return NextResponse.json({ success: false, message: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, menuItem });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const result = await MegaMenu.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ success: false, message: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Menu item deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
