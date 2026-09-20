import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Coupon from '@/models/Coupon';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';

export async function GET(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      description,
      applicableCategories,
    } = body;

    if (!code || !value || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Code, discount value, and end date are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A coupon with this code already exists' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      type: type || 'percentage',
      value: Number(value),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      description: description?.trim() || '',
      applicableCategories: applicableCategories || [],
      isActive: true,
    });

    await logAuditEvent({
      user,
      action: 'coupon.create',
      target: 'Coupon',
      targetId: coupon._id.toString(),
      details: `Created coupon: ${coupon.code} (${coupon.type} ${coupon.value})`,
      req,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
