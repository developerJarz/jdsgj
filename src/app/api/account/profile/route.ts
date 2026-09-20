import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/middleware/withAuth';
import { hashPassword } from '@/lib/auth';

export async function GET(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    await connectToDatabase();
    const profile = await User.findById(user._id).select('-password').lean();
    if (!profile) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    const body = await req.json();
    const { 
      name, 
      email, 
      avatar, 
      birthday, 
      gender, 
      skinType, 
      skinConcerns, 
      hairType, 
      hairConcerns, 
      preferredBrands, 
      beautyGoal, 
      currentPassword, 
      newPassword, 
      notificationPrefs 
    } = body;

    await connectToDatabase();
    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (name) dbUser.name = name.trim();
    if (email !== undefined) dbUser.email = email.trim().toLowerCase();
    if (avatar !== undefined) dbUser.avatar = avatar;
    if (birthday !== undefined) dbUser.birthday = birthday ? new Date(birthday) : undefined;
    if (gender !== undefined) dbUser.gender = gender;
    if (skinType !== undefined) dbUser.skinType = skinType;
    if (skinConcerns !== undefined) dbUser.skinConcerns = skinConcerns;
    if (hairType !== undefined) dbUser.hairType = hairType;
    if (hairConcerns !== undefined) dbUser.hairConcerns = hairConcerns;
    if (preferredBrands !== undefined) dbUser.preferredBrands = preferredBrands;
    if (beautyGoal !== undefined) dbUser.beautyGoal = beautyGoal;
    if (notificationPrefs) dbUser.notificationPrefs = notificationPrefs;

    // Give 50 bonus reward points for first-time skin profile completion
    if (skinType && (!dbUser.skinConcerns || dbUser.skinConcerns.length === 0) && skinConcerns && skinConcerns.length > 0) {
      dbUser.rewardPoints = (dbUser.rewardPoints || 0) + 50;
    }

    // Determine membership tier based on reward points
    const pts = dbUser.rewardPoints || 0;
    if (pts >= 1000) dbUser.membershipTier = 'Platinum';
    else if (pts >= 500) dbUser.membershipTier = 'Gold';
    else if (pts >= 200) dbUser.membershipTier = 'Silver';
    else dbUser.membershipTier = 'Bronze';

    if (newPassword && newPassword.trim().length >= 6) {
      dbUser.password = await hashPassword(newPassword.trim());
    }

    await dbUser.save();

    const userObj = dbUser.toObject();
    delete userObj.password;

    return NextResponse.json({ success: true, profile: userObj });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
