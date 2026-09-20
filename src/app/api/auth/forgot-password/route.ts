import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();
    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Please provide your registered phone or email' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const clean = identifier.trim();
    const user = await User.findOne({
      $or: [{ phone: clean }, { email: clean.toLowerCase() }],
    });

    if (!user) {
      // Return success with generic message for privacy
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a recovery code or reset link has been dispatched.',
      });
    }

    // Generate reset token (in production, email or SMS with OTP)
    const resetToken = crypto.randomBytes(20).toString('hex');

    return NextResponse.json({
      success: true,
      message: 'Reset instructions have been generated.',
      resetToken, // Provided for easy development & testing flow
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
