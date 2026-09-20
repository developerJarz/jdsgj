import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import ReturnRequest from '@/models/ReturnRequest';
import Notification from '@/models/Notification';
import { authenticateRequest } from '@/lib/middleware/withAuth';
import mongoose from 'mongoose';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  req: Request,
  { params }: RouteContext
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    const { id } = await params;
    const body = await req.json();
    const { reason, description, images, items } = body;

    if (!reason) {
      return NextResponse.json({ success: false, message: 'Return reason is required' }, { status: 400 });
    }

    await connectToDatabase();
    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const order = await Order.findOne({
      $and: [
        { $or: [{ orderNumber: id }, ...(isMongoId ? [{ _id: id }] : [])] },
        { $or: [{ user: user._id }, { 'customer.phone': user.phone }] },
      ],
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Check if return request already exists
    const existing = await ReturnRequest.findOne({ order: order._id });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A return request is already under review for this order' },
        { status: 400 }
      );
    }

    const returnItems = items && items.length > 0 ? items : order.items;

    const returnReq = await ReturnRequest.create({
      order: order._id,
      orderNumber: order.orderNumber,
      user: user._id,
      userName: user.name,
      userPhone: user.phone,
      items: returnItems,
      reason,
      description,
      images: images || [],
      status: 'pending',
      refundAmount: order.grandTotal,
    });

    // Update order refundStatus
    order.refundStatus = 'requested';
    order.returnReason = reason;
    await order.save();

    // Notify admins and moderators
    await Notification.create({
      role: 'admin',
      type: 'return_request',
      title: `Return Request: Order #${order.orderNumber}`,
      message: `${user.name} submitted a return request for Order #${order.orderNumber}. Reason: ${reason}`,
      link: `/admin/returns`,
    });

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully. Our team will review it shortly.',
      returnRequest: returnReq,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
