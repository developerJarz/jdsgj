import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Coupon from '@/models/Coupon';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      endDate: { $gte: now },
      $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
    })
      .sort({ value: -1 })
      .select('code type value minOrderAmount maxDiscount description endDate')
      .lean();

    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
