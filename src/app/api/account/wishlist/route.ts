import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';
import { authenticateRequest } from '@/lib/middleware/withAuth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    await connectToDatabase();
    let wishlist = await Wishlist.findOne({ user: user._id })
      .populate('products')
      .lean();

    if (!wishlist) {
      wishlist = { user: user._id as any, products: [], createdAt: new Date(), updatedAt: new Date() } as any;
    }

    return NextResponse.json({ success: true, products: wishlist?.products || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if productId is a slug, number id, or mongo id
    let targetProduct = await Product.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(productId) ? [{ _id: productId }] : []),
        { id: productId },
        { slug: productId },
      ],
    });

    if (!targetProduct) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    let wishlist = await Wishlist.findOne({ user: user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: user._id,
        products: [targetProduct._id],
      });
    } else {
      const exists = wishlist.products.some((p: any) => p.toString() === targetProduct._id.toString());
      if (!exists) {
        wishlist.products.push(targetProduct._id as any);
        await wishlist.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist',
      count: wishlist.products.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });
    }

    await connectToDatabase();

    let targetProduct = await Product.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(productId) ? [{ _id: productId }] : []),
        { id: productId },
        { slug: productId },
      ],
    });

    const targetId = targetProduct ? targetProduct._id : productId;

    await Wishlist.findOneAndUpdate(
      { user: user._id },
      { $pull: { products: targetId } }
    );

    return NextResponse.json({ success: true, message: 'Product removed from wishlist' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
