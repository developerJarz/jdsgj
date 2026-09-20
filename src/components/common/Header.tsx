"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { SearchIcon, ShajgojBagIcon, ChevronDownIcon, StarIcon, BarChartIcon, ShoppingBagIcon, CrownIcon, ShieldIcon, LogOutIcon, FlameIcon } from './Icons';
import brandsData from '@/data/brands.json';
import categoriesData from '@/data/categories.json';
import productsData from '@/data/products.json';

export default function Header() {
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const { totalWishlist } = useWishlist();
  const { user: currentUser, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedBrandLetter, setSelectedBrandLetter] = useState('ALL');
  const searchRef = useRef<HTMLDivElement>(null);

  // Alphabetical Brand grouping
  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
  const filteredBrands = selectedBrandLetter === 'ALL' 
    ? brandsData 
    : brandsData.filter(b => b.name.toUpperCase().startsWith(selectedBrandLetter));

  const topBrands = brandsData.filter(b => b.is_top);

  // Search instant results
  const searchResults = searchQuery.trim().length > 1
    ? productsData.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-[100] bg-white nav-box border-b border-gray-100">
      {/* Top Banner Notice */}
      <div className="bg-sg-black text-white text-[11px] py-1 text-center font-medium tracking-wide">
        <span>Authentic Beauty Products Nationwide Delivery in Bangladesh • Hotline: 09613-222333</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Desktop Bar */}
        <div className="hidden lg:flex justify-between items-center py-3 gap-6">
          {/* Logo & Brands Dropdown */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/MainLOGOshajgoj.png"
                alt="Shajgoj.bd"
                width={180}
                height={35}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            {/* Brands Mega Dropdown */}
            <div className="relative group">
              <Link
                href="/shop"
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-sg-black hover:text-sg-pink transition-colors py-2"
              >
                BRANDS
                <ChevronDownIcon className="w-3.5 h-3.5" />
              </Link>

              {/* Mega Menu Flyout */}
              <div className="absolute left-0 top-full pt-2 hidden group-hover:block w-[750px] z-50">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-5 grid grid-cols-3 gap-6 brand-dropdown">
                  {/* Column 1: A-Z Filter */}
                  <div className="border-r border-gray-100 pr-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Browse Alphabetically</h4>
                    <div className="flex flex-wrap gap-1 max-h-56 overflow-y-auto custom-scroll pr-1">
                      {alphabet.map(letter => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => setSelectedBrandLetter(letter)}
                          className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                            selectedBrandLetter === letter 
                              ? 'bg-sg-pink text-white font-bold' 
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Brands List */}
                  <div className="border-r border-gray-100 pr-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">
                      {selectedBrandLetter === 'ALL' ? 'All Brands' : `Brands starting with "${selectedBrandLetter}"`}
                    </h4>
                    <ul className="max-h-56 overflow-y-auto custom-scroll space-y-1 text-xs">
                      {filteredBrands.map(brand => (
                        <li key={brand.id}>
                          <Link
                            href={`/shop?brand=${brand.slug}`}
                            className="text-gray-700 hover:text-sg-pink block py-0.5 font-medium transition-colors"
                          >
                            {brand.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 3: Featured Brands */}
                  <div>
                    <h4 className="text-xs font-bold text-sg-pink uppercase mb-2 flex items-center gap-1.5">
                      <StarIcon className="w-3.5 h-3.5" /> Top Featured Brands
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {topBrands.slice(0, 8).map(brand => (
                        <Link
                          key={brand.id}
                          href={`/shop?brand=${brand.slug}`}
                          className="p-2 border border-gray-100 rounded-lg hover:border-sg-pink/50 hover:bg-sg-pink-light/30 transition-all text-xs font-semibold text-center text-sg-black flex items-center justify-center h-10 shadow-xs"
                        >
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/shop"
                      className="block mt-4 text-center text-xs font-bold text-sg-pink hover:underline"
                    >
                      View All 450+ Brands →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar with Autocomplete Dropdown */}
          <div ref={searchRef} className="flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search authentic beauty, makeup, skincare..."
                className="w-full bg-sg-gray border-2 border-sg-pink/80 rounded-full pl-11 pr-4 py-2 text-xs font-medium text-sg-black placeholder-gray-400 focus:outline-none focus:border-sg-pink focus:bg-white transition-all"
              />
              <span className="absolute left-4 text-sg-pink">
                <SearchIcon className="w-4 h-4" />
              </span>
            </form>

            {/* Instant Search Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="p-2 text-[11px] font-bold text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                  Matching Products
                </div>
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto custom-scroll">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="p-2.5 flex items-center gap-3 hover:bg-sg-pink-light/30 transition-colors"
                    >
                      <div className="w-10 h-10 relative bg-gray-50 rounded flex-shrink-0">
                        <Image
                          src={product.thumbnail}
                          alt={product.name}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-sg-black truncate">{product.name}</p>
                        <p className="text-[11px] text-gray-400">{product.brand} • {product.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-sg-pink">৳{product.sale_price}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/shop?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="block text-center py-2 bg-sg-pink text-white text-xs font-bold hover:bg-sg-pink-hover transition-colors"
                >
                  View all results for &quot;{searchQuery}&quot;
                </Link>
              </div>
            )}
          </div>

          {/* Action Links: Wishlist, Login, Bag */}
          <div className="flex items-center gap-3">
            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              className="bg-sg-black text-white hover:bg-sg-black/90 text-xs font-bold py-2.5 px-4 rounded-full flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>WISHLIST</span>
              {totalWishlist > 0 && (
                <span className="w-4 h-4 rounded-full bg-sg-pink text-white text-[10px] font-bold flex items-center justify-center">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* User Account / Login Dropdown */}
            {currentUser ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="bg-sg-gray hover:bg-gray-200 text-sg-black text-xs font-bold py-2 px-3.5 rounded-full flex items-center gap-2 transition-colors border border-gray-200/60"
                >
                  <span className="w-5 h-5 rounded-full bg-sg-pink text-white text-[10px] font-black flex items-center justify-center">
                    {currentUser.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="max-w-[80px] truncate">{currentUser.name?.split(' ')[0]}</span>
                  <ChevronDownIcon className="w-3 h-3 text-gray-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 text-xs font-semibold animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="font-bold text-gray-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{currentUser.role || 'customer'}</p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-sg-pink transition-colors"
                    >
                      <BarChartIcon className="w-4 h-4" />
                      <span>Customer Dashboard</span>
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-sg-pink transition-colors"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>

                    {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-700 bg-purple-50/70 hover:bg-purple-100 transition-colors my-1 font-bold"
                      >
                        <CrownIcon className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    {(currentUser.role === 'moderator' || currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                      <Link
                        href="/moderator"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-700 bg-blue-50/70 hover:bg-blue-100 transition-colors my-1 font-bold"
                      >
                        <ShieldIcon className="w-4 h-4" />
                        <span>Moderator Panel</span>
                      </Link>
                    )}

                    <div className="pt-1 border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold"
                      >
                        <LogOutIcon className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-sg-gray hover:bg-gray-200 text-sg-black hover:text-sg-pink text-xs font-bold py-2.5 px-4 rounded-full transition-colors"
              >
                LOGIN
              </Link>
            )}

            {/* Bag / Cart Button with live counter */}
            <button
              type="button"
              onClick={openCart}
              className="bg-sg-pink hover:bg-sg-pink-hover text-white text-xs font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <ShajgojBagIcon className="w-4 h-4" color="#ffffff" />
              <span>BAG</span>
              <span className="w-5 h-5 rounded-full bg-white text-sg-pink text-xs font-extrabold flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        {/* Categories Desktop Secondary Navigation */}
        <div className="hidden lg:flex items-center justify-between border-t border-gray-100 py-2.5 text-xs font-semibold text-sg-black overflow-x-auto custom-scroll">
          {categoriesData.map(cat => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="hover:text-sg-pink uppercase whitespace-nowrap transition-colors px-2 py-1 rounded hover:bg-sg-pink-light/50"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/shop?offer=offers"
            className="text-sg-pink font-bold uppercase whitespace-nowrap px-2 py-1 rounded bg-sg-pink-light hover:bg-sg-pink hover:text-white transition-colors animate-soft-pulse flex items-center gap-1"
          >
            <FlameIcon className="w-3.5 h-3.5" /> OFFERS
          </Link>
          <Link
            href="/outlets"
            className="text-gray-600 hover:text-sg-pink uppercase whitespace-nowrap px-2 py-1"
          >
            OUTLETS
          </Link>
        </div>
      </nav>
    </header>
  );
}
