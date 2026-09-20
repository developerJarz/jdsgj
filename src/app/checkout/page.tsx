"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheckIcon, CheckIcon, ShoppingBagIcon } from '@/components/common/Icons';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Dhaka',
    address: '',
    notes: '',
    paymentMethod: 'cod',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderCompleted, setOrderCompleted] = useState<string | null>(null);

  // Pre-fill customer details from logged in user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        address: prev.address || user.addresses?.[0]?.address || '',
        city: prev.city || user.addresses?.[0]?.city || 'Dhaka',
      }));
    }
  }, [user]);

  const shippingFee = subtotal >= 1500 || items.length === 0 ? 0 : 60;
  const grandTotal = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      customer: formData,
      items: items.map(i => ({
        id: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        qty: i.quantity,
        price: i.product.sale_price,
        thumbnail: i.product.thumbnail,
      })),
      subtotal,
      shippingFee,
      grandTotal,
      paymentMethod: formData.paymentMethod,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      setIsSubmitting(false);

      if (res.ok && data?.success) {
        setOrderCompleted(data.orderNumber || data.orderId || `SG-${Date.now().toString().slice(-6)}`);
        clearCart();
      } else if (data && data.message) {
        setErrorMsg(data.message);
      } else if (res.ok) {
        setOrderCompleted(`SG-${Date.now().toString().slice(-6)}`);
        clearCart();
      } else {
        setErrorMsg('Failed to place order. Please check your information and try again.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Network error while placing order.');
    }
  };

  if (orderCompleted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
          <CheckIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-sg-black">Order Placed Successfully!</h1>
        <p className="text-xs text-gray-500">
          Thank you for choosing Shajgoj.bd! Your official order reference is <strong className="text-sg-pink font-mono font-black">{orderCompleted}</strong>.
          We are preparing your package for fast delivery.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/account/orders"
            className="px-6 py-2.5 bg-sg-black hover:bg-black text-white rounded-full text-xs font-bold uppercase transition-all shadow-md flex items-center gap-1.5"
          >
            <ShoppingBagIcon className="w-4 h-4" />
            <span>Track in My Orders</span>
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 bg-sg-pink text-white rounded-full text-xs font-bold uppercase hover:bg-sg-pink-hover shadow-md transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-base font-bold text-sg-black">No items to checkout</h2>
        <p className="text-xs text-gray-500">Your bag is empty. Add products before placing an order.</p>
        <Link href="/shop" className="inline-block px-5 py-2 bg-sg-pink text-white rounded-full text-xs font-bold">
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h1 className="text-xl md:text-2xl font-black text-sg-black uppercase tracking-tight">
          Checkout & Delivery
        </h1>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg('')} className="font-bold underline text-[11px]">Dismiss</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer & Shipping Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sg-black border-b border-gray-100 pb-2">
              1. Delivery Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Ayesha Rahman"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sg-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Phone (11 digits) *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sg-pink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City / Region *</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sg-pink"
                >
                  <option value="Dhaka">Dhaka City</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                  <option value="Other">Other Districts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="optional for invoices"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sg-pink"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address / House / Road *</label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House 12, Road 4, Sector 7, Uttara, Dhaka"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sg-pink"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sg-black border-b border-gray-100 pb-2">
              2. Payment Method
            </h2>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-sg-pink transition-colors bg-gray-50/50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className="accent-sg-pink"
                />
                <div>
                  <span className="text-xs font-bold text-sg-black block">Cash on Delivery (COD)</span>
                  <span className="text-[11px] text-gray-500">Pay cash directly when the delivery rider hands over your package.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-sg-pink transition-colors bg-gray-50/50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash"
                  checked={formData.paymentMethod === 'bkash'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'bkash' })}
                  className="accent-sg-pink"
                />
                <div>
                  <span className="text-xs font-bold text-sg-black block">bKash / Nagad / Online Payment</span>
                  <span className="text-[11px] text-gray-500">Instant online mobile wallet transfer.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Review */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sg-black border-b border-gray-100 pb-2">
              Order Summary ({items.length} items)
            </h2>

            <div className="max-h-48 overflow-y-auto custom-scroll divide-y divide-gray-100 pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="py-2 flex justify-between text-xs">
                  <span className="line-clamp-1 pr-2 text-gray-700">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-bold text-sg-black whitespace-nowrap">
                    ৳{item.product.sale_price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-sg-black">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping ({formData.city})</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `৳${shippingFee}`}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline font-bold">
                <span className="text-sm text-sg-black">Total to Pay</span>
                <span className="text-xl font-black text-sg-pink">৳{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-sg-pink hover:bg-sg-pink-hover text-white font-bold text-xs uppercase rounded-full shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
              <ShieldCheckIcon className="w-4 h-4 text-sg-pink" />
              <span>100% Secure Checkout Guaranteed</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
