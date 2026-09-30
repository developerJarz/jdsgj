import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MegaMenu } from '@/models/MegaMenu';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import { invalidateStorefront } from '@/lib/cacheTags';
import { DEFAULT_MENU } from '@/lib/defaultMenu';

export async function GET(req: Request) {
  const { errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    let menuItems = await MegaMenu.find().sort({ position: 1 }).lean();

    // First visit to the builder: store the storefront's starter menu in the
    // database so every entry can be edited, reordered or switched off here.
    if (menuItems.length === 0) {
      await MegaMenu.insertMany(
        DEFAULT_MENU.map((item, index) => ({ ...item, position: index + 1, isActive: true }))
      );
      menuItems = await MegaMenu.find().sort({ position: 1 }).lean();
      invalidateStorefront('menu');
    }

    return NextResponse.json(menuItems);
  } catch (err: any) {
    console.warn('MegaMenu fetch error:', err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.title) {
      return NextResponse.json({ success: false, message: 'Menu title is required' }, { status: 400 });
    }

    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const maxPos = await MegaMenu.findOne().sort({ position: -1 }).select('position').lean();
    const position = data.position ?? ((maxPos?.position || 0) + 1);

    const menuItem = await MegaMenu.create({
      title: data.title.trim(),
      slug,
      type: data.type || 'link',
      position,
      isActive: data.isActive !== false,
      href: data.href || '/',
      items: data.items || [],
    });

    await logAuditEvent({ user, action: 'menu.create', target: 'MegaMenu', targetId: menuItem._id.toString(), details: `Added menu item: ${menuItem.title}`, req });
    invalidateStorefront('menu');

    return NextResponse.json({ success: true, menuItem });
  } catch (err: any) {
    console.error('Create menu item error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const data = await req.json();

    if (Array.isArray(data)) {
      // Bulk reorder: [{ _id, position }, ...]
      const bulkOps = data.map((item: any) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { position: item.position } },
        },
      }));
      await MegaMenu.bulkWrite(bulkOps);
      await logAuditEvent({ user, action: 'menu.reorder', target: 'MegaMenu', details: 'Reordered header menu', req });
      invalidateStorefront('menu');
      return NextResponse.json({ success: true, message: 'Menu reordered' });
    }

    const { menuId, ...updates } = data;
    if (!menuId) {
      return NextResponse.json({ success: false, message: 'menuId is required' }, { status: 400 });
    }

    const menuItem = await MegaMenu.findByIdAndUpdate(menuId, { $set: updates }, { new: true });
    if (!menuItem) {
      return NextResponse.json({ success: false, message: 'Menu item not found' }, { status: 404 });
    }

    await logAuditEvent({ user, action: 'menu.update', target: 'MegaMenu', targetId: String(menuId), details: `Updated menu item: ${menuItem.title}`, req });
    invalidateStorefront('menu');

    return NextResponse.json({ success: true, menuItem });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
