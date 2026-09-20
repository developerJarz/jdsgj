"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  BarChartIcon, ShoppingCartIcon, PackageIcon, StarIcon,
  RefreshIcon, MenuBarIcon, CloseIcon, SettingsIcon, LogOutIcon, GlobeIcon
} from '@/components/common/Icons';

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const permissions: string[] = user?.permissions || [];
  const isSuperOrAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const hasPerm = (perm: string) => isSuperOrAdmin || permissions.includes(perm) || permissions.includes('*');

  const menuItems = [
    { name: 'Dashboard', href: '/moderator', icon: <BarChartIcon className="w-4 h-4" />, visible: true },
    { name: 'Orders Pipeline', href: '/moderator/orders', icon: <ShoppingCartIcon className="w-4 h-4" />, visible: hasPerm('orders.view') },
    { name: 'Catalog & Stock', href: '/moderator/products', icon: <PackageIcon className="w-4 h-4" />, visible: hasPerm('products.view') },
    { name: 'Reviews Moderation', href: '/moderator/reviews', icon: <StarIcon className="w-4 h-4" filled={false} />, visible: hasPerm('reviews.view') },
    { name: 'Returns & Refunds', href: '/moderator/returns', icon: <RefreshIcon className="w-4 h-4" />, visible: hasPerm('returns.view') },
  ].filter((item) => item.visible);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <Link href="/moderator" className="flex items-center gap-2">
            <Image
              src="/MainLOGOshajgoj.png"
              alt="Shajgoj.bd Staff"
              width={130}
              height={25}
              className="h-6 w-auto object-contain brightness-0 invert"
            />
            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
              MODERATOR
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

        <div className="flex-1 overflow-y-auto custom-scroll py-4 px-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-3">
            Operational Access
          </p>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/moderator' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.name}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/90" />}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 shrink-0">
          <p className="font-bold text-slate-300">Staff Mode</p>
          <p className="text-[11px]">Permission-governed operations</p>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Open moderator menu"
            >
              <MenuBarIcon className="w-5 h-5" />
            </button>
            <span className="hidden sm:inline-block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Moderator Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isSuperOrAdmin && (
              <Link
                href="/admin"
                className="text-xs font-bold text-sg-pink hover:text-[#d10057] bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
              >
                <SettingsIcon className="w-3.5 h-3.5" /> Admin Panel
              </Link>
            )}

            <Link
              href="/"
              className="text-xs font-semibold text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors bg-gray-50 px-3 py-1.5 rounded-full"
            >
              <GlobeIcon className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>

            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase() || 'M'}
              </div>
              <span className="text-xs font-bold text-gray-700 max-w-[120px] truncate">
                {user?.name || 'Moderator'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <LogOutIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
