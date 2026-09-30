import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Order } from '@/models/Order';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';

const ASSIGNABLE_ROLES = ['customer', 'moderator', 'admin', 'superadmin'];

export async function GET(req: Request) {
  const { errorResponse } = await authorizeRole(req, ['admin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const [users, orderCounts] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).lean(),
      // One aggregate instead of a countDocuments per user
      Order.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$customer.phone', count: { $sum: 1 } } },
      ]),
    ]);

    const countByPhone = new Map(orderCounts.map((c) => [c._id, c.count]));
    return NextResponse.json(users.map((u) => ({ ...u, orderCount: countByPhone.get(u.phone) ?? 0 })));
  } catch (err: any) {
    console.error('Users fetch error:', err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user: actor, errorResponse } = await authorizeRole(req, ['admin']);
  if (errorResponse) return errorResponse;
  if (!actor) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { userId, role, isActive } = await req.json();

    if (role && !ASSIGNABLE_ROLES.includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
    }
    // Only a superadmin can grant or revoke superadmin
    if (role === 'superadmin' && actor.role !== 'superadmin') {
      return NextResponse.json({ success: false, message: 'Only a superadmin can grant superadmin' }, { status: 403 });
    }
    if (userId === actor.userId && role && role !== actor.role) {
      return NextResponse.json({ success: false, message: 'You cannot change your own role' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    if (user.role === 'superadmin' && actor.role !== 'superadmin') {
      return NextResponse.json({ success: false, message: 'Only a superadmin can modify a superadmin' }, { status: 403 });
    }

    const previousRole = user.role;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    await logAuditEvent({
      user: actor,
      action: 'user.update',
      target: 'User',
      targetId: userId,
      details: `Updated ${user.name}${role && role !== previousRole ? `: role ${previousRole} → ${role}` : ''}${isActive !== undefined ? `, active=${isActive}` : ''}`,
      req,
    });

    const { password, ...safeUser } = user.toObject();
    return NextResponse.json({ success: true, user: safeUser });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
