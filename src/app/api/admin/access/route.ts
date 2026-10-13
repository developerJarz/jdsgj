import { NextResponse } from 'next/server';
import { authorizeRole } from '@/lib/middleware/withRole';
import { getAdminDashboardSettings } from '@/lib/adminAccess';

export async function GET(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin']);
  if (errorResponse || !user) return errorResponse || NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
  const settings = await getAdminDashboardSettings();
  return NextResponse.json({
    success: true,
    access: {
      role: user.role,
      disabledSections: settings.disabledSections,
      canDeleteAuditLogs: user.role === 'superadmin' || (settings.allowAdminAuditDelete && !settings.disabledSections.includes('audit-log')),
    },
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}
