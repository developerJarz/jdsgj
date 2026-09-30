import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Notification from '@/models/Notification';
import { logAuditEvent } from '@/lib/auditLogger';
import { authorizeRole } from '@/lib/middleware/withRole';
import { invalidateStorefront } from '@/lib/cacheTags';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const order = await Order.findOne({
      $or: [{ orderNumber: id }, ...(isMongoId ? [{ _id: id }] : [])],
    })
      .populate('user', 'name phone email avatar')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const { user: staffUser, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const order = await Order.findOne({
      $or: [{ orderNumber: id }, ...(isMongoId ? [{ _id: id }] : [])],
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const previousStatus = order.status;
    const { status, paymentStatus, trackingNumber, estimatedDelivery, adminNotes, note } = body;

    if (status && status !== previousStatus) {
      order.status = status;

      // Append to status history
      if (!order.statusHistory) order.statusHistory = [];
      const validStaffId = staffUser?.userId && mongoose.Types.ObjectId.isValid(staffUser.userId) 
        ? new mongoose.Types.ObjectId(staffUser.userId) 
        : undefined;

      order.statusHistory.push({
        status,
        changedBy: validStaffId,
        changedByName: staffUser?.name || 'Staff Administrator',
        changedAt: new Date(),
        note: note || `Order transitioned from ${previousStatus} to ${status}`,
      });

      // If order cancelled, restore inventory
      if (status === 'cancelled' && previousStatus !== 'cancelled') {
        const restoreOps = order.items
          .filter((item) => item.id)
          .map((item) => {
            const qty = Math.max(1, Number(item.quantity || 1));
            return {
              updateOne: {
                filter: { $or: [{ id: item.id as any }, { slug: String(item.id) }] },
                update: { $inc: { stock: qty, sold_count: -qty } },
              },
            };
          });
        if (restoreOps.length > 0) {
          try {
            await Product.bulkWrite(restoreOps, { ordered: false });
            invalidateStorefront('products');
          } catch (stockErr) {
            console.warn('Could not restore stock on cancel:', stockErr);
          }
        }
      }

      // Customer notification
      if (order.user && mongoose.Types.ObjectId.isValid(order.user.toString())) {
        try {
          await Notification.create({
            recipient: order.user,
            role: 'customer',
            type: 'order_status',
            title: `Order Status: ${status.toUpperCase().replace(/_/g, ' ')}`,
            message: `Your Order #${order.orderNumber} is now ${status.replace(/_/g, ' ')}. ${
              trackingNumber ? `Tracking: ${trackingNumber}` : ''
            }`,
            link: `/account/orders/${order.orderNumber}`,
          });
        } catch (notifErr) {
          console.warn('Notification error on order status update:', notifErr);
        }
      }
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    await order.save();

    try {
      await logAuditEvent({
        user: staffUser,
        action: 'order.update',
        target: 'Order',
        targetId: order._id.toString(),
        details: `Updated order #${order.orderNumber} (status: ${order.status})`,
        req,
      });
    } catch (auditErr) {
      console.warn('Audit log error:', auditErr);
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error('Order update error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
