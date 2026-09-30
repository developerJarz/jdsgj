"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/tracking';

/** Records one page_view per storefront route change. Renders nothing. */
export default function ActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // Defer so tracking never competes with the route's first paint.
    const id = window.setTimeout(() => trackEvent('page_view'), 300);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
