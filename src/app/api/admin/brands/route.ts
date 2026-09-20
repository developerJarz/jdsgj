import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Brand from '@/models/Brand';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    let brands = await Brand.find().sort({ order: 1, name: 1 }).lean();

    // Auto-seed from static brands.json if database has none
    if (brands.length === 0) {
      try {
        const filePath = path.join(process.cwd(), 'src/data/brands.json');
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const staticBrands = JSON.parse(raw);
          const brandDocs = staticBrands.map((b: any, index: number) => ({
            name: b.name || b.title,
            slug: b.slug || (b.name || b.title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            logo: b.logo || b.image,
            description: b.description || '',
            isActive: true,
            order: index + 1,
            product_count: b.product_count || 0,
          }));
          await Brand.insertMany(brandDocs);
          brands = await Brand.find().sort({ order: 1, name: 1 }).lean();
        }
      } catch (err) {
        console.warn('Could not auto-seed brands:', err);
      }
    }

    return NextResponse.json({ success: true, brands });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, logo, description, order, seo_title, seo_description } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Brand name is required' }, { status: 400 });
    }

    await connectToDatabase();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const brand = await Brand.create({
      name: name.trim(),
      slug,
      logo,
      description,
      order: Number(order) || 0,
      seo_title,
      seo_description,
      isActive: true,
    });

    await logAuditEvent({
      user,
      action: 'brand.create',
      target: 'Brand',
      targetId: brand._id.toString(),
      details: `Created brand: ${brand.name}`,
      req,
    });

    return NextResponse.json({ success: true, brand });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
