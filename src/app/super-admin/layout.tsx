import { requirePanelUser } from '@/lib/panelSession';

export const metadata = { title: 'Super Admin | Shajgoj', robots: { index: false, follow: false } };

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requirePanelUser('superadmin');
  return children;
}
