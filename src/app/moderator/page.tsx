"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatsCard from '@/components/admin/StatsCard';
import {
  ShoppingCartIcon, HourglassIcon, PackageIcon, AlertTriangleIcon,
  StarIcon, RefreshIcon
} from '@/components/common/Icons';

export default function ModeratorDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('shajgoj_current_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }

    async function loadData() {
      try {
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = data?.stats || {
    totalOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
  };

  const statusDistribution = data?.statusDistribution || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Welcome back, {user?.name || 'Operator'}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Assigned queue tasks and operational fulfillment metrics
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Orders In Queue"
          value={stats.totalOrders}
          icon={<ShoppingCartIcon className="w-5 h-5" />}
          gradient="from-blue-600 to-indigo-600"
          subtitle="All recorded orders"
        />
        <StatsCard
          title="Pending Fulfillment"
          value={statusDistribution.pending || 0}
          icon={<HourglassIcon className="w-5 h-5" />}
          gradient="from-amber-500 to-orange-500"
          subtitle="Action required"
        />
        <StatsCard
          title="Live Catalog"
          value={stats.totalProducts}
          icon={<PackageIcon className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-600"
          subtitle="Active items"
        />
        <StatsCard
          title="Low Stock"
          value={stats.lowStockCount}
          icon={<AlertTriangleIcon className="w-5 h-5" />}
          gradient="from-rose-500 to-red-600"
          subtitle="Needs replenishment"
        />
      </div>

      {/* Quick Action Station */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-2">Operational Tasks</h3>
        <p className="text-xs text-gray-400 mb-5">Jump directly to your assigned workflow</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <Link
            href="/moderator/orders"
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <ShoppingCartIcon className="w-5 h-5" />
              </span>
              <p className="font-bold text-gray-800">Process Orders</p>
              <p className="text-gray-500 text-[11px] mt-1">Update tracking and order states</p>
            </div>
            <span className="text-blue-600 font-bold mt-4">Open queue →</span>
          </Link>

          <Link
            href="/moderator/reviews"
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <StarIcon className="w-5 h-5" filled={false} />
              </span>
              <p className="font-bold text-gray-800">Moderate Reviews</p>
              <p className="text-gray-500 text-[11px] mt-1">Approve feedback and reply</p>
            </div>
            <span className="text-blue-600 font-bold mt-4">Moderate →</span>
          </Link>

          <Link
            href="/moderator/returns"
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                <RefreshIcon className="w-5 h-5" />
              </span>
              <p className="font-bold text-gray-800">Handle Returns</p>
              <p className="text-gray-500 text-[11px] mt-1">Inspect customer claim requests</p>
            </div>
            <span className="text-blue-600 font-bold mt-4">Review claims →</span>
          </Link>

          <Link
            href="/moderator/products"
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <PackageIcon className="w-5 h-5" />
              </span>
              <p className="font-bold text-gray-800">Stock & Inventory</p>
              <p className="text-gray-500 text-[11px] mt-1">Check quantities & price edits</p>
            </div>
            <span className="text-blue-600 font-bold mt-4">Manage stock →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
