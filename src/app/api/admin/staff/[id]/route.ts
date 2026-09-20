import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { authorizeRole } from '@/lib/middleware/withRole';
import { hashPassword } from '@/lib/auth';
import { logAuditEvent } from '@/lib/auditLogger';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteContext) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, role, permissions, isActive, password } = body;

    await connectToDatabase();
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 });
    }

    if (name) targetUser.name = name.trim();
    if (email !== undefined) targetUser.email = email.trim();
    if (role) targetUser.role = role;
    if (permissions !== undefined) targetUser.permissions = permissions;
    if (isActive !== undefined) targetUser.isActive = isActive;
    if (password && password.trim().length >= 6) {
      targetUser.password = await hashPassword(password.trim());
    }

    await targetUser.save();

    await logAuditEvent({
      user,
      action: 'staff.update',
      target: 'User',
      targetId: id,
      details: `Updated staff member: ${targetUser.name}`,
      req,
    });

    const staffObj = targetUser.toObject();
    delete staffObj.password;

    return NextResponse.json({ success: true, staff: staffObj });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    await connectToDatabase();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 });
    }

    // Do not allow deleting superadmin or self
    if (targetUser.role === 'superadmin' || targetUser._id.toString() === user?._id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete own account or superadmin' },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(id);

    await logAuditEvent({
      user,
      action: 'staff.delete',
      target: 'User',
      targetId: id,
      details: `Deleted staff: ${targetUser.name}`,
      req,
    });

    return NextResponse.json({ success: true, message: 'Staff member removed' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
