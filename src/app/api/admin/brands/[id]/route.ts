import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Brand from '@/models/Brand';
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
    const brand = await Brand.findByIdAndUpdate(
      id,
      {
        ...(body.name && { name: body.name.trim() }),
        ...(body.logo !== undefined && { logo: body.logo }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.order !== undefined && { order: Number(body.order) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.seo_title !== undefined && { seo_title: body.seo_title }),
        ...(body.seo_description !== undefined && { seo_description: body.seo_description }),
      },
      { new: true }
    );

    if (!brand) {
      return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 });
    }

    await logAuditEvent({
      user,
      action: 'brand.update',
      target: 'Brand',
      targetId: id,
      details: `Updated brand: ${brand.name}`,
      req,
    });

    return NextResponse.json({ success: true, brand });
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
    await Brand.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Brand deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
