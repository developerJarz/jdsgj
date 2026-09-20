"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: 'The Ordinary',
    category: 'Skin Care',
    regular_price: 1200,
    sale_price: 950,
    stock: 30,
    thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80',
  });

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const url = onlyLowStock ? '/api/products?low_stock=true' : '/api/products';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [onlyLowStock]);

  const handleStockChange = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    try {
      setProducts(prev => prev.map(p => p._id === productId || p.id === productId ? { ...p, stock: newStock } : p));
      await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePriceChange = async (productId: string, newPrice: number) => {
    if (newPrice <= 0) return;
    try {
      setProducts(prev => prev.map(p => p._id === productId || p.id === productId ? { ...p, sale_price: newPrice } : p));
      await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_price: newPrice }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product from MongoDB?')) return;
    try {
      setProducts(prev => prev.filter(p => p._id !== productId && p.id !== productId));
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts(prev => [data.product, ...prev]);
        setIsModalOpen(false);
        alert('Product added to MongoDB successfully!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Inventory & Catalog</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage product stock levels, pricing, and live catalog</p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-sg-pink hover:bg-sg-pink-hover text-white text-xs font-bold uppercase rounded-full shadow-md transition-all active:scale-95"
        >
          + Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="search"
            placeholder="Search by product name, brand, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sg-pink"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
              className="rounded accent-sg-pink"
            />
            <span>Show Low Stock Only (≤ 10)</span>
          </label>
          <span className="text-xs text-gray-400">Total: {filtered.length} items</span>
        </div>
      </div>

      {/* Products Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400">Loading live inventory from MongoDB...</div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Brand / Category</th>
                  <th className="py-3 px-4">Sale Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((product) => (
                  <tr key={product._id || product.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                          <Image
                            src={product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&q=80'}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <span className="font-bold text-gray-800 line-clamp-1 max-w-xs">{product.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-700 block">{product.brand}</span>
                      <span className="text-gray-400 text-[11px]">{product.category}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">৳</span>
                        <input
                          type="number"
                          value={product.sale_price}
                          onChange={(e) => handlePriceChange(product._id || product.id, Number(e.target.value))}
                          className="w-16 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 font-bold text-sg-pink focus:outline-none focus:border-sg-pink text-xs"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStockChange(product._id || product.id, product.stock - 1)}
                          className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={product.stock}
                          onChange={(e) => handleStockChange(product._id || product.id, Number(e.target.value))}
                          className="w-14 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-center font-bold text-gray-800 focus:outline-none focus:border-sg-pink text-xs"
                        />
                        <button
                          onClick={() => handleStockChange(product._id || product.id, product.stock + 1)}
                          className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {product.stock <= 5 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700">
                          Critical ({product.stock})
                        </span>
                      ) : product.stock <= 10 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
                          Low ({product.stock})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                          In Stock ({product.stock})
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(product._id || product.id)}
                        className="text-red-500 hover:text-red-700 font-semibold text-xs transition-colors p-1"
                        title="Delete product"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Add New Product to Catalog</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. COSRX Advanced Snail 96 Mucin Power Essence"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    value={newProduct.regular_price}
                    onChange={(e) => setNewProduct({ ...newProduct, regular_price: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sale Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.sale_price}
                    onChange={(e) => setNewProduct({ ...newProduct, sale_price: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProduct.thumbnail}
                  onChange={(e) => setNewProduct({ ...newProduct, thumbnail: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-full font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sg-pink text-white rounded-full font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
