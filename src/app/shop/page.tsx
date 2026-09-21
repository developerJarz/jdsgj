"use client";

import React, { useState, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import brandsData from '@/data/brands.json';
import { Product, Category, Brand } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import { SearchIcon, CloseIcon } from '@/components/common/Icons';

// Chevron icon for accordion
function ChevronIcon({ className, open }: { className?: string; open?: boolean }) {
  return (
    <svg className={`${className} transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

// Star icon for rating filter
function MiniStar({ filled }: { filled: boolean }) {
  return (
    <svg className={`w-3.5 h-3.5 ${filled ? 'text-amber-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// Load data directly — no API calls, instant
const allProducts = productsData as unknown as Product[];
const allCategories = categoriesData as unknown as Category[];
const allBrands = brandsData as unknown as Brand[];

function ShopContent() {
  const searchParams = useSearchParams();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || '');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Accordion states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    brands: true,
    price: true,
    rating: true,
  });

  const toggleSection = useCallback((key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (selectedCategory) {
      list = list.filter(p =>
        p.category_slug.toLowerCase() === selectedCategory.toLowerCase() ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (selectedBrand) {
      list = list.filter(p =>
        p.brand_slug.toLowerCase() === selectedBrand.toLowerCase() ||
        p.brand.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (minPrice > 0) {
      list = list.filter(p => p.sale_price >= minPrice);
    }

    list = list.filter(p => p.sale_price <= maxPrice);

    if (minRating > 0) {
      list = list.filter(p => p.rating >= minRating);
    }

    switch (sortBy) {
      case 'price-low':
        list.sort((a, b) => a.sale_price - b.sale_price);
        break;
      case 'price-high':
        list.sort((a, b) => b.sale_price - a.sale_price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
        break;
      default:
        break;
    }

    return list;
  }, [selectedCategory, selectedBrand, searchQuery, minPrice, maxPrice, minRating, sortBy]);

  // Dynamically calculate real product counts per category and brand
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allProducts.forEach(p => {
      const slug = p.category_slug?.toLowerCase() || '';
      map[slug] = (map[slug] || 0) + 1;
    });
    return map;
  }, []);

  const brandCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allProducts.forEach(p => {
      const slug = p.brand_slug?.toLowerCase() || '';
      map[slug] = (map[slug] || 0) + 1;
    });
    return map;
  }, []);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(5000);
    setMinRating(0);
    setSortBy('featured');
  };

  const hasActiveFilters = Boolean(selectedCategory || selectedBrand || searchQuery || maxPrice < 5000 || minPrice > 0 || minRating > 0);

  const filteredBrandList = allBrands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const ratingOptions = [
    { label: '4.5★ & above', value: 4.5 },
    { label: '4★ & above', value: 4 },
    { label: '3.5★ & above', value: 3.5 },
    { label: '3★ & above', value: 3 },
  ];

  // Shared filter sidebar content
  const filterContent = (isMobile: boolean) => (
    <div className="space-y-1">
      {/* Search within filters */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-8 py-2 focus:outline-none focus:border-sg-pink focus:ring-1 focus:ring-sg-pink/30 transition-all"
        />
        <span className="absolute left-2.5 top-2.5 text-gray-400">
          <SearchIcon className="w-3.5 h-3.5" />
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <CloseIcon className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Categories Accordion */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wide">Categories</h3>
          <ChevronIcon className="w-4 h-4 text-gray-500" open={openSections.categories} />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            openSections.categories ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-2 space-y-0.5 max-h-56 overflow-y-auto custom-scroll">
            <button
              onClick={() => { setSelectedCategory(''); if (isMobile) setIsMobileFilterOpen(false); }}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex justify-between items-center ${
                !selectedCategory ? 'bg-sg-pink text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>All Categories</span>
              <span className={`text-[10px] font-mono font-bold ${!selectedCategory ? 'text-white/80' : 'text-gray-400'}`}>
                ({allProducts.length})
              </span>
            </button>
            {allCategories.map((cat) => {
              const count = categoryCounts[cat.slug.toLowerCase()] || 0;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(isSelected ? '' : cat.slug); if (isMobile) setIsMobileFilterOpen(false); }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex justify-between items-center ${
                    isSelected ? 'bg-sg-pink text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brands Filter */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wide">Brands</h3>
          <ChevronIcon className="w-4 h-4 text-gray-500" open={openSections.brands} />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            openSections.brands ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-2">
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Find brand..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-2 py-1.5 focus:outline-none focus:border-sg-pink focus:ring-1 focus:ring-sg-pink/30 transition-all"
              />
              <span className="absolute left-2 top-2 text-gray-400">
                <SearchIcon className="w-3 h-3" />
              </span>
            </div>
            <div className="space-y-0.5 max-h-56 overflow-y-auto custom-scroll">
              <button
                onClick={() => { setSelectedBrand(''); if (isMobile) setIsMobileFilterOpen(false); }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex justify-between items-center ${
                  !selectedBrand ? 'bg-sg-pink text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>All Brands</span>
                <span className={`text-[10px] font-mono font-bold ${!selectedBrand ? 'text-white/80' : 'text-gray-400'}`}>
                  ({allProducts.length})
                </span>
              </button>
              {filteredBrandList.map((brand) => {
                const count = brandCounts[brand.slug.toLowerCase()] || 0;
                const isSelected = selectedBrand === brand.slug;
                return (
                  <button
                    key={brand.id}
                    onClick={() => { setSelectedBrand(isSelected ? '' : brand.slug); if (isMobile) setIsMobileFilterOpen(false); }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                      isSelected ? 'bg-sg-pink text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{brand.name}</span>
                    <div className="flex items-center gap-1.5">
                      {brand.is_top && (
                        <span className={`text-[9px] px-1 rounded font-semibold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                        }`}>Top</span>
                      )}
                      <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                        ({count})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wide">Rating</h3>
          <ChevronIcon className="w-4 h-4 text-gray-500" open={openSections.rating} />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            openSections.rating ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-2 space-y-0.5">
            <button
              onClick={() => setMinRating(0)}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                minRating === 0 ? 'bg-sg-pink text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>All Ratings</span>
            </button>
            {ratingOptions.map((opt) => {
              const isActive = minRating === opt.value;
              const matchCount = allProducts.filter(p => p.rating >= opt.value).length;
              return (
                <button
                  key={opt.value}
                  onClick={() => setMinRating(isActive ? 0 : opt.value)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                    isActive ? 'bg-sg-pink text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <MiniStar key={s} filled={s <= Math.floor(opt.value)} />
                    ))}
                    <span className="ml-1">&amp; up</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    ({matchCount})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Price Filter */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wide">Price Range</h3>
          <ChevronIcon className="w-4 h-4 text-gray-500" open={openSections.price} />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            openSections.price ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 font-semibold uppercase block mb-1">Min</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-bold">৳</span>
                  <input
                    type="number"
                    min={0}
                    max={maxPrice}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-6 pr-2 py-1.5 focus:outline-none focus:border-sg-pink"
                  />
                </div>
              </div>
              <span className="text-gray-300 mt-5">—</span>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 font-semibold uppercase block mb-1">Max</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-bold">৳</span>
                  <input
                    type="number"
                    min={minPrice}
                    max={5000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-6 pr-2 py-1.5 focus:outline-none focus:border-sg-pink"
                  />
                </div>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={5000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-sg-pink cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>৳0</span>
              <span className="font-bold text-sg-pink">৳{maxPrice}</span>
              <span>৳5000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb & Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <a href="/" className="hover:text-sg-pink">Home</a>
          <span>/</span>
          <span className="text-sg-black font-semibold">Shop All Products</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black text-sg-black uppercase tracking-tight">
          {selectedCategory ? `${selectedCategory.replace('-', ' ')} Products` : selectedBrand ? `${selectedBrand} Collection` : 'All Beauty Products'}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs space-y-3 sticky top-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-xs uppercase tracking-wider text-sg-black">Filters</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] font-semibold text-sg-pink hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>
            {filterContent(false)}
          </div>
        </aside>

        {/* Main Product Area */}
        <div className="flex-1 min-w-0">
          {/* Top Filter & Sort Bar */}
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Mobile Filter Trigger */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3 py-1.5 bg-sg-black text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <span>Filters</span>
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-sg-pink" />}
              </button>

              <span className="text-xs text-gray-500">
                Showing <strong className="text-sg-black">{filteredProducts.length}</strong> of {allProducts.length} items
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="shop-sort" className="text-xs text-gray-500 font-medium">Sort by:</label>
              <select
                id="shop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sg-black focus:outline-none focus:border-sg-pink cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              <span className="text-xs text-gray-400 mr-1">Active Filters:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sg-pink-light text-sg-pink border border-sg-pink-border">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('')}><CloseIcon className="w-3 h-3" /></button>
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sg-pink-light text-sg-pink border border-sg-pink-border">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('')}><CloseIcon className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sg-pink-light text-sg-pink border border-sg-pink-border">
                  Query: {searchQuery}
                  <button onClick={() => setSearchQuery('')}><CloseIcon className="w-3 h-3" /></button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sg-pink-light text-sg-pink border border-sg-pink-border">
                  {minRating}★ &amp; up
                  <button onClick={() => setMinRating(0)}><CloseIcon className="w-3 h-3" /></button>
                </span>
              )}
              {(maxPrice < 5000 || minPrice > 0) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sg-pink-light text-sg-pink border border-sg-pink-border">
                  ৳{minPrice} – ৳{maxPrice}
                  <button onClick={() => { setMinPrice(0); setMaxPrice(5000); }}><CloseIcon className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-sg-pink underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid / Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-xl border border-gray-100 p-8 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <SearchIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-sg-black">No matching products found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try removing some filters or search for another beauty category or brand name.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2 bg-sg-pink text-white text-xs font-bold rounded-full hover:bg-sg-pink-hover transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Slide Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[170] lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col overflow-y-auto custom-scroll">
            <div className="flex justify-between items-center p-4 pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-sm uppercase text-sg-black">Filter Products</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4">
              {filterContent(true)}
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-2 sticky bottom-0 bg-white">
              <button
                onClick={clearFilters}
                className="flex-1 py-2 text-xs font-bold border border-gray-300 rounded-full text-gray-700"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs font-bold bg-sg-pink text-white rounded-full"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl aspect-square"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
