"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/services/apiClient';
import { Product, Category, Brand } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import { SearchIcon, CloseIcon } from '@/components/common/Icons';

function ShopContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || '');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [p, c, b] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCategories(),
        apiClient.getBrands(),
      ]);
      setProducts(p);
      setCategories(c);
      setBrands(b);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Update from URL params if changed
  useEffect(() => {
    const cat = searchParams.get('category');
    const brand = searchParams.get('brand');
    const q = searchParams.get('q');
    if (cat) setSelectedCategory(cat);
    if (brand) setSelectedBrand(brand);
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

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

    list = list.filter(p => p.sale_price <= maxPrice);

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
  }, [products, selectedCategory, selectedBrand, searchQuery, maxPrice, sortBy]);

  // Dynamically calculate real product counts per category and brand
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach(p => {
      const slug = p.category_slug?.toLowerCase() || '';
      map[slug] = (map[slug] || 0) + 1;
    });
    return map;
  }, [products]);

  const brandCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach(p => {
      const slug = p.brand_slug?.toLowerCase() || '';
      map[slug] = (map[slug] || 0) + 1;
    });
    return map;
  }, [products]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setMaxPrice(5000);
    setSortBy('featured');
  };

  const hasActiveFilters = Boolean(selectedCategory || selectedBrand || searchQuery || maxPrice < 5000);

  const filteredBrandList = brands.filter(b => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
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
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
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

            {/* Categories Accordion */}
            <div>
              <h3 className="font-bold text-xs uppercase text-gray-700 mb-2">Categories</h3>
              <div className="space-y-1 max-h-56 overflow-y-auto custom-scroll pr-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex justify-between items-center ${
                    !selectedCategory ? 'bg-sg-pink-light text-sg-pink font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] text-gray-400 font-mono font-bold">({products.length})</span>
                </button>
                {categories.map((cat) => {
                  const count = categoryCounts[cat.slug.toLowerCase()] || 0;
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isSelected ? '' : cat.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex justify-between items-center ${
                        isSelected ? 'bg-sg-pink-light text-sg-pink font-bold' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-sg-pink font-bold' : 'text-gray-400'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands Filter */}
            <div>
              <h3 className="font-bold text-xs uppercase text-gray-700 mb-2">Brands</h3>
              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder="Find brand..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-2 py-1 focus:outline-none focus:border-sg-pink"
                />
                <span className="absolute left-2 top-2 text-gray-400">
                  <SearchIcon className="w-3 h-3" />
                </span>
              </div>
              <div className="space-y-1 max-h-56 overflow-y-auto custom-scroll pr-1">
                <button
                  onClick={() => setSelectedBrand('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex justify-between items-center ${
                    !selectedBrand ? 'bg-sg-pink-light text-sg-pink font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>All Brands</span>
                  <span className="text-[10px] text-gray-400 font-mono font-bold">({products.length})</span>
                </button>
                {filteredBrandList.map((brand) => {
                  const count = brandCounts[brand.slug.toLowerCase()] || 0;
                  const isSelected = selectedBrand === brand.slug;
                  return (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrand(isSelected ? '' : brand.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-sg-pink-light text-sg-pink font-bold' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{brand.name}</span>
                      <div className="flex items-center gap-1.5">
                        {brand.is_top && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-semibold">Top</span>
                        )}
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-sg-pink font-bold' : 'text-gray-400'}`}>
                          ({count})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xs uppercase text-gray-700">Max Price</h3>
                <span className="text-xs font-bold text-sg-pink">৳{maxPrice}</span>
              </div>
              <input
                type="range"
                min={200}
                max={5000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-sg-pink cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>৳200</span>
                <span>৳5000</span>
              </div>
            </div>
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
                Showing <strong className="text-sg-black">{filteredProducts.length}</strong> items
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
              {maxPrice < 5000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sg-pink-light text-sg-pink border border-sg-pink-border">
                  Max: ৳{maxPrice}
                  <button onClick={() => setMaxPrice(5000)}><CloseIcon className="w-3 h-3" /></button>
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
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 text-sm">
              Loading authentic beauty products...
            </div>
          ) : filteredProducts.length === 0 ? (
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
          <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col p-5 overflow-y-auto custom-scroll">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-sm uppercase text-sg-black">Filter Products</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filters Content */}
            <div className="space-y-6 flex-1">
              <div>
                <h4 className="font-bold text-xs uppercase text-gray-700 mb-2">Category</h4>
                <div className="space-y-1 max-h-56 overflow-y-auto custom-scroll">
                  <button
                    onClick={() => { setSelectedCategory(''); setIsMobileFilterOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center ${!selectedCategory ? 'bg-sg-pink text-white font-bold' : 'text-gray-700'}`}
                  >
                    <span>All Categories</span>
                    <span className="text-[10px] opacity-75">({products.length})</span>
                  </button>
                  {categories.map(cat => {
                    const count = categoryCounts[cat.slug.toLowerCase()] || 0;
                    const isSelected = selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(isSelected ? '' : cat.slug); setIsMobileFilterOpen(false); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center ${isSelected ? 'bg-sg-pink text-white font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[10px] opacity-75 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-gray-700 mb-2">Brand</h4>
                <div className="space-y-1 max-h-56 overflow-y-auto custom-scroll">
                  <button
                    onClick={() => { setSelectedBrand(''); setIsMobileFilterOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center ${!selectedBrand ? 'bg-sg-pink text-white font-bold' : 'text-gray-700'}`}
                  >
                    <span>All Brands</span>
                    <span className="text-[10px] opacity-75">({products.length})</span>
                  </button>
                  {brands.map(brand => {
                    const count = brandCounts[brand.slug.toLowerCase()] || 0;
                    const isSelected = selectedBrand === brand.slug;
                    return (
                      <button
                        key={brand.id}
                        onClick={() => { setSelectedBrand(isSelected ? '' : brand.slug); setIsMobileFilterOpen(false); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center ${isSelected ? 'bg-sg-pink text-white font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span className="truncate">{brand.name}</span>
                        <span className="text-[10px] opacity-75 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-4 flex gap-2">
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
                Apply
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
    <Suspense fallback={<div className="py-20 text-center text-sm text-gray-400">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
