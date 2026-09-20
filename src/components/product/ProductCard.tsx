"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { HeartIcon, StarIcon, CheckIcon, ShajgojBagIcon } from '../common/Icons';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);

  const [imgSrc, setImgSrc] = useState(product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80');

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 hover:border-sg-pink/30 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Badges & Wishlist Trigger */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
        {/* Discount Badge */}
        {product.discount_percentage > 0 ? (
          <span className="bg-sg-pink text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
            {product.discount_percentage}% OFF
          </span>
        ) : product.is_new ? (
          <span className="bg-sg-black text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
            NEW
          </span>
        ) : <div />}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="pointer-events-auto p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-sg-pink shadow-xs transition-colors"
          title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          aria-label="Wishlist"
        >
          <HeartIcon className="w-4 h-4" filled={isFavorited} />
        </button>
      </div>

      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgSrc('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80')}
        />
      </Link>

      {/* Product Information */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block truncate">
            {product.brand}
          </span>

          {/* Product Name */}
          <Link
            href={`/product/${product.slug}`}
            className="text-xs font-semibold text-sg-black hover:text-sg-pink line-clamp-2 mt-0.5 transition-colors leading-snug"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center text-amber-400">
              <StarIcon className="w-3.5 h-3.5" filled />
            </div>
            <span className="text-[11px] font-bold text-gray-700">{product.rating}</span>
            <span className="text-[10px] text-gray-400">({product.reviews_count || 15})</span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-sg-pink">
                ৳{product.sale_price}
              </span>
              {product.regular_price > product.sale_price && (
                <span className="text-[11px] text-gray-400 line-through">
                  ৳{product.regular_price}
                </span>
              )}
            </div>
            {product.reward_points ? (
              <span className="text-[9px] text-emerald-600 font-semibold block">
                +{product.reward_points} pts
              </span>
            ) : null}
          </div>

          {/* Quick Add To Bag Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all duration-200 flex items-center gap-1 active:scale-95 shadow-xs ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-sg-pink hover:bg-sg-pink-hover text-white'
            }`}
            aria-label="Add to bag"
          >
            {isAdded ? (
              <>
                <CheckIcon className="w-3.5 h-3.5" />
                <span className="text-[10px]">Added</span>
              </>
            ) : (
              <>
                <ShajgojBagIcon className="w-3.5 h-3.5" color="#ffffff" />
                <span className="text-[10px] hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
