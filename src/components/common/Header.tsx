"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { NavData, NavMenuItem, Product } from '@/types';
import { DEFAULT_MENU } from '@/lib/defaultMenu';
import { trackEvent } from '@/lib/tracking';
import {
  SearchIcon, ShajgojBagIcon, ChevronDownIcon, StarIcon, BarChartIcon, ShoppingBagIcon,
  CrownIcon, ShieldIcon, LogOutIcon, FlameIcon, HeartIcon, UserIcon,
} from './Icons';

const ALPHABET = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'];

/** Debounced live search against MongoDB (via /api/products). */
function useProductSearch(query: string) {
  // Results are stored with the query they answer, so "searching" and
  // "no query" states are derived during render rather than set in the effect.
  const [answer, setAnswer] = useState<{ query: string; results: Product[] }>({ query: '', results: [] });
  const trimmed = query.trim();
  const isActive = trimmed.length >= 2;

  useEffect(() => {
    if (!isActive) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}&limit=6`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setAnswer({ query: trimmed, results: Array.isArray(data) ? data : [] });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setAnswer({ query: trimmed, results: [] });
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [trimmed, isActive]);

  const isCurrent = answer.query === trimmed;
  return {
    results: isActive && isCurrent ? answer.results : [],
    isSearching: isActive && !isCurrent,
  };
}

const brandInitial = (name: string) => {
  const first = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
};

/**
 * A–Z brand directory. Letters scroll the list to their group instead of
 * re-filtering it, so the panel never changes size or reflows under the
 * cursor; typing in the search box is the only thing that filters.
 */
function BrandsFlyout({ brands, onNavigate }: { brands: NavData['brands']; onNavigate: () => void }) {
  const [query, setQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, NavData['brands']>();
    [...brands]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(b => !q || b.name.toLowerCase().includes(q))
      .forEach(b => {
        const key = brandInitial(b.name);
        map.set(key, [...(map.get(key) ?? []), b]);
      });
    return [...map.entries()].sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)));
  }, [brands, query]);

  const available = useMemo(() => new Set(groups.map(([letter]) => letter)), [groups]);
  const topBrands = useMemo(() => brands.filter(b => b.is_top).slice(0, 8), [brands]);

  const jumpTo = (letter: string) => {
    const container = scrollRef.current;
    const target = container?.querySelector<HTMLElement>(`[data-letter="${letter}"]`);
    if (!container || !target) return;
    setActiveLetter(letter);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The scroll box is `relative`, so offsetTop is already measured from it
    container.scrollTo({ top: target.offsetTop, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // Scroll-spy: keep the letter rail in step with what's visible
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const top = container.scrollTop + 8;
    let current: string | null = null;
    container.querySelectorAll<HTMLElement>('[data-letter]').forEach(el => {
      if (el.offsetTop <= top) current = el.dataset.letter ?? current;
    });
    if (current !== activeLetter) setActiveLetter(current);
  };

  return (
    <div className="grid grid-cols-12 gap-10">
      <div className="col-span-9 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-64 shrink-0">
            <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                scrollRef.current?.scrollTo({ top: 0 });
              }}
              placeholder={`Find a brand (${brands.length})`}
              aria-label="Find a brand"
              className="w-full h-9 pl-8 pr-3 rounded-full bg-sg-gray border border-transparent text-[13px] focus:outline-none focus:bg-white focus:border-sg-pink/60"
            />
          </div>
          <nav aria-label="Brands by letter" className="flex flex-wrap gap-0.5">
            {ALPHABET.filter(l => l !== 'ALL').map(l => {
              const enabled = available.has(l);
              return (
                <button
                  key={l}
                  type="button"
                  disabled={!enabled}
                  onClick={() => jumpTo(l)}
                  aria-current={activeLetter === l ? 'true' : undefined}
                  className={`w-6 h-7 rounded text-[12px] font-semibold transition-colors ${
                    !enabled
                      ? 'text-gray-300 cursor-default'
                      : activeLetter === l
                        ? 'text-sg-pink bg-sg-pink-light'
                        : 'text-gray-600 hover:text-sg-pink hover:bg-sg-pink-light/60'
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Fixed height: the panel never resizes while browsing */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative h-72 overflow-y-auto custom-scroll pr-3 overscroll-contain"
        >
          {groups.length === 0 ? (
            <p className="text-[13px] text-gray-500 pt-6">
              No brand matches &ldquo;{query}&rdquo;. Try a shorter name.
            </p>
          ) : (
            groups.map(([letter, list]) => (
              <section key={letter} data-letter={letter} className="flex gap-6 py-3 border-b border-gray-50 last:border-0">
                <span className="w-10 shrink-0 font-display text-3xl leading-none text-sg-pink/80 select-none" aria-hidden="true">
                  {letter}
                </span>
                <ul className="flex-1 grid grid-cols-3 gap-x-6 gap-y-0.5 text-[13px]">
                  {list.map(brand => (
                    <li key={brand.id}>
                      <Link
                        href={`/shop?brand=${brand.slug}`}
                        onClick={onNavigate}
                        className="block py-1 truncate text-gray-700 hover:text-sg-pink focus-visible:text-sg-pink"
                      >
                        {brand.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>

      <aside className="col-span-3 border-l border-gray-100 pl-8">
        <h4 className="text-[13px] font-semibold text-sg-black mb-3 flex items-center gap-1.5">
          <StarIcon className="w-3.5 h-3.5 text-sg-pink" filled /> Top brands
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {topBrands.map(brand => (
            <Link
              key={brand.id}
              href={`/shop?brand=${brand.slug}`}
              onClick={onNavigate}
              title={brand.name}
              className="h-14 px-2 rounded-lg border border-gray-100 bg-white hover:border-sg-pink/50 hover:shadow-sm transition-[border-color,box-shadow] flex items-center justify-center text-center"
            >
              {brand.logo ? (
                <span className="relative w-full h-8">
                  <Image src={brand.logo} alt={brand.name} fill sizes="96px" className="object-contain" />
                </span>
              ) : (
                <span className="text-xs font-semibold text-sg-black leading-tight">{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
        <Link href="/shop" onClick={onNavigate} className="mt-4 inline-block text-xs font-bold text-sg-pink hover:underline">
          Shop all brands
        </Link>
      </aside>
    </div>
  );
}

function MegaColumns({ item, onNavigate }: { item: NavMenuItem; onNavigate: () => void }) {
  return (
    <div className="flex gap-8">
      <div className="flex-1 grid grid-cols-4 gap-x-8 gap-y-6">
        {item.items.map(group => (
          <div key={group.label}>
            <Link
              href={group.href}
              onClick={onNavigate}
              className="block text-[13px] font-bold text-sg-black hover:text-sg-pink mb-2 transition-colors"
            >
              {group.label}
            </Link>
            <ul className="space-y-1.5">
              {group.children?.map(child => (
                <li key={child.label}>
                  <Link
                    href={child.href}
                    onClick={onNavigate}
                    className="text-[13px] text-gray-600 hover:text-sg-pink transition-colors"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link
        href={item.href || '/shop'}
        onClick={onNavigate}
        className="w-56 shrink-0 rounded-xl bg-gradient-to-br from-sg-pink-light via-white to-sg-pink-light border border-sg-pink-border p-5 flex flex-col justify-between group"
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-sg-pink">Explore</p>
          <p className="font-display text-xl font-semibold text-sg-black mt-1 leading-snug">
            All {item.title}
          </p>
          <p className="text-xs text-gray-500 mt-2">100% authentic, sourced from official distributors.</p>
        </div>
        <span className="text-xs font-bold text-sg-pink group-hover:underline mt-4">Shop now →</span>
      </Link>
    </div>
  );
}

export default function Header({ navData }: { navData: NavData }) {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { totalWishlist } = useWishlist();
  const { user: currentUser, logout } = useAuth();

  const menu = navData.menu.length > 0 ? navData.menu : DEFAULT_MENU;

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);

  const { results: searchResults, isSearching } = useProductSearch(searchQuery);

  // Close every flyout when the route changes (adjusting state during render
  // avoids an extra effect-driven re-render).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenMenu(null);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.clearTimeout(hoverTimer.current);
    };
  }, []);

  // Hover intent: a short delay before opening (so crossing the bar doesn't
  // flash menus), a quicker hand-off between items once a menu is open, and a
  // grace period before closing so slipping a few pixels outside is forgiven.
  const openWithIntent = (slug: string) => {
    window.clearTimeout(hoverTimer.current);
    if (openMenu === slug) return;
    hoverTimer.current = window.setTimeout(() => setOpenMenu(slug), openMenu ? 70 : 140);
  };
  const scheduleClose = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenMenu(null), 220);
  };
  const cancelClose = () => {
    if (openMenu) window.clearTimeout(hoverTimer.current);
  };
  const closeMenus = () => {
    window.clearTimeout(hoverTimer.current);
    setOpenMenu(null);
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setIsSearchOpen(false);
      trackEvent('search', { query: q });
      router.push(`/shop?q=${encodeURIComponent(q)}`);
    }
  };

  const activeItem = menu.find(m => m.slug === openMenu);
  const hasFlyout = (item: NavMenuItem) =>
    item.slug === 'brands' || (item.type !== 'link' && item.items.length > 0);

  return (
    <header className="hidden lg:block sticky top-0 z-[100] bg-white nav-box">
      {/* Top Banner Notice */}
      <div className="bg-sg-black text-white text-[11px] py-1.5 text-center font-medium tracking-wide">
        <span>100% Authentic Beauty Products • Nationwide Delivery in Bangladesh • Hotline: 09613-222333</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Desktop Bar */}
        <div className="flex justify-between items-center py-3.5 gap-8">
          <Link href="/" className="flex items-center flex-shrink-0" aria-label="Shajgoj.bd home">
            <Image
              src="/MainLOGOshajgoj.png"
              alt="Shajgoj.bd"
              width={180}
              height={35}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search Bar with live results from the catalog */}
          <div ref={searchRef} className="flex-1 max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} role="search" className="relative flex items-center">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search for products, brands and more"
                aria-label="Search products"
                className="w-full bg-sg-gray border border-gray-200 rounded-full pl-11 pr-24 py-2.5 text-[13px] text-sg-black placeholder-gray-400 focus:outline-none focus:border-sg-pink focus:ring-2 focus:ring-sg-pink/15 focus:bg-white transition-all"
              />
              <span className="absolute left-4 text-gray-400">
                <SearchIcon className="w-4 h-4" />
              </span>
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-5 rounded-full bg-sg-pink hover:bg-sg-pink-hover text-white text-xs font-bold transition-colors"
              >
                Search
              </button>
            </form>

            {isSearchOpen && searchQuery.trim().length > 1 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-menu-in">
                {isSearching && searchResults.length === 0 ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-lg bg-gray-100" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-gray-100 rounded w-3/4" />
                          <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="p-4 text-xs text-gray-500">No products match &ldquo;{searchQuery}&rdquo;.</p>
                ) : (
                  <>
                    <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto custom-scroll">
                      {searchResults.map((product) => (
                        <Link
                          key={product._id ?? product.id}
                          href={`/product/${product.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="p-3 flex items-center gap-3 hover:bg-sg-pink-light/40 transition-colors"
                        >
                          <div className="w-11 h-11 relative bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
                            <Image src={product.thumbnail} alt={product.name} fill sizes="44px" className="object-contain p-0.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-sg-black truncate">{product.name}</p>
                            <p className="text-[11px] text-gray-400">{product.brand} • {product.category}</p>
                          </div>
                          <span className="text-[13px] font-bold text-sg-pink">৳{product.sale_price}</span>
                        </Link>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full text-center py-2.5 bg-gray-50 hover:bg-sg-pink-light text-sg-pink text-xs font-bold transition-colors border-t border-gray-100"
                    >
                      View all results for &ldquo;{searchQuery.trim()}&rdquo; →
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions: Wishlist, Account, Bag */}
          <div className="flex items-center gap-1">
            <Link
              href="/wishlist"
              className="relative flex flex-col items-center px-3 py-1 text-sg-black hover:text-sg-pink transition-colors"
            >
              <HeartIcon className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">Wishlist</span>
              {totalWishlist > 0 && (
                <span className="absolute top-0 right-2 min-w-4 h-4 px-1 rounded-full bg-sg-pink text-white text-[9px] font-bold flex items-center justify-center">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {currentUser ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  className="flex flex-col items-center px-3 py-1 text-sg-black hover:text-sg-pink transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-sg-pink text-white text-[10px] font-black flex items-center justify-center">
                    {currentUser.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="text-[10px] font-semibold mt-0.5 max-w-[70px] truncate">
                    {currentUser.name?.split(' ')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 text-xs font-semibold animate-menu-in">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="font-bold text-gray-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{currentUser.role || 'customer'}</p>
                    </div>
                    <Link href="/account" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-sg-pink transition-colors">
                      <BarChartIcon className="w-4 h-4" />
                      <span>My Account</span>
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-sg-pink transition-colors">
                      <ShoppingBagIcon className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>
                    {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                      <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-700 bg-purple-50/70 hover:bg-purple-100 transition-colors my-1 font-bold">
                        <CrownIcon className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    {(currentUser.role === 'moderator' || currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                      <Link href="/moderator" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-700 bg-blue-50/70 hover:bg-blue-100 transition-colors my-1 font-bold">
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
                className="flex flex-col items-center px-3 py-1 text-sg-black hover:text-sg-pink transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-0.5">Login</span>
              </Link>
            )}

            <button
              type="button"
              onClick={openCart}
              className="ml-2 bg-sg-pink hover:bg-sg-pink-hover text-white text-xs font-bold py-2.5 px-4 rounded-full flex items-center gap-2 transition-all shadow-md shadow-sg-pink/20 active:scale-95"
            >
              <ShajgojBagIcon className="w-4 h-4" color="#ffffff" />
              <span>Bag</span>
              <span className="min-w-5 h-5 px-1 rounded-full bg-white text-sg-pink text-[11px] font-extrabold flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mega menu navigation (managed from Admin → Mega Menu Builder) */}
      <nav className="relative border-t border-gray-100" onMouseEnter={cancelClose} onMouseLeave={scheduleClose} aria-label="Main">
        <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1">
          {menu.map(item => {
            const isOffer = item.slug === 'offers';
            const isOpen = openMenu === item.slug;
            const flyout = hasFlyout(item);
            return (
              <li key={item.slug} className="relative" onMouseEnter={() => (flyout ? openWithIntent(item.slug) : scheduleClose())}>
                <Link
                  href={item.href || '/shop'}
                  onClick={closeMenus}
                  onFocus={() => flyout && setOpenMenu(item.slug)}
                  aria-expanded={flyout ? isOpen : undefined}
                  aria-haspopup={flyout ? 'true' : undefined}
                  className={`flex items-center gap-1 px-3 py-3 text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap border-b-2 transition-colors ${
                    isOffer
                      ? 'text-sg-pink border-transparent hover:border-sg-pink'
                      : isOpen
                        ? 'text-sg-pink border-sg-pink'
                        : 'text-sg-black border-transparent hover:text-sg-pink'
                  }`}
                >
                  {isOffer && <FlameIcon className="w-3.5 h-3.5" />}
                  {item.title}
                  {flyout && (
                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  )}
                </Link>

                {/* Simple dropdown list */}
                {isOpen && item.type === 'dropdown' && item.slug !== 'brands' && (
                  <div className="absolute left-0 top-full z-50 pt-0 animate-menu-in">
                    <ul className="min-w-52 bg-white rounded-b-xl shadow-xl border border-gray-100 py-2">
                      {item.items.map(link => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={closeMenus}
                            className="block px-4 py-2 text-[13px] text-gray-700 hover:bg-sg-pink-light/50 hover:text-sg-pink transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Full-width mega panel */}
        {activeItem && (activeItem.slug === 'brands' || activeItem.type === 'mega') && hasFlyout(activeItem) && (
          // Stays mounted while moving between menus, so the entrance animation
          // plays once on open rather than on every switch.
          <div className="absolute left-0 right-0 top-full z-50 bg-white border-t border-gray-100 shadow-2xl animate-menu-in">
            {/* Shared minimum height keeps the panel from jumping between menus */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 min-h-[22rem]">
              {activeItem.slug === 'brands' ? (
                <BrandsFlyout brands={navData.brands} onNavigate={closeMenus} />
              ) : (
                <MegaColumns item={activeItem} onNavigate={closeMenus} />
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
