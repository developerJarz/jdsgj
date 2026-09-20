"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminOrModerator =
    pathname?.startsWith('/admin') || pathname?.startsWith('/moderator');

  if (isAdminOrModerator) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <Header />

      {/* Mobile Webview Navigation */}
      <MobileHeader />

      {/* Main Content Area (extra bottom padding on mobile for MobileBottomNav) */}
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Mobile Webview Fixed Bottom Navigation */}
      <MobileBottomNav />

      {/* Storefront Footer */}
      <Footer />
    </>
  );
}
