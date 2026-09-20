import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Banner } from '@/models/Banner';
import { ensureDatabaseSeeded } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseSeeded();
    const banners = await Banner.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean();
    return NextResponse.json(banners);
  } catch (err: any) {
    console.warn('Public banners fetch error, fallback to JSON:', err.message);
    const bannersData = require('@/data/banners.json');
    return NextResponse.json(bannersData);
  }
}
