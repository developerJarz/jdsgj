import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authenticateRequest } from '@/lib/middleware/withAuth';
import { cache } from 'react';

export const requirePanelUser = cache(async (panel: 'admin' | 'superadmin') => {
  const cookieStore = await cookies();
  const destination = panel === 'superadmin' ? '/super-admin' : '/admin';
  const { user } = await authenticateRequest(new Request(`http://localhost${destination}`, {
    headers: { cookie: cookieStore.toString() },
  }));
  if (!user) redirect(`/login?redirect=${destination}`);
  if (panel === 'superadmin' && user.role !== 'superadmin') {
    redirect(user.role === 'admin' ? '/admin' : user.role === 'moderator' ? '/moderator' : '/account');
  }
  if (user.role !== 'admin' && user.role !== 'superadmin') redirect(user.role === 'moderator' ? '/moderator' : '/account');
  return user;
});
