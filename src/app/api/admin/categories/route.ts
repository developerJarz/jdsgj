import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import { invalidateStorefront } from '@/lib/cacheTags';
import categoriesData from '@/data/categories.json';

export async function GET() {
  try {
    await connectToDatabase();
    const [categories, counts] = await Promise.all([
      Category.find().sort({ order: 1, name: 1 }).lean(),
      // One aggregate instead of a countDocuments per category
      Product.aggregate<{ _id: string; count: number }>([
        { $match: { is_active: { $ne: false } } },
        { $group: { _id: { $toLower: '$category_slug' }, count: { $sum: 1 } } },
      ]),
    ]);
    if (categories.length === 0) {
      return NextResponse.json(categoriesData);
    }
    const countBySlug = new Map(counts.map((c) => [c._id, c.count]));
    return NextResponse.json(
      categories.map((cat) => ({ ...cat, product_count: countBySlug.get(cat.slug.toLowerCase()) ?? 0 }))
    );
  } catch (err: any) {
    console.warn('Categories fetch error (fallback):', err.message);
    return NextResponse.json(categoriesData);
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json({ success: false, message: 'Category name is required' }, { status: 400 });
    }

    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = data.id || slug;

    const existing = await Category.findOne({ $or: [{ slug }, { id }] });
    if (existing) {
      return NextResponse.json({ success: false, message: 'A category with this slug already exists' }, { status: 400 });
    }

    const category = await Category.create({
      id,
      name: data.name.trim(),
      slug,
      image: data.image || '',
      icon: data.icon || '📦',
      description: data.description || '',
      parent: data.parent || null,
      isActive: data.isActive !== false,
      order: data.order ?? 0,
    });

    await logAuditEvent({
      user,
      action: 'category.create',
      target: 'Category',
      targetId: category._id.toString(),
      details: `Created category: ${category.name}`,
      req,
    });
    invalidateStorefront('categories');

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    console.error('Create category error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
