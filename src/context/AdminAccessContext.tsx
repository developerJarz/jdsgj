'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { canAccessAdminPath, type AdminAccess } from '@/lib/adminSections';

interface AdminAccessValue {
  access: AdminAccess;
  /** Whether the current viewer (or the admin preview) can open this admin URL. */
  canAccess: (href: string) => boolean;
  /** Whether this admin URL is hidden from regular admins by the super admin's saved settings. */
  isHiddenFromAdmins: (href: string) => boolean;
  /** Super admins can preview the panel exactly as regular admins see it. */
  previewAsAdmin: boolean;
  setPreviewAsAdmin: (value: boolean) => void;
  error: string | null;
}

const Context = createContext<AdminAccessValue | null>(null);

export function AdminAccessProvider({ initialAccess, children }: { initialAccess: AdminAccess; children: React.ReactNode }) {
  const [access, setAccess] = useState(initialAccess);
  const [previewAsAdmin, setPreviewAsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const response = await fetch('/api/admin/access', { cache: 'no-store' });
        if (cancelled) return;
        if (response.status === 401) {
          setError('Your session has ended. Please sign in again.');
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        if (response.status === 403) {
          setError('This account no longer has admin access.');
          router.refresh();
          return;
        }
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error('Unable to load dashboard access. Please try again.');
        if (!cancelled) { setAccess(data.access); setError(null); }
      } catch {
        if (!cancelled) setError('Could not check your access settings. Please try again.');
      }
    }
    void refresh();
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    return () => { cancelled = true; window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [pathname, router]);

  const previewing = previewAsAdmin && access.role === 'superadmin';
  const canAccess = useCallback(
    (href: string) => canAccessAdminPath(previewing ? 'admin' : access.role, access.disabledSections, href),
    [access, previewing],
  );
  const isHiddenFromAdmins = useCallback(
    (href: string) => !canAccessAdminPath('admin', access.disabledSections, href),
    [access],
  );
  return (
    <Context.Provider value={{ access, canAccess, isHiddenFromAdmins, previewAsAdmin: previewing, setPreviewAsAdmin, error }}>
      {children}
    </Context.Provider>
  );
}

export function useAdminAccess() {
  const context = useContext(Context);
  if (!context) throw new Error('useAdminAccess requires AdminAccessProvider');
  return context;
}
