import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import RewardHistory from '@/models/RewardHistory';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/middleware/withAuth';

export async function GET(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    await connectToDatabase();
    const dbUser = await User.findById(user._id).select('rewardPoints name').lean();
    const history = await RewardHistory.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      points: dbUser?.rewardPoints || 0,
      history,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
