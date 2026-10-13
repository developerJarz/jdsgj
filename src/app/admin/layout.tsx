import AdminShell from '@/components/admin/AdminShell';
import { requirePanelUser } from '@/lib/panelSession';
import { getAdminDashboardSettings } from '@/lib/adminAccess';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePanelUser('admin');
  const settings = await getAdminDashboardSettings();
  return <AdminShell initialAccess={{
    role: user.role as 'admin' | 'superadmin',
    disabledSections: settings.disabledSections,
    canDeleteAuditLogs: user.role === 'superadmin' || (settings.allowAdminAuditDelete && !settings.disabledSections.includes('audit-log')),
  }}>{children}</AdminShell>;
}
