import { NextResponse } from 'next/server';
import { authorizeRole } from '@/lib/middleware/withRole';
import { ADMIN_SETTINGS_ID } from '@/lib/adminAccess';
import { parseDisabledSections } from '@/lib/adminSections';
import AdminSettings from '@/models/AdminSettings';
import { logAuditEvent } from '@/lib/auditLogger';

export async function GET(req: Request) {
  const { errorResponse } = await authorizeRole(req, ['superadmin']);
  if (errorResponse) return errorResponse;
  const settings = await AdminSettings.findById(ADMIN_SETTINGS_ID).lean();
  return NextResponse.json({
    success: true,
    disabledSections: settings?.disabledSections ?? [],
    allowAdminAuditDelete: settings?.allowAdminAuditDelete === true,
    updatedAt: settings?.updatedAt ?? null,
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['superadmin']);
  if (errorResponse || !user) return errorResponse || NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });

  let disabledSections;
  let allowAdminAuditDelete: boolean | undefined;
  try {
    const body = await req.json();
    disabledSections = parseDisabledSections(body?.disabledSections);
    if (body.allowAdminAuditDelete !== undefined && typeof body.allowAdminAuditDelete !== 'boolean') {
      throw new Error('allowAdminAuditDelete must be a boolean.');
    }
    allowAdminAuditDelete = body.allowAdminAuditDelete;
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Invalid settings.' }, { status: 400 });
  }

  const settings = await AdminSettings.findByIdAndUpdate(ADMIN_SETTINGS_ID, {
    $set: { disabledSections, updatedBy: user.userId, ...(allowAdminAuditDelete !== undefined ? { allowAdminAuditDelete } : {}) },
  }, { upsert: true, returnDocument: 'after', runValidators: true });

  await logAuditEvent({ user, action: 'admin-dashboard.update', target: 'AdminSettings', targetId: ADMIN_SETTINGS_ID,
    details: `Updated dashboard visibility for all admins. Hidden sections: ${disabledSections.join(', ') || 'none'}. Admin audit deletion: ${settings.allowAdminAuditDelete ? 'enabled' : 'disabled'}.`, req });

  return NextResponse.json({ success: true, disabledSections: settings.disabledSections, allowAdminAuditDelete: settings.allowAdminAuditDelete === true, updatedAt: settings.updatedAt });
}
