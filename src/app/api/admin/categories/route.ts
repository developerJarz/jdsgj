import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import categoriesData from '@/data/categories.json';

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    if (categories.length === 0) {
      return NextResponse.json(categoriesData);
    }
    // Attach real product counts
    const withCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          $or: [
            { category_slug: new RegExp(`^${cat.slug}$`, 'i') },
            { category: new RegExp(`^${cat.name}$`, 'i') },
          ],
          is_active: { $ne: false },
        });
        return { ...cat, product_count: count };
      })
    );
    return NextResponse.json(withCounts);
  } catch (err: any) {
    console.warn('Categories fetch error (fallback):', err.message);
    return NextResponse.json(categoriesData);
  }
}

export async function POST(req: Request) {
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

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    console.error('Create category error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
