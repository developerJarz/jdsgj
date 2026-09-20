import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { authorizeRole } from '@/lib/middleware/withRole';
import { hashPassword } from '@/lib/auth';
import { logAuditEvent } from '@/lib/auditLogger';

export async function GET(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const staff = await User.find({
      role: { $in: ['moderator', 'admin', 'superadmin'] },
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, staff });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, phone, email, password, role, permissions } = body;

    if (!name || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, phone, and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await User.findOne({ phone: phone.trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'User with this phone number already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newStaff = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || '',
      password: hashedPassword,
      role: role || 'moderator',
      permissions: permissions || [],
      isActive: true,
    });

    await logAuditEvent({
      user,
      action: 'staff.create',
      target: 'User',
      targetId: newStaff._id.toString(),
      details: `Created new ${role || 'moderator'}: ${name.trim()}`,
      req,
    });

    const staffObj = newStaff.toObject();
    delete staffObj.password;

    return NextResponse.json({ success: true, staff: staffObj });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
