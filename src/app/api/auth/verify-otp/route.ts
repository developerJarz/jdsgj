import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { OtpToken } from '@/models/OtpToken';

export async function POST(req: Request) {
  let body: Record<string, string> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const { email, otp } = body;

  if (!email || !otp) {
    return NextResponse.json(
      { success: false, message: 'Email and verification code are required.' },
      { status: 400 }
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = otp.trim();

  try {
    await connectToDatabase();

    // Find matching, unexpired, unverified OTP
    const token = await OtpToken.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      verified: false,
      expiresAt: { $gte: new Date() },
    });

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification code. Please request a new one.' },
        { status: 400 }
      );
    }

    // Mark as verified
    token.verified = true;
    await token.save();

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now complete your registration.',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Verify OTP error:', errorMessage);
    return NextResponse.json(
      { success: false, message: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
