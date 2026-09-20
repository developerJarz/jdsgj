import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';
import { ensureDatabaseSeeded } from '@/lib/seed';

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

  const { identifier, password } = body;

  if (!identifier || !password) {
    return NextResponse.json(
      { success: false, message: 'Please enter your phone number or email, and password.' },
      { status: 400 }
    );
  }

  const clean = identifier.trim();

  try {
    await connectToDatabase();
    await ensureDatabaseSeeded();

    // Allow login by phone or email
    const user = await User.findOne({
      $or: [{ phone: clean }, { email: clean.toLowerCase() }],
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone/email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone/email or password.' },
        { status: 401 }
      );
    }

    // Update lastLogin
    try {
      user.lastLogin = new Date();
      await user.save();
    } catch (e) {
      console.warn('Could not update lastLogin:', e);
    }

    const permissions = user.permissions || (user.role === 'admin' || user.role === 'superadmin' ? ['*'] : []);

    const token = signToken({
      userId: user._id.toString(),
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        permissions,
        rewardPoints: user.rewardPoints,
        avatar: user.avatar,
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
    console.error('Login error:', errorMessage);
    return NextResponse.json(
      { success: false, message: 'Could not connect to database. Please try again later.' },
      { status: 500 }
    );
  }
}
