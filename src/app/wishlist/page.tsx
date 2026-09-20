"use client";

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/product/ProductCard';
import { HeartIcon } from '@/components/common/Icons';

export default function WishlistPage() {
  const { wishlist, totalWishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
      <div className="border-b border-gray-100 pb-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-sg-black uppercase tracking-tight">
            My Wishlist ({totalWishlist})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            All your saved authentic beauty favorites in one place.
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs font-bold text-sg-pink hover:underline uppercase"
        >
          Continue Shopping →
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 p-8 space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-sg-pink-light flex items-center justify-center text-sg-pink">
            <HeartIcon className="w-8 h-8" filled />
          </div>
          <h2 className="text-base font-bold text-sg-black">Your wishlist is currently empty</h2>
          <p className="text-xs text-gray-500">
            Explore our vast beauty catalog and click the heart icon on any product to save it for later.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-sg-pink text-white rounded-full text-xs font-bold uppercase hover:bg-sg-pink-hover shadow-md transition-colors"
          >
            Explore Bestsellers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
