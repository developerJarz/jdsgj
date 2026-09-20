"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { HomeIcon, GridIcon, TagIcon, HeartIcon, UserIcon } from './Icons';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalWishlist } = useWishlist();
  const { user } = useAuth();

  const accountHref = user ? (user.role === 'admin' || user.role === 'superadmin' ? '/admin' : '/account') : '/login';
  const isAccountActive = pathname === '/login' || pathname?.startsWith('/account') || pathname?.startsWith('/admin');

  const navItems = [
    { label: 'Home', href: '/', icon: HomeIcon, isActive: pathname === '/' },
    { label: 'Categories', href: '/shop', icon: GridIcon, isActive: pathname === '/shop' && !pathname?.includes('offer') },
    { label: 'Offers', href: '/shop?offer=special', icon: TagIcon, isActive: pathname?.includes('offer') },
    { label: 'Wishlist', href: '/wishlist', icon: HeartIcon, badge: totalWishlist, isActive: pathname === '/wishlist' },
    { label: user ? 'Account' : 'Login', href: accountHref, icon: UserIcon, isActive: isAccountActive },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[120] bg-white border-t border-gray-200 shadow-lg px-2 py-1.5 flex justify-around items-center"
    >
      {navItems.map((item) => {
        const isActive = item.isActive;
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
              isActive ? 'text-sg-pink font-bold' : 'text-gray-500 hover:text-sg-pink'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-sg-pink text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
