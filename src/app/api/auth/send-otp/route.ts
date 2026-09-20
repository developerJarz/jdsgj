import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { OtpToken } from '@/models/OtpToken';
import { sendOtpEmail } from '@/lib/mailer';

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

  const { email } = body;

  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { success: false, message: 'Please provide a valid email address.' },
      { status: 400 }
    );
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    await connectToDatabase();

    // Rate limit: check if an OTP was sent to this email within the last 60 seconds
    const recent = await OtpToken.findOne({
      email: cleanEmail,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    });

    if (recent) {
      return NextResponse.json(
        { success: false, message: 'An OTP was already sent. Please wait 60 seconds before requesting a new code.' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any previous OTP tokens for this email
    await OtpToken.deleteMany({ email: cleanEmail });

    // Save new OTP (expires in 10 minutes)
    await OtpToken.create({
      email: cleanEmail,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false,
    });

    // Send OTP via Brevo
    const sent = await sendOtpEmail(cleanEmail, otp);

    if (!sent) {
      return NextResponse.json(
        { success: false, message: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email. Please check your inbox.',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Send OTP error:', errorMessage);
    return NextResponse.json(
      { success: false, message: 'Could not send verification code. Please try again.' },
      { status: 500 }
    );
  }
}
