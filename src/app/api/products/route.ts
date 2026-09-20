import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { ensureDatabaseSeeded } from '@/lib/seed';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    await ensureDatabaseSeeded();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const q = searchParams.get('q');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const lowStock = searchParams.get('low_stock');
    const limit = Number(searchParams.get('limit')) || 0;

    const query: any = { is_active: { $ne: false } };

    if (lowStock === 'true') {
      query.stock = { $lte: 10 };
    }

    if (category) {
      query.$or = [
        { category_slug: new RegExp(`^${category}$`, 'i') },
        { category: new RegExp(category, 'i') },
      ];
    }

    if (brand) {
      query.brand_slug = new RegExp(`^${brand}$`, 'i');
    }

    if (q) {
      query.$or = [
        { name: new RegExp(q, 'i') },
        { brand: new RegExp(q, 'i') },
        { category: new RegExp(q, 'i') },
      ];
    }

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

    const products = await mongoQuery.lean();
    return NextResponse.json(products);
  } catch (err: any) {
    console.warn('Fetch products DB error (using fallback):', err.message);
    const fallbackData = require('@/data/products.json');
    return NextResponse.json(fallbackData);
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.name || !data.sale_price) {
      return NextResponse.json({ success: false, message: 'Name and Price are required' }, { status: 400 });
    }

    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = data.id || `SG-${Date.now()}`;

    const regPrice = Number(data.regular_price) || Number(data.sale_price);
    const salePrice = Number(data.sale_price);
    const discount = regPrice > salePrice ? Math.round(((regPrice - salePrice) / regPrice) * 100) : 0;

    const product = await Product.create({
      ...data,
      id,
      slug,
      price: salePrice,
      regular_price: regPrice,
      sale_price: salePrice,
      discount_percentage: discount,
      has_sale: discount > 0,
      stock: Number(data.stock) || 20,
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80',
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.thumbnail || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80'],
      brand: data.brand || 'Authentic',
      brand_slug: (data.brand || 'authentic').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: data.category || 'Skin Care',
      category_slug: (data.category || 'skin-care').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: 5.0,
      reviews_count: 1,
      reward_points: Math.floor(salePrice / 10),
      is_new: true,
    });

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error('Create product error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
