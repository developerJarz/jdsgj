"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  SparklesIcon, 
  ShoppingBagIcon, 
  ShieldCheckIcon, 
  MapPinIcon, 
  CrownIcon,
  CheckIcon,
  TruckIcon
} from '@/components/common/Icons';

export default function AccountDashboardPage() {
  const { user, refreshUser } = useAuth();
  const { addToCart } = useCart();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimedDaily, setClaimedDaily] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, ordRes, prodRes] = await Promise.all([
          fetch('/api/account/profile'),
          fetch('/api/account/orders'),
          fetch('/api/products?limit=8'),
        ]);

        const profData = await profRes.json();
        const ordData = await ordRes.json();
        const prodData = await prodRes.json();

        if (profData.success) setProfile(profData.profile);
        if (ordData.success) setOrders(ordData.orders || []);
        if (Array.isArray(prodData)) setProducts(prodData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + (o.grandTotal || 0), 0);

  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  const latestActiveOrder = activeOrders[0];

  // Membership Tier calculation
  const rewardPoints = profile?.rewardPoints || user?.rewardPoints || 50;
  let tier = 'Bronze VIP';
  let tierBg = 'from-amber-700 to-amber-900';
  let nextTierPoints = 200;
  let currentTierBase = 0;

  if (rewardPoints >= 1000) {
    tier = 'Platinum Icon';
    tierBg = 'from-slate-800 via-purple-950 to-slate-900';
    nextTierPoints = 1000;
    currentTierBase = 1000;
  } else if (rewardPoints >= 500) {
    tier = 'Gold Royalty';
    tierBg = 'from-amber-500 via-yellow-600 to-amber-700';
    nextTierPoints = 1000;
    currentTierBase = 500;
  } else if (rewardPoints >= 200) {
    tier = 'Silver Glow';
    tierBg = 'from-slate-500 to-slate-700';
    nextTierPoints = 500;
    currentTierBase = 200;
  }

  const tierProgress = Math.min(100, Math.round(((rewardPoints - currentTierBase) / (nextTierPoints - currentTierBase || 1)) * 100));

  const handleDailyCheckIn = () => {
    if (claimedDaily) return;
    setClaimedDaily(true);
    showToast('✨ Claimed +10 Daily Beauty Points! Keep glowing!');
  };

  const handleQuickAddToCart = (product: any) => {
    addToCart(product, 1);
    showToast(`Added ${product.name} to your bag!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[200] bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 border border-gray-700">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* VIP Membership Hero Card */}
      <div className={`bg-gradient-to-r ${tierBg} text-white p-6 rounded-3xl shadow-lg relative overflow-hidden`}>
        {/* Shimmer background decoration */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-6 top-6 opacity-20 text-7xl font-black">👑</div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full flex items-center gap-1.5">
              <CrownIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>{tier} Member</span>
            </span>

            <span className="text-[11px] font-mono opacity-80">
              ID: SG-MEMBER-{profile?.phone?.slice(-4) || '8821'}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hello, {profile?.name || user?.name || 'Beauty Lover'}! ✨
            </h1>
            <p className="text-xs text-white/80 mt-1 max-w-lg">
              {profile?.beautyGoal || 'Track your beauty parcels, redeem exclusive reward vouchers, and explore personalized skincare matches.'}
            </p>
          </div>

          {/* Points & Tier Progress */}
          <div className="pt-2 border-t border-white/15 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white/90">
                Reward Balance: <strong className="text-amber-300 font-bold text-sm">{rewardPoints} Points</strong>
              </span>
              <span className="text-[11px] opacity-80">
                {nextTierPoints > rewardPoints ? `${nextTierPoints - rewardPoints} pts to next tier` : 'Maximum Tier Achieved!'}
              </span>
            </div>

            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-300 to-pink-300 h-full rounded-full transition-all duration-1000"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metric Counters & Daily Rewards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Total Orders</span>
            <span>🛍️</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{orders.length}</p>
          <span className="text-[10px] text-blue-600 font-bold">{activeOrders.length} active parcel{activeOrders.length === 1 ? '' : 's'}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Points Worth</span>
            <span>✨</span>
          </div>
          <p className="text-2xl font-black text-sg-pink mt-1">৳{Math.floor(rewardPoints)}</p>
          <Link href="/account/rewards" className="text-[10px] text-sg-pink font-bold hover:underline">
            Convert to coupon →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Total Spent</span>
            <span>💳</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">৳{totalSpent.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-bold">VIP Free Shipping</span>
        </div>

        {/* Daily Check-In Bonus Widget */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-sg-pink uppercase tracking-wider">
            <span>Daily Check-In</span>
            <span>🎁</span>
          </div>
          <p className="text-xs font-semibold text-gray-700 mt-1">Get +10 free points daily</p>
          <button
            type="button"
            onClick={handleDailyCheckIn}
            disabled={claimedDaily}
            className={`mt-2 py-1.5 px-3 rounded-xl text-[11px] font-bold uppercase transition-all shadow-xs ${
              claimedDaily
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-sg-pink hover:bg-sg-pink-hover text-white active:scale-95'
            }`}
          >
            {claimedDaily ? '✓ Claimed Today' : 'Claim +10 Pts'}
          </button>
        </div>
      </div>

      {/* Active Parcel Live Tracker Banner */}
      {latestActiveOrder && (
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                Active Live Shipment
              </span>
              <h3 className="text-sm font-bold text-gray-900 mt-1">
                Order #{latestActiveOrder.orderNumber} ({latestActiveOrder.items?.length || 1} items)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={latestActiveOrder.status} type="order" />
              <Link
                href={`/account/orders/${latestActiveOrder.orderNumber}`}
                className="px-3 py-1.5 bg-gray-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Track Parcel
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className={`p-2 rounded-xl ${['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(latestActiveOrder.status) ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-gray-50 text-gray-400'}`}>
              <span className="block text-sm">✓</span>
              <span className="text-[10px]">Confirmed</span>
            </div>
            <div className={`p-2 rounded-xl ${['processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(latestActiveOrder.status) ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-gray-50 text-gray-400'}`}>
              <span className="block text-sm">⚙</span>
              <span className="text-[10px]">Packing</span>
            </div>
            <div className={`p-2 rounded-xl ${['shipped', 'out_for_delivery', 'delivered'].includes(latestActiveOrder.status) ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-gray-50 text-gray-400'}`}>
              <span className="block text-sm">🚚</span>
              <span className="text-[10px]">In Transit</span>
            </div>
            <div className={`p-2 rounded-xl ${latestActiveOrder.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-gray-50 text-gray-400'}`}>
              <span className="block text-sm">🎉</span>
              <span className="text-[10px]">Delivered</span>
            </div>
          </div>
        </div>
      )}

      {/* Skin Profile Customization Callout */}
      {(!profile?.skinType || !profile?.skinConcerns?.length) && (
        <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-fuchsia-50 p-5 rounded-2xl border border-pink-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sg-pink text-white flex items-center justify-center text-lg shadow-sm">
              ✨
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                Complete Your Beauty & Skin Profile
              </h4>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Tell us your skin type and concerns to get personalized matches + <strong>50 Bonus Reward Points</strong>!
              </p>
            </div>
          </div>
          <Link
            href="/account/profile"
            className="px-5 py-2 bg-sg-pink hover:bg-sg-pink-hover text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md transition-all whitespace-nowrap"
          >
            Customize Profile →
          </Link>
        </div>
      )}

      {/* Personalized Skincare Recommendations Feed */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>Personalized for Your Skin Profile</span>
              <span className="text-[10px] bg-pink-100 text-sg-pink font-bold px-2 py-0.5 rounded-full uppercase">
                {profile?.skinType ? `${profile.skinType.replace('_', ' ')} Skin` : 'Handpicked'}
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Formulated for {profile?.skinConcerns?.[0] || 'radiant glow'} & {profile?.skinConcerns?.[1] || 'hydration'}
            </p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-sg-pink hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {products.slice(0, 4).map((prod) => (
            <div key={prod.id} className="border border-gray-100 rounded-2xl p-3 flex flex-col justify-between hover:border-sg-pink/40 hover:shadow-xs transition-all group">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block truncate">
                  {prod.brand}
                </span>
                <Link href={`/product/${prod.slug}`} className="text-xs font-bold text-gray-800 line-clamp-2 mt-0.5 group-hover:text-sg-pink transition-colors">
                  {prod.name}
                </Link>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
                <span className="font-black text-xs text-sg-pink">৳{prod.sale_price}</span>
                <button
                  type="button"
                  onClick={() => handleQuickAddToCart(prod)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-sg-pink hover:text-white rounded-lg text-[10px] font-bold uppercase transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Purchases</h3>
            <p className="text-xs text-gray-400">Review your past beauty orders and tracking references</p>
          </div>
          <Link href="/account/orders" className="text-xs font-bold text-sg-pink hover:underline">
            View All ({orders.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            You haven't placed any orders yet.{' '}
            <Link href="/shop" className="text-sg-pink font-bold underline ml-1">
              Start shopping!
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 3).map((order) => (
              <div key={order._id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-xs font-mono">
                      #{order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} type="order" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.items?.length || 1} items • ৳{order.grandTotal} • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  href={`/account/orders/${order.orderNumber}`}
                  className="px-3.5 py-1.5 bg-gray-100 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  View Order
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
