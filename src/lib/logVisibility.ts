import connectDB from '@/lib/db';
import User from '@/models/User';

/** Exclude both role snapshots and older entries linked to a super admin. */
export async function getVisibleLogFilter() {
  await connectDB();
  const superadmins = await User.find({ role: 'superadmin' }).select('_id').lean();
  return {
    userRole: { $ne: 'superadmin' as const },
    user: { $nin: superadmins.map((user) => user._id) },
  };
}
