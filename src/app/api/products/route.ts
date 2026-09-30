import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { ensureDatabaseSeeded } from '@/lib/seed';
import { authorizeRole } from '@/lib/middleware/withRole';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { logAuditEvent } from '@/lib/auditLogger';
import { invalidateStorefront } from '@/lib/cacheTags';
import { applyPricing, buildProductFields, escapeRegex, slugify } from '@/lib/productInput';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80';

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const q = searchParams.get('q')?.trim().slice(0, 80);
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const lowStock = searchParams.get('low_stock');
    const limit = Math.min(Number(searchParams.get('limit')) || 0, 500);

    // Staff can list hidden (inactive) products in the admin catalog
    let includeInactive = false;
    if (searchParams.get('include_inactive') === 'true') {
      const token = getTokenFromRequest(req);
      const session = token ? verifyToken(token) : null;
      includeInactive = Boolean(session && ['admin', 'superadmin', 'moderator'].includes(session.role));
    }

    const query: any = includeInactive ? {} : { is_active: { $ne: false } };
    const and: any[] = [];

    if (lowStock === 'true') {
      query.stock = { $lte: 10 };
    }

    if (category) {
      const c = escapeRegex(category);
      and.push({ $or: [{ category_slug: new RegExp(`^${c}$`, 'i') }, { category: new RegExp(c, 'i') }] });
    }

    if (brand) {
      query.brand_slug = new RegExp(`^${escapeRegex(brand)}$`, 'i');
    }

    if (q) {
      const pattern = new RegExp(escapeRegex(q), 'i');
      and.push({ $or: [{ name: pattern }, { brand: pattern }, { category: pattern }, { tags: pattern }] });
    }

    if (and.length > 0) query.$and = and;

    if (minPrice || maxPrice) {
      query.sale_price = {};
      if (minPrice) query.sale_price.$gte = Number(minPrice);
      if (maxPrice) query.sale_price.$lte = Number(maxPrice);
    }

    let mongoQuery = Product.find(query);

    switch (sort) {
      case 'price-low':
        mongoQuery = mongoQuery.sort({ sale_price: 1 });
        break;
      case 'price-high':
        mongoQuery = mongoQuery.sort({ sale_price: -1 });
        break;
      case 'rating':
        mongoQuery = mongoQuery.sort({ rating: -1 });
        break;
      case 'newest':
        mongoQuery = mongoQuery.sort({ createdAt: -1 });
        break;
      default:
        mongoQuery = mongoQuery.sort({ rating: -1, stock: -1 });
    }

    if (limit > 0) {
      mongoQuery = mongoQuery.limit(limit);
    }

    let products = await mongoQuery.lean();
    if (products.length === 0 && Object.keys(query).length <= 1 && !q) {
      // Empty catalog on a fresh database: seed once, then retry.
      await ensureDatabaseSeeded();
      products = await mongoQuery.clone().lean();
    }
    return NextResponse.json(products);
  } catch (err: any) {
    console.warn('Fetch products DB error (using fallback):', err.message);
    const fallbackData = require('@/data/products.json');
    return NextResponse.json(fallbackData);
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.name?.trim() || !data.sale_price) {
      return NextResponse.json({ success: false, message: 'Name and sale price are required' }, { status: 400 });
    }
    if (!data.brand_id && !data.brand) {
      return NextResponse.json({ success: false, message: 'Please choose a brand' }, { status: 400 });
    }
    if (!data.category_id && !data.category) {
      return NextResponse.json({ success: false, message: 'Please choose a category' }, { status: 400 });
    }

    const fields = await buildProductFields(data);
    applyPricing(fields, data);

    // Unique slug even when two products share a name
    const baseSlug = slugify(data.slug || data.name) || `product-${Date.now()}`;
    const slugTaken = await Product.exists({ slug: baseSlug });
    const slug = slugTaken ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const thumbnail = fields.thumbnail || PLACEHOLDER_IMAGE;
    const product = await Product.create({
      rating: 0,
      reviews_count: 0,
      is_new: true,
      ...fields,
      id: `SG-${Date.now()}`,
      slug,
      thumbnail,
      images: fields.images?.length ? fields.images : [thumbnail],
      stock: fields.stock ?? 0,
    });

    await logAuditEvent({
      user,
      action: 'product.create',
      target: 'Product',
      targetId: product._id.toString(),
      details: `Created product: ${product.name} (${product.brand}, ৳${product.sale_price})`,
      req,
    });
    invalidateStorefront('products');

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error('Create product error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
