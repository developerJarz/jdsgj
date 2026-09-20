import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const product = await Product.findOne({
      $or: [{ slug: id }, { id: id }],
    }).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const product = await Product.findOne({
      $or: [{ _id: id.length === 24 ? id : undefined }, { slug: id }, { id: id }],
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    if (body.stock !== undefined) product.stock = Number(body.stock);
    if (body.sale_price !== undefined) product.sale_price = Number(body.sale_price);
    if (body.regular_price !== undefined) product.regular_price = Number(body.regular_price);
    if (body.name !== undefined) product.name = body.name;
    if (body.brand !== undefined) product.brand = body.brand;
    if (body.category !== undefined) product.category = body.category;
    if (body.is_active !== undefined) product.is_active = body.is_active;

    if (product.regular_price && product.sale_price) {
      product.price = product.sale_price;
      product.discount_percentage = product.regular_price > product.sale_price
        ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
        : 0;
      product.has_sale = product.discount_percentage > 0;
    }

    await product.save();
    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;

    await Product.findOneAndDelete({
      $or: [{ _id: id.length === 24 ? id : undefined }, { slug: id }, { id: id }],
    });

    return NextResponse.json({ success: true, message: 'Product deleted from catalog' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
