"use client";

import React, { Suspense, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Drawer from '@/components/admin/Drawer';
import ProductForm, { EMPTY_PRODUCT, ProductFormValues } from '@/components/admin/ProductForm';
import { SelectOption } from '@/components/admin/SearchableSelect';

const PAGE_SIZE = 25;
const PLACEHOLDER = '/favicon.png';

type StockFilter = 'all' | 'low' | 'out';
type StatusFilter = 'all' | 'active' | 'hidden';

interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error';
}

const productKey = (p: any) => String(p._id || p.id);

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <AdminProducts />
    </Suspense>
  );
}

function AdminProducts() {
  // Deep links from the dashboard: ?new=1 opens the form, ?stock=low filters
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>(() => (searchParams.get('stock') === 'low' ? 'low' : 'all'));
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<{ product: any | null } | null>(() =>
    searchParams.get('new') === '1' ? { product: null } : null
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const stockTimers = useRef<Record<string, number>>({});

  const notify = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  // Refetch after a failed inline edit so the table reflects what's saved
  const reloadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?include_inactive=true&sort=newest');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {
      notify('Could not reload products', 'error');
    }
  }, [notify]);

  useEffect(() => {
    fetch('/api/products?include_inactive=true&sort=newest')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => notify('Could not load products', 'error'))
      .finally(() => setIsLoading(false));

    // Brand & category lists for filters and the product form dropdowns
    Promise.all([
      fetch('/api/admin/brands').then((r) => r.json()),
      fetch('/api/admin/categories').then((r) => r.json()),
    ])
      .then(([brandRes, categoryRes]) => {
        setBrands(brandRes?.brands ?? []);
        setCategories(Array.isArray(categoryRes) ? categoryRes : []);
      })
      .catch(() => notify('Could not load brands/categories', 'error'))
      .finally(() => setOptionsLoading(false));

    const timers = stockTimers.current;
    return () => Object.values(timers).forEach((t) => window.clearTimeout(t));
  }, [notify]);

  const brandOptions: SelectOption[] = useMemo(
    () => brands.filter((b) => b.isActive !== false).map((b) => ({ value: String(b._id), label: b.name })),
    [brands]
  );
  const categoryOptions: SelectOption[] = useMemo(
    () =>
      categories.map((c) => ({
        value: String(c._id || c.id),
        label: c.name,
        hint: c.product_count !== undefined ? `${c.product_count} items` : undefined,
      })),
    [categories]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !`${p.name} ${p.brand} ${p.category} ${p.sku ?? ''}`.toLowerCase().includes(q)) return false;
      if (categoryFilter && p.category_slug !== categoryFilter) return false;
      if (brandFilter && p.brand_slug !== brandFilter) return false;
      if (stockFilter === 'low' && !(p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 5))) return false;
      if (stockFilter === 'out' && p.stock > 0) return false;
      if (statusFilter === 'active' && p.is_active === false) return false;
      if (statusFilter === 'hidden' && p.is_active !== false) return false;
      return true;
    });
  }, [products, search, categoryFilter, brandFilter, stockFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const counts = useMemo(
    () => ({
      total: products.length,
      low: products.filter((p) => p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 5)).length,
      out: products.filter((p) => p.stock <= 0).length,
      hidden: products.filter((p) => p.is_active === false).length,
    }),
    [products]
  );

  const saveProduct = async (id: string, patch: Record<string, unknown>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.message || json.error || 'Update failed');
    return json.product;
  };

  const updateLocal = (id: string, patch: Record<string, unknown>) =>
    setProducts((prev) => prev.map((p) => (productKey(p) === id ? { ...p, ...patch } : p)));

  // Stock +/- buttons: update instantly, persist once the admin stops clicking
  const changeStock = (product: any, next: number) => {
    const id = productKey(product);
    const stock = Math.max(0, next);
    updateLocal(id, { stock });
    window.clearTimeout(stockTimers.current[id]);
    stockTimers.current[id] = window.setTimeout(async () => {
      try {
        await saveProduct(id, { stock });
      } catch (err) {
        notify((err as Error).message, 'error');
        reloadProducts();
      }
    }, 500);
  };

  const commitPrice = async (product: any, value: string) => {
    const price = Number(value);
    if (!(price > 0) || price === product.sale_price) return;
    const id = productKey(product);
    try {
      const saved = await saveProduct(id, { sale_price: price });
      updateLocal(id, saved);
      notify(`Price updated to ৳${price}`);
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const toggleActive = async (product: any) => {
    const id = productKey(product);
    const next = product.is_active === false;
    updateLocal(id, { is_active: next });
    try {
      await saveProduct(id, { is_active: next });
      notify(next ? 'Product is now visible on the store' : 'Product hidden from the store');
    } catch (err) {
      updateLocal(id, { is_active: !next });
      notify((err as Error).message, 'error');
    }
  };

  const handleDelete = async (product: any) => {
    if (!confirm(`Delete "${product.name}" permanently? This cannot be undone.\n\nTip: use Hide to remove it from the store but keep its history.`)) return;
    const id = productKey(product);
    const previous = products;
    setProducts((prev) => prev.filter((p) => productKey(p) !== id));
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || json.error || 'Delete failed');
      notify('Product deleted');
    } catch (err) {
      setProducts(previous);
      notify((err as Error).message, 'error');
    }
  };

  const formValuesFor = (p: any): ProductFormValues => {
    if (!p) return EMPTY_PRODUCT;
    const brand = brands.find((b) => b.slug === p.brand_slug || b.name === p.brand);
    const category = categories.find((c) => c.slug === p.category_slug || c.name === p.category);
    const images: string[] = p.images?.length ? p.images : p.thumbnail ? [p.thumbnail] : [];
    return {
      name: p.name ?? '',
      brand_id: brand ? String(brand._id) : '',
      category_id: category ? String(category._id || category.id) : '',
      regular_price: String(p.regular_price ?? ''),
      sale_price: String(p.sale_price ?? ''),
      stock: String(p.stock ?? 0),
      low_stock_threshold: String(p.low_stock_threshold ?? 5),
      sku: p.sku ?? '',
      short_description: p.short_description ?? '',
      description: p.description ?? '',
      how_to_use: p.how_to_use ?? '',
      ingredients: p.ingredients ?? '',
      tags: (p.tags ?? []).join(', '),
      images: p.thumbnail && !images.includes(p.thumbnail) ? [p.thumbnail, ...images] : images,
      is_active: p.is_active !== false,
      is_new: Boolean(p.is_new),
      featured: Boolean(p.featured),
      bestseller: Boolean(p.bestseller),
    };
  };

  const submitForm = async (values: ProductFormValues): Promise<string | null> => {
    const isEdit = Boolean(editing?.product);
    const payload = {
      ...values,
      regular_price: values.regular_price || values.sale_price,
      thumbnail: values.images[0] ?? '',
    };
    try {
      const res = await fetch(isEdit ? `/api/products/${productKey(editing!.product)}` : '/api/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) return json.message || json.error || 'Could not save product';

      if (isEdit) {
        const id = productKey(editing!.product);
        setProducts((prev) => prev.map((p) => (productKey(p) === id ? json.product : p)));
        notify('Product updated — the store is already showing the change');
      } else {
        setProducts((prev) => [json.product, ...prev]);
        notify('Product added and live on the store');
      }
      setEditing(null);
      return null;
    } catch {
      return 'Could not reach the server';
    }
  };

  const selectClass = 'bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-sg-pink';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Products</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {counts.total} products • {counts.low} low stock • {counts.out} out of stock • {counts.hidden} hidden
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ product: null })}
          className="px-4 py-2.5 bg-sg-pink hover:bg-sg-pink-hover text-white text-xs font-bold rounded-full shadow-md shadow-sg-pink/20 transition-all active:scale-95"
        >
          + Add product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search name, brand, category or SKU…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 min-w-52 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sg-pink"
        />
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className={selectClass} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id || c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }} className={selectClass} aria-label="Filter by brand">
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b.slug}>{b.name}</option>
          ))}
        </select>
        <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value as StockFilter); setPage(1); }} className={selectClass} aria-label="Filter by stock">
          <option value="all">Any stock</option>
          <option value="low">Low stock ({counts.low})</option>
          <option value="out">Out of stock ({counts.out})</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }} className={selectClass} aria-label="Filter by visibility">
          <option value="all">Visible & hidden</option>
          <option value="active">Visible only</option>
          <option value="hidden">Hidden only ({counts.hidden})</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-bold text-gray-700">No products match these filters</p>
            <p className="text-xs text-gray-400">Try clearing the search or filters, or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Brand / Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((product) => {
                  const threshold = product.low_stock_threshold ?? 5;
                  const hidden = product.is_active === false;
                  return (
                    <tr key={productKey(product)} className={`hover:bg-gray-50/70 transition-colors ${hidden ? 'opacity-60' : ''}`}>
                      <td className="py-3 px-4">
                        <button type="button" onClick={() => setEditing({ product })} className="flex items-center gap-3 text-left group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.thumbnail || product.images?.[0] || PLACEHOLDER}
                            alt=""
                            loading="lazy"
                            className="w-10 h-10 rounded-lg object-contain p-0.5 bg-gray-50 border border-gray-100 shrink-0"
                          />
                          <span className="min-w-0">
                            <span className="font-bold text-gray-800 line-clamp-1 max-w-xs group-hover:text-sg-pink">{product.name}</span>
                            {product.sku && <span className="block text-[10px] text-gray-400">SKU {product.sku}</span>}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-700 block">{product.brand}</span>
                        <span className="text-gray-400 text-[11px]">{product.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">৳</span>
                          <input
                            key={product.sale_price}
                            type="number"
                            defaultValue={product.sale_price}
                            onBlur={(e) => commitPrice(product, e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                            className="w-20 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 font-bold text-sg-pink focus:outline-none focus:border-sg-pink text-xs"
                            aria-label={`Price for ${product.name}`}
                          />
                        </div>
                        {product.regular_price > product.sale_price && (
                          <span className="text-[10px] text-gray-400 line-through">৳{product.regular_price}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => changeStock(product, product.stock - 1)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold text-gray-700" aria-label="Decrease stock">−</button>
                          <span
                            className={`min-w-10 text-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                              product.stock <= 0
                                ? 'bg-rose-100 text-rose-700'
                                : product.stock <= threshold
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {product.stock}
                          </span>
                          <button onClick={() => changeStock(product, product.stock + 1)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold text-gray-700" aria-label="Increase stock">+</button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleActive(product)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            hidden ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}
                        >
                          {hidden ? 'Hidden' : 'Live'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <a href={`/product/${product.slug}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-800 font-semibold px-1.5">View</a>
                        <button onClick={() => setEditing({ product })} className="text-sg-pink hover:text-sg-pink-hover font-bold px-1.5">Edit</button>
                        <button onClick={() => handleDelete(product)} className="text-rose-500 hover:text-rose-700 font-semibold px-1.5">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs">
            <span className="text-gray-500">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 font-semibold disabled:opacity-40">Previous</button>
              <button disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 font-semibold disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      <Drawer
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.product ? 'Edit product' : 'Add new product'}
        width="xl"
      >
        {editing && (
          <ProductForm
            // Re-initialise once brand/category lists arrive so edit dropdowns preselect correctly
            key={`${editing.product ? productKey(editing.product) : 'new'}-${optionsLoading}`}
            initialValues={formValuesFor(editing.product)}
            brandOptions={brandOptions}
            categoryOptions={categoryOptions}
            optionsLoading={optionsLoading}
            isEditing={Boolean(editing.product)}
            onSubmit={submitForm}
            onCancel={() => setEditing(null)}
          />
        )}
      </Drawer>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold animate-menu-in ${
              t.tone === 'success' ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
