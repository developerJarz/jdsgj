import AdminSettings from '@/models/AdminSettings';
import connectDB from '@/lib/db';
import { adminSectionsForApi, isAdminApiBlocked, type AdminSectionId } from '@/lib/adminSections';

export const ADMIN_SETTINGS_ID = 'admin-dashboard';

export async function getAdminDashboardSettings(): Promise<{ disabledSections: AdminSectionId[]; allowAdminAuditDelete: boolean }> {
  await connectDB();
  const settings = await AdminSettings.findById(ADMIN_SETTINGS_ID).lean();
  return { disabledSections: settings?.disabledSections ?? [], allowAdminAuditDelete: settings?.allowAdminAuditDelete === true };
}

export async function getDisabledAdminSections(): Promise<AdminSectionId[]> {
  return (await getAdminDashboardSettings()).disabledSections;
}

export async function canDeleteAuditLogs(role: string): Promise<boolean> {
  if (role === 'superadmin') return true;
  if (role !== 'admin') return false;
  const settings = await getAdminDashboardSettings();
  return settings.allowAdminAuditDelete && !settings.disabledSections.includes('audit-log');
}

export async function isAdminApiDisabled(req: Request, role: string): Promise<boolean> {
  if (role !== 'admin') return false;
  const pathname = new URL(req.url).pathname;
  if (!adminSectionsForApi(pathname).length) return false;
  return isAdminApiBlocked(pathname, req.method, await getDisabledAdminSections());
}
