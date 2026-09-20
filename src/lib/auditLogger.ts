import AuditLog from '@/models/AuditLog';
import connectDB from '@/lib/db';

export interface AuditLogParams {
  user?: {
    _id?: string;
    userId?: string;
    name?: string;
    role?: string;
  } | null;
  action: string;
  target: string;
  targetId?: string;
  details?: string;
  changes?: Record<string, any>;
  req?: Request;
}

export async function logAuditEvent({
  user,
  action,
  target,
  targetId,
  details,
  changes,
  req,
}: AuditLogParams): Promise<void> {
  try {
    await connectDB();

    const ipAddress = req
      ? req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      : undefined;
    const userAgent = req ? req.headers.get('user-agent') || undefined : undefined;

    await AuditLog.create({
      user: user?._id || user?.userId,
      userName: user?.name || 'System',
      userRole: user?.role || 'admin',
      action,
      target,
      targetId,
      details,
      changes,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
    // Non-blocking: audit logs should never throw and block transactions
  }
}
