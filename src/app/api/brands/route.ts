import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Brand } from '@/models/Brand';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const brands = await Brand.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean();
    return NextResponse.json(brands);
  } catch (err: any) {
    console.warn('Public brands fetch error, fallback to JSON:', err.message);
    const brandsData = require('@/data/brands.json');
    return NextResponse.json(brandsData);
  }
}
