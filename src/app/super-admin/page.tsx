import SuperAdminPanel from '@/components/admin/SuperAdminPanel';
import AdminSettings from '@/models/AdminSettings';
import { ADMIN_SETTINGS_ID } from '@/lib/adminAccess';
import { requirePanelUser } from '@/lib/panelSession';

export default async function SuperAdminPage() {
  await requirePanelUser('superadmin');
  const settings = await AdminSettings.findById(ADMIN_SETTINGS_ID).lean();
  return <SuperAdminPanel initialDisabled={settings?.disabledSections ?? []} initialAllowAdminAuditDelete={settings?.allowAdminAuditDelete === true} initialUpdatedAt={settings?.updatedAt?.toISOString() ?? null} />;
}
