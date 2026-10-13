import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import { authorizeRole } from '@/lib/middleware/withRole';
import { getVisibleLogFilter } from '@/lib/logVisibility';
import { canDeleteAuditLogs } from '@/lib/adminAccess';
import { auditRetentionCutoff } from '@/lib/auditRetention';
import { logAuditEvent } from '@/lib/auditLogger';

export async function GET(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '30'));
    const action = url.searchParams.get('action');
    const target = url.searchParams.get('target');
    const search = url.searchParams.get('search');

    // Match typed text literally: characters like "(" or "[" must not be parsed as a regex.
    const contains = (text: string) => new RegExp(text.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const filter: Record<string, unknown> = await getVisibleLogFilter();
    if (action) filter.action = contains(action);
    if (target) filter.target = contains(target);
    if (search) {
      filter.$or = [
        { userName: contains(search) },
        { details: contains(search) },
        { target: contains(search) },
      ];
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'name phone email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse || !user) return errorResponse || NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });

  // Re-read the super admin's approval on every request so revoking it takes effect immediately.
  if (!(await canDeleteAuditLogs(user.role))) {
    return NextResponse.json({ success: false, error: 'Your super admin has not allowed audit log deletion.' }, { status: 403 });
  }

  let months: unknown;
  let cutoff: Date;
  try {
    months = (await req.json())?.months;
    cutoff = auditRetentionCutoff(months);
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Invalid retention period.' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    // Only entries this viewer can see are eligible, so hidden super admin entries are never removed.
    const { deletedCount } = await AuditLog.deleteMany({ ...(await getVisibleLogFilter()), createdAt: { $lt: cutoff } });
    await logAuditEvent({ user, action: 'audit-log.delete', target: 'AuditLog',
      details: `Deleted ${deletedCount} audit log entries older than ${months} month(s) (before ${cutoff.toISOString()}).`, req });
    return NextResponse.json({ success: true, deletedCount, cutoff });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
