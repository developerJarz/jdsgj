import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import { invalidateStorefront } from '@/lib/cacheTags';
import { applyPricing, buildProductFields, PricingFields } from '@/lib/productInput';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const byAnyId = (id: string) => ({
  $or: [...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []), { slug: id }, { id }],
});

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const product = await Product.findOne(byAnyId(id)).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const product = await Product.findOne(byAnyId(id));
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const fields = await buildProductFields(body);
    const pricing: PricingFields = {
      sale_price: product.sale_price,
      regular_price: product.regular_price,
    };
    applyPricing(pricing, body);

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const [key, value] of Object.entries({ ...fields, ...pricing })) {
      const current = product.get(key);
      if (JSON.stringify(current) !== JSON.stringify(value)) {
        changes[key] = { from: current, to: value };
        product.set(key, value);
      }
    }

    if (Object.keys(changes).length === 0) {
      return NextResponse.json({ success: true, product });
    }

    await product.save();

    await logAuditEvent({
      user,
      action: 'product.update',
      target: 'Product',
      targetId: product._id.toString(),
      details: `Updated ${product.name}: ${Object.keys(changes).join(', ')}`,
      changes,
      req,
    });
    invalidateStorefront('products');

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const { user, errorResponse } = await authorizeRole(req, ['admin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const { id } = await params;

    const deleted = await Product.findOneAndDelete(byAnyId(id));
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    await logAuditEvent({
      user,
      action: 'product.delete',
      target: 'Product',
      targetId: deleted._id.toString(),
      details: `Deleted product: ${deleted.name}`,
      req,
    });
    invalidateStorefront('products');

    return NextResponse.json({ success: true, message: 'Product deleted from catalog' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
