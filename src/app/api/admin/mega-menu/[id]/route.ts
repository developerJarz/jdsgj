import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MegaMenu } from '@/models/MegaMenu';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import { invalidateStorefront } from '@/lib/cacheTags';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, errorResponse } = await authorizeRole(req, ['admin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const { id } = await params;
    const { _id, createdAt, updatedAt, ...data } = await req.json();

    const menuItem = await MegaMenu.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!menuItem) {
      return NextResponse.json({ success: false, message: 'Menu item not found' }, { status: 404 });
    }

    await logAuditEvent({ user, action: 'menu.update', target: 'MegaMenu', targetId: id, details: `Updated menu item: ${menuItem.title}`, req });
    invalidateStorefront('menu');

    return NextResponse.json({ success: true, menuItem });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, errorResponse } = await authorizeRole(req, ['admin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const { id } = await params;

    const result = await MegaMenu.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ success: false, message: 'Menu item not found' }, { status: 404 });
    }

    await logAuditEvent({ user, action: 'menu.delete', target: 'MegaMenu', targetId: id, details: `Deleted menu item: ${result.title}`, req });
    invalidateStorefront('menu');

    return NextResponse.json({ success: true, message: 'Menu item deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
