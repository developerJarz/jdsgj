import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import PageSection from '@/models/PageSection';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || 'home';

    let sections = await PageSection.find({ page: page as any }).sort({ order: 1 }).lean();

    if (sections.length === 0 && page === 'home') {
      const defaultSections = [
        {
          page: 'home',
          section_type: 'banner_carousel',
          title: 'Hero Banner Slider',
          subtitle: 'Main promotion slider on top of homepage',
          order: 1,
          isActive: true,
          config: { autoPlay: true, interval: 4000 },
        },
        {
          page: 'home',
          section_type: 'categories_grid',
          title: 'Top Categories',
          subtitle: 'Shop by category circular badges',
          order: 2,
          isActive: true,
          config: { columns: 6 },
        },
        {
          page: 'home',
          section_type: 'flash_sale',
          title: 'Flash Deals & Discounts',
          subtitle: 'Limited time offers with countdown timer',
          order: 3,
          isActive: true,
          config: { limit: 6, showTimer: true },
        },
        {
          page: 'home',
          section_type: 'product_slider',
          title: 'Best Selling Beauty Products',
          subtitle: 'Customer favourites this season',
          order: 4,
          isActive: true,
          config: { category: 'skincare', limit: 8 },
        },
        {
          page: 'home',
          section_type: 'two_column_banner',
          title: 'Promotional Promo Banners',
          subtitle: 'Twin promotional banners with direct links',
          order: 5,
          isActive: true,
          config: {},
        },
        {
          page: 'home',
          section_type: 'product_slider',
          title: 'New Arrivals',
          subtitle: 'Freshly stocked makeup and hair essentials',
          order: 6,
          isActive: true,
          config: { filter: 'is_new', limit: 8 },
        },
      ];
      await PageSection.insertMany(defaultSections);
      sections = await PageSection.find({ page }).sort({ order: 1 }).lean();
    }

    return NextResponse.json({ success: true, sections });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { page, section_type, title, subtitle, config, order } = body;

    if (!title || !section_type) {
      return NextResponse.json({ success: false, message: 'Title and section type required' }, { status: 400 });
    }

    await connectToDatabase();
    const section = await PageSection.create({
      page: page || 'home',
      section_type,
      title: title.trim(),
      subtitle: subtitle?.trim(),
      config: config || {},
      order: Number(order) || 0,
      isActive: true,
    });

    await logAuditEvent({
      user,
      action: 'page_section.create',
      target: 'PageSection',
      targetId: section._id.toString(),
      details: `Created section: ${section.title}`,
      req,
    });

    return NextResponse.json({ success: true, section });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, reorder, sections, title, subtitle, config, isActive } = body;

    await connectToDatabase();

    // Reorder multiple sections at once
    if (reorder && Array.isArray(sections)) {
      for (const item of sections) {
        if (item._id && item.order !== undefined) {
          await PageSection.findByIdAndUpdate(item._id, { order: item.order });
        }
      }
      return NextResponse.json({ success: true, message: 'Sections reordered' });
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Section ID required' }, { status: 400 });
    }

    const updated = await PageSection.findByIdAndUpdate(
      id,
      {
        ...(title && { title: title.trim() }),
        ...(subtitle !== undefined && { subtitle: subtitle.trim() }),
        ...(config && { config }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );

    return NextResponse.json({ success: true, section: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Section ID required' }, { status: 400 });
    }

    await connectToDatabase();
    await PageSection.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Section deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
