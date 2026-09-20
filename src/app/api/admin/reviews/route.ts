import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';

export async function GET(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // approved, pending, all
    const rating = url.searchParams.get('rating');

    const filter: any = {};
    if (status === 'approved') filter.isApproved = true;
    if (status === 'pending') filter.isApproved = false;
    if (rating) filter.rating = Number(rating);

    const reviews = await Review.find(filter)
      .populate('product', 'name thumbnail slug')
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, reviews });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, isApproved, adminReply } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Review ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 });
    }

    if (isApproved !== undefined) review.isApproved = isApproved;
    if (adminReply !== undefined) review.adminReply = adminReply;

    await review.save();

    // Recalculate product rating if approved changed
    if (isApproved !== undefined && review.product) {
      const stats = await Review.aggregate([
        { $match: { product: review.product, isApproved: true } },
        { $group: { _id: null, avgRating: { $sum: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (stats.length > 0) {
        const count = stats[0].count;
        const avg = count > 0 ? (stats[0].avgRating / count).toFixed(1) : 5;
        await Product.findByIdAndUpdate(review.product, {
          rating: Number(avg),
          reviews_count: count,
        });
      }
    }

    await logAuditEvent({
      user,
      action: 'review.moderate',
      target: 'Review',
      targetId: id,
      details: `${isApproved ? 'Approved' : 'Rejected/Modified'} review`,
      req,
    });

    return NextResponse.json({ success: true, review });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Review ID required' }, { status: 400 });
    }

    await connectToDatabase();
    await Review.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
