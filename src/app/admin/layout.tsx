"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  BarChartIcon, PackageIcon, FolderIcon, TagLabelIcon, StarIcon,
  ShoppingCartIcon, RefreshIcon, TicketIcon, ZapIcon, UsersIcon,
  PaletteIcon, CompassIcon, FileTextIcon, TruckIcon, ShieldIcon,
  KeyIcon, ScrollIcon, TrendUpIcon, BellIcon, LogOutIcon,
  GlobeIcon, MenuBarIcon, CloseIcon, ExternalLinkIcon
} from '@/components/common/Icons';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: adminUser, logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch unread notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications?unread=true');
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.unreadCount || 0);
          setRecentNotifications(data.notifications?.slice(0, 5) || []);
        }
      } catch (e) {
        // quiet fallback
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const navSections = [
    {
      label: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/admin', icon: <BarChartIcon className="w-4 h-4" /> },
      ],
    },
    {
      label: 'CATALOG & INVENTORY',
      items: [
        { name: 'Products & Stock', href: '/admin/products', icon: <PackageIcon className="w-4 h-4" /> },
        { name: 'Categories', href: '/admin/categories', icon: <FolderIcon className="w-4 h-4" /> },
        { name: 'Brands', href: '/admin/brands', icon: <TagLabelIcon className="w-4 h-4" /> },
        { name: 'Reviews Moderation', href: '/admin/reviews', icon: <StarIcon className="w-4 h-4" filled={false} /> },
      ],
    },
    {
      label: 'SALES & FULFILLMENT',
      items: [
        { name: 'Orders Pipeline', href: '/admin/orders', icon: <ShoppingCartIcon className="w-4 h-4" /> },
        { name: 'Returns & Refunds', href: '/admin/returns', icon: <RefreshIcon className="w-4 h-4" /> },
        { name: 'Coupons & Vouchers', href: '/admin/coupons', icon: <TicketIcon className="w-4 h-4" /> },
        { name: 'Flash Sales & Deals', href: '/admin/promotions', icon: <ZapIcon className="w-4 h-4" /> },
      ],
    },
    {
      label: 'CUSTOMERS',
      items: [
        { name: 'Customer Accounts', href: '/admin/users', icon: <UsersIcon className="w-4 h-4" /> },
      ],
    },
    {
      label: 'CONTENT & LAYOUT',
      items: [
        { name: 'Banners & Hero', href: '/admin/banners', icon: <PaletteIcon className="w-4 h-4" /> },
        { name: 'Mega Menu Builder', href: '/admin/mega-menu', icon: <CompassIcon className="w-4 h-4" /> },
        { name: 'Page Layout Sections', href: '/admin/page-sections', icon: <FileTextIcon className="w-4 h-4" /> },
      ],
    },
    {
      label: 'LOGISTICS',
      items: [
        { name: 'Shipping Zones', href: '/admin/shipping', icon: <TruckIcon className="w-4 h-4" /> },
      ],
    },
    {
      label: 'ACCESS & TEAM',
      items: [
        { name: 'Staff & Moderators', href: '/admin/staff', icon: <ShieldIcon className="w-4 h-4" /> },
        { name: 'Roles & Permissions', href: '/admin/roles', icon: <KeyIcon className="w-4 h-4" /> },
        { name: 'Audit Trail', href: '/admin/audit-log', icon: <ScrollIcon className="w-4 h-4" /> },
      ],
    },
    {
      label: 'ANALYTICS',
      items: [
        { name: 'Sales Reports', href: '/admin/reports', icon: <TrendUpIcon className="w-4 h-4" /> },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const markNotificationsRead = async () => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-gray-800 font-sans">
      {/* Dark Enterprise Full-Height Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-4 border-b border-slate-700/50 flex items-center justify-between shrink-0">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/MainLOGOshajgoj.png"
              alt="Shajgoj.bd Admin"
              width={130}
              height={25}
              className="h-6 w-auto object-contain brightness-0 invert"
            />
            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-sg-pink to-[#ff6b8b] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
              ADMIN
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto custom-scroll py-4">
          {navSections.map((section) => (
            <div key={section.label} className="px-3 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-3">
                {section.label}
              </p>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-sg-pink to-[#ff6b8b] text-white shadow-md shadow-sg-pink/20'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span>{item.name}</span>
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/90" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Database Footer */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="bg-slate-800/60 p-3 rounded-xl space-y-1.5 border border-slate-700/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-300 uppercase">MongoDB Atlas</span>
              </div>
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">CONNECTED</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Cluster0 • shajgoj_store</p>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Container (Padded left by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar menu"
            >
              <MenuBarIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Moderator Shortcut */}
            <Link
              href="/moderator"
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
            >
              <ShieldIcon className="w-3.5 h-3.5" />
              <span>Moderator Panel</span>
            </Link>

            {/* Storefront Link */}
            <Link
              href="/"
              className="text-xs font-semibold text-gray-600 hover:text-sg-pink flex items-center gap-1 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full"
            >
              <GlobeIcon className="w-3.5 h-3.5" />
              <span>Storefront</span>
              <ExternalLinkIcon className="w-3 h-3" />
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    markNotificationsRead();
                  }
                }}
                className="relative p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                title="Notifications"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markNotificationsRead}
                        className="text-[10px] font-semibold text-sg-pink hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No recent notifications</p>
                    ) : (
                      recentNotifications.map((n) => (
                        <Link
                          key={n._id}
                          href={n.link || '/admin/orders'}
                          onClick={() => setShowNotifications(false)}
                          className="block text-xs p-2.5 rounded-xl bg-gray-50 hover:bg-pink-50/60 hover:border-sg-pink/30 border border-transparent transition-all"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-bold text-gray-800 text-xs">{n.title}</p>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-sg-pink shrink-0" />
                            )}
                          </div>
                          <p className="text-gray-600 mt-0.5 text-[11px] leading-snug">{n.message}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin user pill */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sg-pink to-[#ff6b8b] text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                {adminUser?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-xs font-bold text-gray-700 max-w-[120px] truncate">
                {adminUser?.name || 'Admin'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-gray-100"
              title="Logout"
            >
              <LogOutIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Admin Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
