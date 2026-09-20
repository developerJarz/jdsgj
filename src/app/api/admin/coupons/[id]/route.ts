import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Coupon from '@/models/Coupon';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteContext) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        ...(body.code && { code: body.code.trim().toUpperCase() }),
        ...(body.type && { type: body.type }),
        ...(body.value !== undefined && { value: Number(body.value) }),
        ...(body.minOrderAmount !== undefined && { minOrderAmount: Number(body.minOrderAmount) }),
        ...(body.maxDiscount !== undefined && { maxDiscount: Number(body.maxDiscount) }),
        ...(body.usageLimit !== undefined && { usageLimit: Number(body.usageLimit) }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.description !== undefined && { description: body.description }),
      },
      { new: true }
    );

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    await logAuditEvent({
      user,
      action: 'coupon.update',
      target: 'Coupon',
      targetId: id,
      details: `Updated coupon: ${coupon.code}`,
      req,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    await connectToDatabase();
    const coupon = await Coupon.findByIdAndDelete(id);

    if (coupon) {
      await logAuditEvent({
        user,
        action: 'coupon.delete',
        target: 'Coupon',
        targetId: id,
        details: `Deleted coupon: ${coupon.code}`,
        req,
      });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
