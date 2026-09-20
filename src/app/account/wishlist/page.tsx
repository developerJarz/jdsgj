"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CustomerWishlistPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/account/wishlist');
      const json = await res.json();
      if (json.success) {
        setProducts(json.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await fetch(`/api/account/wishlist?productId=${productId}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p._id !== productId && p.id !== productId));
    } catch (e) {
      alert('Failed to remove');
    }
  };

  const handleMoveToCart = (product: any) => {
    addToCart({
      ...product,
      id: product.id || product._id,
      slug: product.slug || String(product.id || product._id),
      name: product.name,
      price: product.sale_price || product.price,
      regular_price: product.regular_price || product.price,
      sale_price: product.sale_price || product.price,
      has_sale: (product.regular_price || 0) > (product.sale_price || 0),
      discount_percentage: 0,
      stock: product.stock || 10,
      rating: product.rating || 5,
      thumbnail: product.thumbnail || product.images?.[0] || '',
      images: product.images || [product.thumbnail || ''],
      category: product.category || '',
      category_slug: product.category_slug || 'skincare',
      brand: product.brand || '',
      brand_slug: product.brand_slug || 'authentic',
    });
    handleRemove(product._id || product.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Wishlist</h1>
        <p className="text-xs text-gray-500 mt-1">Saved items you love for future purchase</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
          Loading wishlist items...
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
          Your wishlist is empty.{' '}
          <Link href="/shop" className="text-sg-pink font-bold underline ml-1">
            Explore products!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p._id || p.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-3">
                  <img
                    src={p.thumbnail || p.images?.[0] || '/assets/placeholder.png'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => handleRemove(p._id || p.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-gray-400 hover:text-rose-500 flex items-center justify-center shadow-xs transition-colors text-xs"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {p.brand || 'Authentic'}
                </p>
                <Link
                  href={`/product/${p.slug || p.id}`}
                  className="font-bold text-xs text-gray-900 line-clamp-2 hover:text-sg-pink transition-colors mt-0.5"
                >
                  {p.name}
                </Link>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-black text-sm text-sg-pink">
                    ৳{p.sale_price || p.price}
                  </span>
                  {p.regular_price && p.regular_price > (p.sale_price || p.price) && (
                    <span className="text-xs text-gray-400 line-through">৳{p.regular_price}</span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleMoveToCart(p)}
                  className="w-full py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:from-[#d10057] hover:to-[#e65a78] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
