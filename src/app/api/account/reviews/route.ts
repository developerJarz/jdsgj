import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Notification from '@/models/Notification';
import { authenticateRequest } from '@/lib/middleware/withAuth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    await connectToDatabase();
    const reviews = await Review.find({ user: user._id })
      .populate('product', 'name thumbnail slug')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, reviews });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    const body = await req.json();
    const { productId, rating, title, comment, images } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: 'Product, rating, and review comment are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const isMongoId = mongoose.Types.ObjectId.isValid(productId);
    const product = await Product.findOne({
      $or: [
        ...(isMongoId ? [{ _id: productId }] : []),
        { id: productId },
        { slug: productId },
      ],
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const review = await Review.create({
      user: user._id,
      product: product._id,
      rating: Number(rating),
      title: title?.trim(),
      comment: comment.trim(),
      images: images || [],
      isApproved: false, // Default requires moderator approval
      isVerifiedPurchase: true,
    });

    // Notify review moderators
    await Notification.create({
      role: 'moderator',
      type: 'new_review',
      title: `New Review on ${product.name.slice(0, 30)}...`,
      message: `${user.name} rated ${rating}★: "${comment.slice(0, 50)}..."`,
      link: `/admin/reviews`,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been submitted for verification.',
      review,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
