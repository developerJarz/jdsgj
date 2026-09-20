import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MegaMenu } from '@/models/MegaMenu';

const defaultMenu = [
  { _id: 'mm-1', title: 'BRANDS', slug: 'brands', type: 'mega', position: 1, isActive: true, href: '/shop', items: [] },
  { _id: 'mm-2', title: 'SKIN CARE', slug: 'skin-care', type: 'dropdown', position: 2, isActive: true, href: '/shop?category=skin-care', items: [
    { label: 'Moisturizer', href: '/shop?category=skin-care&q=moisturizer' },
    { label: 'Cleanser', href: '/shop?category=skin-care&q=cleanser' },
    { label: 'Serum', href: '/shop?category=skin-care&q=serum' },
    { label: 'Sunscreen', href: '/shop?category=skin-care&q=sunscreen' },
    { label: 'Face Mask', href: '/shop?category=skin-care&q=mask' },
  ]},
  { _id: 'mm-3', title: 'MAKEUP', slug: 'makeup', type: 'dropdown', position: 3, isActive: true, href: '/shop?category=makeup', items: [
    { label: 'Lipstick', href: '/shop?category=makeup&q=lipstick' },
    { label: 'Foundation', href: '/shop?category=makeup&q=foundation' },
    { label: 'Eye Liner', href: '/shop?category=makeup&q=eyeliner' },
    { label: 'Mascara', href: '/shop?category=makeup&q=mascara' },
  ]},
  { _id: 'mm-4', title: 'HAIR CARE', slug: 'hair-care', type: 'link', position: 4, isActive: true, href: '/shop?category=hair', items: [] },
  { _id: 'mm-5', title: 'FRAGRANCE', slug: 'fragrance', type: 'link', position: 5, isActive: true, href: '/shop?category=fragrance', items: [] },
  { _id: 'mm-6', title: 'K-BEAUTY', slug: 'k-beauty', type: 'link', position: 6, isActive: true, href: '/shop?category=k-beauty', items: [] },
  { _id: 'mm-7', title: '🔥 OFFERS', slug: 'offers', type: 'link', position: 7, isActive: true, href: '/shop?offer=offers', items: [] },
];

export async function GET() {
  try {
    await connectToDatabase();
    const menuItems = await MegaMenu.find({ isActive: true }).sort({ position: 1 }).lean();
    if (menuItems.length === 0) {
      return NextResponse.json(defaultMenu);
    }
    return NextResponse.json(menuItems);
  } catch (err: any) {
    console.warn('MegaMenu fetch error (fallback):', err.message);
    return NextResponse.json(defaultMenu);
  }
}

export async function POST(req: Request) {
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

    return NextResponse.json({ success: true, menuItem });
  } catch (err: any) {
    console.error('Create menu item error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
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

    return NextResponse.json({ success: true, menuItem });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
