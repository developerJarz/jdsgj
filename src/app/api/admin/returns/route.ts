import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import ReturnRequest from '@/models/ReturnRequest';
import Order from '@/models/Order';
import Notification from '@/models/Notification';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';

export async function GET(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    const filter: any = {};
    if (status && status !== 'all') filter.status = status;

    const returns = await ReturnRequest.find(filter)
      .populate('order')
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, returns });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, status, refundAmount, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Return ID and status are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const returnReq = await ReturnRequest.findById(id);
    if (!returnReq) {
      return NextResponse.json({ success: false, message: 'Return request not found' }, { status: 404 });
    }

    returnReq.status = status;
    if (refundAmount !== undefined) returnReq.refundAmount = Number(refundAmount);
    if (adminNotes !== undefined) returnReq.adminNotes = adminNotes;
    returnReq.processedBy = user?._id as any;
    returnReq.processedAt = new Date();

    await returnReq.save();

    // If approved or completed, update related Order refund status
    if (returnReq.order) {
      let orderRefundStatus: 'none' | 'requested' | 'approved' | 'processed' = 'requested';
      if (status === 'approved') orderRefundStatus = 'approved';
      if (status === 'completed') orderRefundStatus = 'processed';

      await Order.findByIdAndUpdate(returnReq.order, {
        refundStatus: orderRefundStatus,
        refundAmount: returnReq.refundAmount || 0,
        status: status === 'completed' ? 'refunded' : undefined,
      });

      // Notify customer
      await Notification.create({
        recipient: returnReq.user,
        type: 'return_request',
        title: `Return Request ${status.toUpperCase()}`,
        message: `Your return request for Order #${returnReq.orderNumber} has been updated to ${status}. ${
          returnReq.refundAmount ? `Refund Amount: ৳${returnReq.refundAmount}` : ''
        }`,
        link: `/account/orders`,
      });
    }

    await logAuditEvent({
      user,
      action: 'return.process',
      target: 'ReturnRequest',
      targetId: id,
      details: `Updated return status to ${status} for Order #${returnReq.orderNumber}`,
      req,
    });

    return NextResponse.json({ success: true, returnRequest: returnReq });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
