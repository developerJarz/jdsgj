'use client';

import Link from 'next/link';
import { useAdminAccess } from '@/context/AdminAccessContext';

export default function AdminLink(props: React.ComponentProps<typeof Link>) {
  const { canAccess } = useAdminAccess();
  const href = typeof props.href === 'string' ? props.href : props.href.pathname || '/admin';
  return canAccess(href) ? <Link {...props} /> : null;
}
