import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Promotion from '@/models/Promotion';
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
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      {
        ...(body.name && { name: body.name.trim() }),
        ...(body.type && { type: body.type }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
        ...(body.products && { products: body.products }),
        ...(body.discount_type && { discount_type: body.discount_type }),
        ...(body.discount_value !== undefined && { discount_value: Number(body.discount_value) }),
        ...(body.banner_image !== undefined && { banner_image: body.banner_image }),
        ...(body.badge_text !== undefined && { badge_text: body.badge_text }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      { new: true }
    );

    if (!promotion) {
      return NextResponse.json({ success: false, message: 'Promotion not found' }, { status: 404 });
    }

    await logAuditEvent({
      user,
      action: 'promotion.update',
      target: 'Promotion',
      targetId: id,
      details: `Updated promotion: ${promotion.name}`,
      req,
    });

    return NextResponse.json({ success: true, promotion });
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
    await Promotion.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Promotion deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
