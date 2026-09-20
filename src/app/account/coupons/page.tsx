"use client";

import React, { useState, useEffect } from 'react';

export default function CustomerCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await fetch('/api/account/coupons');
        const json = await res.json();
        if (json.success) {
          setCoupons(json.coupons || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Available Discount Vouchers</h1>
        <p className="text-xs text-gray-500 mt-1">
          Apply these coupon codes during checkout for instant savings
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
          Loading coupons...
        </div>
      ) : coupons.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
          No public discount coupons currently available. Check back during flash sales!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white rounded-2xl p-5 border border-dashed border-sg-pink/40 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-sg-pink transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-base text-sg-pink tracking-tight">
                    {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `৳${coupon.value} FLAT`}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    Valid till {new Date(coupon.endDate).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs font-bold text-gray-800">
                  {coupon.description || 'Special Discount Voucher'}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {coupon.minOrderAmount
                    ? `On orders above ৳${coupon.minOrderAmount}`
                    : 'No minimum order required'}
                  {coupon.maxDiscount ? ` (max discount ৳${coupon.maxDiscount})` : ''}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="font-mono font-black text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-800 tracking-wider">
                  {coupon.code}
                </span>

                <button
                  onClick={() => handleCopy(coupon.code)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    copiedCode === coupon.code
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {copiedCode === coupon.code ? '✓ Copied' : 'Copy Code'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
