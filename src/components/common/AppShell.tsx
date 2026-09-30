"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { NavData } from '@/types';
import Header from './Header';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ActivityTracker from './ActivityTracker';

export default function AppShell({ children, navData }: { children: React.ReactNode; navData: NavData }) {
  const pathname = usePathname();

  const isAdminOrModerator =
    pathname?.startsWith('/admin') || pathname?.startsWith('/moderator');

  if (isAdminOrModerator) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Anonymous page-view / session tracking for the admin Activity dashboard */}
      <ActivityTracker />

      {/* Desktop Navigation */}
      <Header navData={navData} />

      {/* Mobile Webview Navigation */}
      <MobileHeader navData={navData} />

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
