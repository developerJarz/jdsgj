"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  BarChartIcon, ShoppingBagIcon, MapPinIcon, HeartIcon,
  SparklesIcon, TicketIcon, SettingsIcon, LogOutIcon, ShieldIcon, CrownIcon
} from '@/components/common/Icons';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const navLinks = [
    { name: 'Dashboard', href: '/account', icon: <BarChartIcon className="w-4 h-4" /> },
    { name: 'My Orders', href: '/account/orders', icon: <ShoppingBagIcon className="w-4 h-4" /> },
    { name: 'Saved Addresses', href: '/account/addresses', icon: <MapPinIcon className="w-4 h-4" /> },
    { name: 'My Wishlist', href: '/account/wishlist', icon: <HeartIcon className="w-4 h-4" filled /> },
    { name: 'Beauty Points', href: '/account/rewards', icon: <SparklesIcon className="w-4 h-4" /> },
    { name: 'Available Coupons', href: '/account/coupons', icon: <TicketIcon className="w-4 h-4" /> },
    { name: 'Profile Settings', href: '/account/profile', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center text-xs text-gray-400">
        <span className="animate-pulse">Loading your Shajgoj.bd account...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-base font-bold text-gray-900">Please Log In</h2>
        <p className="text-xs text-gray-500">You must be logged in to view your customer dashboard and orders.</p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-sg-pink hover:bg-sg-pink-hover text-white text-xs font-bold rounded-full transition-all"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] py-8 min-h-[70vh]">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Customer Profile Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sg-pink to-[#ff6b8b] text-white font-black text-xl flex items-center justify-center shadow-xs">
                {user?.avatar === 'glow' ? '✨' :
                 user?.avatar === 'rose' ? '🌹' :
                 user?.avatar === 'chic' ? '💄' :
                 user?.avatar === 'natural' ? '🌿' :
                 user?.avatar === 'dewy' ? '💧' :
                 user?.avatar === 'glam' ? '👑' :
                 user?.avatar === 'sunset' ? '🌅' :
                 user?.avatar === 'berry' ? '🫐' :
                 (user?.name?.[0]?.toUpperCase() || 'U')}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 text-sm truncate">{user?.name}</h3>
                <p className="text-[11px] text-gray-500 truncate">{user?.phone || user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-sg-pink bg-pink-50 px-2 py-0.5 rounded-full">
                    ★ {user?.rewardPoints ?? 50} Points
                  </span>
                </div>
              </div>
            </div>

            {/* Admin / Moderator Jump Banners if authorized */}
            {(user.role === 'admin' || user.role === 'superadmin') && (
              <Link
                href="/admin"
                className="flex items-center justify-between p-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-2xl shadow-sm hover:brightness-105 transition-all text-xs font-bold"
              >
                <span className="flex items-center gap-2">
                  <CrownIcon className="w-4 h-4" />
                  <span>Admin Management Panel</span>
                </span>
                <span>→</span>
              </Link>
            )}

            {user.role === 'moderator' && (
              <Link
                href="/moderator"
                className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-700 to-cyan-700 text-white rounded-2xl shadow-sm hover:brightness-105 transition-all text-xs font-bold"
              >
                <span className="flex items-center gap-2">
                  <ShieldIcon className="w-4 h-4" />
                  <span>Moderator Panel</span>
                </span>
                <span>→</span>
              </Link>
            )}

            {/* Navigation Menu */}
            <nav className="bg-white rounded-2xl border border-gray-100 shadow-xs p-2 space-y-0.5">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sg-pink text-white shadow-xs font-bold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span>{item.name}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOutIcon className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Right Panel Main Area */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
