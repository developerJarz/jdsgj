import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { identifier, newPassword } = await req.json();

    if (!identifier || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Valid identifier and password (min 6 chars) required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const clean = identifier.trim();
    const user = await User.findOne({
      $or: [{ phone: clean }, { email: clean.toLowerCase() }],
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated. You can now log in with your new credentials.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
