import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/Category';
import { ensureDatabaseSeeded } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseSeeded();
    const categories = await Category.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean();
    return NextResponse.json(categories);
  } catch (err: any) {
    console.warn('Public categories fetch error, fallback to JSON:', err.message);
    const categoriesData = require('@/data/categories.json');
    return NextResponse.json(categoriesData);
  }
}
