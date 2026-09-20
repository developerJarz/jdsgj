import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { authenticateRequest } from '@/lib/middleware/withAuth';

export async function GET(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    const filter: any = {
      $or: [{ user: user._id }, { 'customer.phone': user.phone }],
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
