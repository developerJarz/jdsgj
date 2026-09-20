import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 404 });
    }

    const permissions = user.permissions || (user.role === 'admin' || user.role === 'superadmin' ? ['*'] : []);

    return NextResponse.json({
      success: true,
      user: {
        ...user.toObject(),
        permissions,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
