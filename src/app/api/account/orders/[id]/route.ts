import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Notification from '@/models/Notification';
import { authenticateRequest } from '@/lib/middleware/withAuth';
import mongoose from 'mongoose';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: Request,
  { params }: RouteContext
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    const { id } = await params;
    await connectToDatabase();

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const order = await Order.findOne({
      $and: [
        { $or: [{ orderNumber: id }, ...(isMongoId ? [{ _id: id }] : [])] },
        { $or: [{ user: user._id }, { 'customer.phone': user.phone }] },
      ],
    }).lean();

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
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
    const { action, reason } = body;

    if (action !== 'cancel') {
      return NextResponse.json({ success: false, message: 'Unsupported action' }, { status: 400 });
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

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot cancel order in '${order.status}' state. Please contact customer support.`,
        },
        { status: 400 }
      );
    }

    order.status = 'cancelled';
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'cancelled',
      changedBy: new mongoose.Types.ObjectId(user._id),
      changedByName: user.name,
      changedAt: new Date(),
      note: `Cancelled by customer. Reason: ${reason || 'Not specified'}`,
    });

    await order.save();

    // Restore stock
    for (const item of order.items) {
      if (item.id) {
        await Product.findOneAndUpdate(
          { $or: [{ id: item.id as any }, { slug: String(item.id) }] },
          { $inc: { stock: Math.max(1, Number(item.quantity || 1)) } }
        );
      }
    }

    // Notify admins
    await Notification.create({
      role: 'admin',
      type: 'order_status',
      title: `Order Cancelled: #${order.orderNumber}`,
      message: `Customer ${user.name} cancelled order #${order.orderNumber}. Reason: ${reason || 'N/A'}`,
      link: `/admin/orders`,
    });

    return NextResponse.json({ success: true, message: 'Order successfully cancelled', order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
