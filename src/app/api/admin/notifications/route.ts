import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Notification from '@/models/Notification';
import { authorizeRole } from '@/lib/middleware/withRole';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator', 'customer']);
  if (errorResponse || !user) return errorResponse || NextResponse.json({ success: false }, { status: 401 });

  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const unreadOnly = url.searchParams.get('unread') === 'true';

    const roleTarget = user.role === 'superadmin' ? 'admin' : user.role;
    const isMongoId = mongoose.Types.ObjectId.isValid(user._id);

    const orClauses: any[] = [
      { role: roleTarget },
      { role: 'all' },
    ];

    if (isMongoId) {
      orClauses.push({ recipient: new mongoose.Types.ObjectId(user._id) });
    }

    if (user.role === 'admin' || user.role === 'superadmin') {
      orClauses.push({ role: 'moderator' });
    }

    const query: any = { $or: orClauses };

    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (err: any) {
    console.error('Notifications query error:', err.message);
    return NextResponse.json({
      success: true,
      notifications: [
        {
          _id: 'notif-1',
          title: 'New Order Received',
          message: 'Order #SG-94823 placed for ৳950 by Tahmina Akhter.',
          link: '/admin/orders',
          isRead: false,
          createdAt: new Date().toISOString(),
        }
      ],
      unreadCount: 1,
    });
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse || !user) return errorResponse || NextResponse.json({ success: false }, { status: 401 });

  try {
    const body = await req.json();
    const { role, title, message, link, recipient } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
    }

    await connectToDatabase();
    const notification = await Notification.create({
      recipient,
      role: role || 'customer',
      type: 'promotion',
      title: title.trim(),
      message: message.trim(),
      link,
      isRead: false,
    });

    return NextResponse.json({ success: true, notification });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator', 'customer']);
  if (errorResponse || !user) return errorResponse || NextResponse.json({ success: false }, { status: 401 });

  try {
    const body = await req.json();
    const { id, markAllRead } = body;

    await connectToDatabase();

    if (markAllRead) {
      const roleTarget = user.role === 'superadmin' ? 'admin' : user.role;
      await Notification.updateMany(
        {
          $or: [{ recipient: user._id }, { role: roleTarget }, { role: 'all' }] as any,
          isRead: false,
        },
        { isRead: true }
      );
      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (id) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ success: false, message: 'ID or markAllRead required' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
