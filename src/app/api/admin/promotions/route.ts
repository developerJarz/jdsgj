import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Promotion from '@/models/Promotion';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';

export async function GET(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const promotions = await Promotion.find()
      .populate('products', 'name price thumbnail regular_price stock')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, promotions });
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
      name,
      type,
      description,
      startDate,
      endDate,
      products,
      discount_type,
      discount_value,
      banner_image,
      badge_text,
    } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Campaign name, start date, and end date are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const promotion = await Promotion.create({
      name: name.trim(),
      type: type || 'flash_sale',
      description: description?.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      products: products || [],
      discount_type: discount_type || 'percentage',
      discount_value: Number(discount_value) || 0,
      banner_image,
      badge_text,
      isActive: true,
    });

    await logAuditEvent({
      user,
      action: 'promotion.create',
      target: 'Promotion',
      targetId: promotion._id.toString(),
      details: `Created promotion: ${promotion.name} (${promotion.type})`,
      req,
    });

    return NextResponse.json({ success: true, promotion });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
