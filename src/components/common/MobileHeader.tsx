"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { MenuIcon, CloseIcon, SearchIcon, ShajgojBagIcon, UserIcon, ShieldCheckIcon, FlameIcon, CrownIcon, ShieldIcon, LogOutIcon, ChevronDownIcon } from './Icons';
import { NavData } from '@/types';
import { DEFAULT_MENU } from '@/lib/defaultMenu';
import { trackEvent } from '@/lib/tracking';

export default function MobileHeader({ navData }: { navData: NavData }) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, openCart } = useCart();
  const { totalWishlist } = useWishlist();
  const { user, logout } = useAuth();

  const menu = (navData.menu.length > 0 ? navData.menu : DEFAULT_MENU).filter(m => m.slug !== 'brands');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      trackEvent('search', { query: q });
      router.push(`/shop?q=${encodeURIComponent(q)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsDrawerOpen(false);
    router.push('/');
  };

  return (
    <>
      <div className="lg:hidden sticky top-0 z-[90] bg-white border-b border-gray-100 shadow-xs">
        {/* Mobile Top Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          {/* Hamburger Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 text-gray-700 hover:text-sg-pink focus:outline-none"
            aria-label="Open navigation menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/MainLOGOshajgoj.png"
              alt="Shajgoj.bd"
              width={140}
              height={27}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>

          {/* Right Action Icons: Wishlist & Bag */}
          <div className="flex items-center gap-2">
            <Link
              href="/wishlist"
              className="relative p-1.5 text-gray-700 hover:text-sg-pink"
              aria-label="Wishlist"
            >
              <span className="sr-only">Wishlist</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              {totalWishlist > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-sg-pink text-white text-[9px] font-bold flex items-center justify-center">
                  {totalWishlist}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative p-1.5 text-sg-pink"
              aria-label="Open Shopping Bag"
            >
              <ShajgojBagIcon className="w-6 h-6" color="#eb0064" />
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-sg-pink text-white text-[9px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-2.5">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100% authentic beauty products..."
              className="w-full bg-sg-gray border border-sg-pink/50 rounded-full pl-9 pr-4 py-2 text-xs text-sg-black placeholder-gray-400 focus:outline-none focus:border-sg-pink focus:bg-white"
            />
            <span className="absolute left-3 text-sg-pink">
              <SearchIcon className="w-3.5 h-3.5" />
            </span>
          </form>
        </div>
      </div>

      {/* Slide-out Navigation Drawer (Mobile Webview Menu) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[160] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col custom-scroll overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <Image
                src="/MainLOGOshajgoj.png"
                alt="Shajgoj.bd"
                width={130}
                height={25}
                className="h-6 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:text-sg-pink"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Account Quick Card */}
            {user ? (
              <div className="p-4 bg-sg-pink-light/50 border-b border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sg-pink text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-sg-black truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-500">{user.rewardPoints ?? 50} Points</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href="/account"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 text-center py-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg shadow-xs hover:text-sg-pink"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 text-center py-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg shadow-xs hover:text-sg-pink"
                  >
                    My Orders
                  </Link>
                </div>

                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <Link
                    href="/admin"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    <CrownIcon className="w-3.5 h-3.5" /> Admin Panel
                  </Link>
                )}

                {user.role === 'moderator' && (
                  <Link
                    href="/moderator"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    <ShieldIcon className="w-3.5 h-3.5" /> Moderator Panel
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-center py-1 text-xs font-semibold text-rose-600 hover:underline flex items-center justify-center gap-1"
                >
                  <LogOutIcon className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="p-4 bg-sg-pink-light/50 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-sg-pink flex items-center justify-center text-sg-pink shadow-xs">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-sg-black">Welcome to Shajgoj.bd</p>
                  <Link
                    href="/login"
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-xs font-semibold text-sg-pink hover:underline"
                  >
                    Login / Register →
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="py-2 flex-1 divide-y divide-gray-50">
              <div className="px-4 py-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Shop by Category</p>
                <ul className="divide-y divide-gray-50">
                  {menu.map(item => {
                    const hasChildren = item.type !== 'link' && item.items.length > 0;
                    const isExpanded = expandedMenu === item.slug;
                    return (
                      <li key={item.slug}>
                        <div className="flex items-center justify-between">
                          <Link
                            href={item.href || '/shop'}
                            onClick={() => setIsDrawerOpen(false)}
                            className={`flex-1 py-2.5 text-[13px] font-semibold hover:text-sg-pink ${item.slug === 'offers' ? 'text-sg-pink' : 'text-sg-black'}`}
                          >
                            {item.title}
                          </Link>
                          {hasChildren && (
                            <button
                              type="button"
                              onClick={() => setExpandedMenu(isExpanded ? null : item.slug)}
                              aria-expanded={isExpanded}
                              aria-label={`Show ${item.title} sub-categories`}
                              className="p-2 text-gray-400"
                            >
                              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>
                        {hasChildren && isExpanded && (
                          <ul className="pb-2 pl-3 space-y-0.5">
                            {item.items.flatMap(group => [group, ...(item.type === 'mega' ? group.children ?? [] : [])]).map(link => (
                              <li key={`${link.label}-${link.href}`}>
                                <Link
                                  href={link.href}
                                  onClick={() => setIsDrawerOpen(false)}
                                  className="block py-1.5 text-xs text-gray-600 hover:text-sg-pink"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="px-4 py-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Highlights</p>
                <ul className="space-y-2 text-xs font-medium">
                  <li>
                    <Link
                      href="/shop"
                      onClick={() => setIsDrawerOpen(false)}
                      className="text-sg-black hover:text-sg-pink block py-1 font-semibold"
                    >
                      All Brands ({navData.brands.length})
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop?offer=bogo"
                      onClick={() => setIsDrawerOpen(false)}
                      className="text-sg-pink font-bold block py-1"
                    >
                      <span className="flex items-center gap-1"><FlameIcon className="w-3.5 h-3.5" /> Buy 1 Get 1 (BOGO)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/outlets"
                      onClick={() => setIsDrawerOpen(false)}
                      className="text-sg-black hover:text-sg-pink block py-1"
                    >
                      Store Outlets
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50">
                <div className="flex items-center gap-2 text-xs font-semibold text-sg-black mb-1">
                  <ShieldCheckIcon className="w-4 h-4 text-sg-pink" />
                  <span>100% Authentic Beauty Guarantee</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Every product is sourced directly from certified brand distributors.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
