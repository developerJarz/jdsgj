import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { OtpToken } from '@/models/OtpToken';
import { hashPassword, signToken } from '@/lib/auth';

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

  const { name, phone, email, password } = body;

  if (!name || !phone || !email || !password) {
    return NextResponse.json(
      { success: false, message: 'Name, phone number, email, and password are all required.' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { success: false, message: 'Password must be at least 6 characters long.' },
      { status: 400 }
    );
  }

  const cleanPhone = phone.trim();
  const cleanEmail = email.trim().toLowerCase();

  try {
    await connectToDatabase();

    // Verify that the email has a verified OTP token
    const verifiedOtp = await OtpToken.findOne({
      email: cleanEmail,
      verified: true,
    });

    if (!verifiedOtp) {
      return NextResponse.json(
        { success: false, message: 'Email not verified. Please verify your email with OTP first.' },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: 'An account with this mobile number already exists. Please log in.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists. Please log in.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      password: hashedPassword,
      role: 'customer',
      emailVerified: true,
      rewardPoints: 50,
    });

    // Clean up used OTP tokens for this email
    await OtpToken.deleteMany({ email: cleanEmail });

    const token = signToken({
      userId: user._id.toString(),
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        rewardPoints: user.rewardPoints,
      },
      token,
    });

    response.cookies.set('shajgoj_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Signup error:', errorMessage);
    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again later.' },
      { status: 500 }
    );
  }
}
