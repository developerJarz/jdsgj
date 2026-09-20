"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { CloseIcon, ShajgojBagIcon, ShieldCheckIcon, SparklesIcon } from './Icons';

export default function CartDrawer() {
  const { isCartOpen, closeCart, items, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 1500;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShajgojBagIcon className="w-5 h-5 text-sg-pink" color="#eb0064" />
              <h2 className="text-base font-bold uppercase tracking-wider text-sg-black">
                Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1 rounded-full text-gray-500 hover:text-sg-pink hover:bg-gray-100 transition-colors"
              aria-label="Close cart"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-4 py-3 bg-sg-pink-light/40 border-b border-sg-pink-border/40">
            <div className="text-xs text-sg-black mb-1.5 flex justify-between font-medium">
              {remainingForFreeShipping > 0 ? (
                <span>Add <strong>৳{remainingForFreeShipping}</strong> more for <strong>FREE DELIVERY</strong>!</span>
              ) : (
                <span className="text-sg-green font-bold flex items-center gap-1">
                  <SparklesIcon className="w-3.5 h-3.5" /> You unlocked FREE DELIVERY!
                </span>
              )}
              <span className="text-sg-pink font-semibold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-sg-pink h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100 custom-scroll">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-sg-pink-light flex items-center justify-center text-sg-pink mb-4">
                  <ShajgojBagIcon className="w-8 h-8" color="#eb0064" />
                </div>
                <h3 className="text-base font-bold text-sg-black mb-1">Your bag is empty</h3>
                <p className="text-xs text-gray-500 mb-6 max-w-[240px]">
                  Looks like you haven&apos;t added any authentic beauty favorites yet.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-sg-pink text-white text-xs font-bold uppercase rounded-full hover:bg-sg-pink-hover transition-colors shadow-md"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="py-3 flex gap-3">
                  <div className="w-20 h-20 relative bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                    <Image
                      src={item.product.thumbnail || item.product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                          {item.product.brand}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <CloseIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <Link 
                        href={`/product/${item.product.slug}`}
                        onClick={closeCart}
                        className="text-xs font-medium text-sg-black line-clamp-2 hover:text-sg-pink transition-colors"
                      >
                        {item.product.name}
                      </Link>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-sg-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-xs font-bold text-sg-pink">
                          ৳{item.product.sale_price * item.quantity}
                        </span>
                        {item.product.regular_price > item.product.sale_price && (
                          <span className="text-[10px] text-gray-400 line-through block">
                            ৳{item.product.regular_price * item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-white space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-lg font-bold text-sg-black">৳{subtotal}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg">
                <ShieldCheckIcon className="w-4 h-4 text-sg-pink flex-shrink-0" />
                <span>100% Authentic Products • Fast Nationwide Delivery</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full text-center py-2.5 px-4 rounded-full border border-sg-black text-sg-black font-bold text-xs uppercase hover:bg-sg-black hover:text-white transition-colors"
                >
                  View Bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full text-center py-2.5 px-4 rounded-full bg-sg-pink text-white font-bold text-xs uppercase hover:bg-sg-pink-hover shadow-md transition-colors"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
