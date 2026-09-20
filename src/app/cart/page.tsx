"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShajgojBagIcon, ShieldCheckIcon, TruckIcon } from '@/components/common/Icons';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const shippingFee = subtotal >= 1500 || items.length === 0 ? 0 : 60;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'SHAJGOJ10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      setCouponMessage('🎉 Coupon applied! 10% discount subtracted.');
    } else {
      setCouponMessage('❌ Invalid coupon code. Try "SHAJGOJ10"');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h1 className="text-xl md:text-2xl font-black text-sg-black uppercase tracking-tight">
          Shopping Bag ({totalItems} items)
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 p-8 space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-sg-pink-light flex items-center justify-center text-sg-pink">
            <ShajgojBagIcon className="w-8 h-8" color="#eb0064" />
          </div>
          <h2 className="text-base font-bold text-sg-black">Your shopping bag is empty</h2>
          <p className="text-xs text-gray-500">
            You have not added any beauty items to your shopping bag yet.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-sg-pink text-white rounded-full text-xs font-bold uppercase hover:bg-sg-pink-hover shadow-md transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden shadow-xs">
              {items.map((item) => (
                <div key={item.product.id} className="p-4 flex gap-4 items-center">
                  <div className="w-20 h-20 relative bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <Image
                      src={item.product.thumbnail || item.product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'}
                      alt={item.product.name}
                      fill
                      className="object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {item.product.brand}
                    </span>
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="text-xs font-semibold text-sg-black hover:text-sg-pink line-clamp-1 block"
                    >
                      {item.product.name}
                    </Link>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-sg-pink">৳{item.product.sale_price}</span>
                      {item.product.regular_price > item.product.sale_price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ৳{item.product.regular_price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-sg-black">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>

                  {/* Total item price */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-xs font-black text-sg-black">
                      ৳{item.product.sale_price * item.quantity}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[11px] text-gray-400 hover:text-red-500 block ml-auto mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <Link href="/shop" className="hover:text-sg-pink font-semibold">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-sg-black border-b border-gray-100 pb-3">
                Order Summary
              </h2>

              {/* Coupon Form */}
              <form onSubmit={applyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. SHAJGOJ10)"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase focus:outline-none focus:border-sg-pink"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-sg-black text-white rounded-lg text-xs font-bold hover:bg-sg-pink transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className="text-[10px] text-emerald-600 font-semibold">{couponMessage}</p>
                )}
              </form>

              {/* Totals */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-sg-black">৳{subtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `৳${shippingFee}`}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-sg-black">Total Payable</span>
                  <span className="font-black text-lg text-sg-pink">৳{grandTotal}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full block text-center py-3 bg-sg-pink hover:bg-sg-pink-hover text-white font-bold text-xs uppercase rounded-full shadow-md active:scale-95 transition-all"
              >
                Proceed to Checkout
              </Link>

              {/* Trust assurances */}
              <div className="space-y-2 pt-2 text-[11px] text-gray-500 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-sg-pink" />
                  <span>100% Genuine and Authentic Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <TruckIcon className="w-4 h-4 text-sg-pink" />
                  <span>Nationwide delivery with Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
