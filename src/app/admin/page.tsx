"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatsCard from '@/components/admin/StatsCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { ShoppingCartIcon, BarChartIcon, UsersIcon, PackageIcon, AlertTriangleIcon } from '@/components/common/Icons';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/dashboard?range=${dateRange}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, [dateRange]);

  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    lowStockCount: 0,
  };

  const chartData = data?.chartData || [];
  const statusDistribution = data?.statusDistribution || {};
  const topProducts = data?.topProducts || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const recentOrders = data?.recentOrders || [];
  const recentCustomers = data?.recentCustomers || [];

  const maxRevenue = Math.max(1, ...chartData.map((d: any) => d.revenue || 0));

  return (
    <div className="space-y-8">
      {/* Top Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Enterprise Overview</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time analytics and operations command center
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['today', '7d', '30d'].map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateRange === r
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {r === 'today' ? 'Today' : r === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Revenue"
          value={`৳${stats.totalRevenue.toLocaleString()}`}
          icon="৳"
          gradient="from-emerald-500 to-teal-600"
          subtitle="All net orders"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCartIcon className="w-5 h-5" />}
          gradient="from-blue-500 to-indigo-600"
          subtitle="Orders placed"
        />
        <StatsCard
          title="Avg Order"
          value={`৳${stats.avgOrderValue.toLocaleString()}`}
          icon={<BarChartIcon className="w-5 h-5" />}
          gradient="from-purple-500 to-pink-600"
          subtitle="Basket value"
        />
        <StatsCard
          title="Customers"
          value={stats.totalCustomers}
          icon={<UsersIcon className="w-5 h-5" />}
          gradient="from-cyan-500 to-blue-600"
          subtitle="Registered accounts"
        />
        <StatsCard
          title="Products"
          value={stats.totalProducts}
          icon={<PackageIcon className="w-5 h-5" />}
          gradient="from-amber-500 to-orange-600"
          subtitle="Live in catalog"
        />
        <StatsCard
          title="Low Stock"
          value={stats.lowStockCount}
          icon={<AlertTriangleIcon className="w-5 h-5" />}
          gradient="from-rose-500 to-red-600"
          subtitle="Items ≤ 5 qty"
        />
      </div>

      {/* Sales Velocity Chart & Order Status Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Revenue Velocity</h3>
              <p className="text-xs text-gray-400">Daily sales performance breakdown</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              Live Feed
            </span>
          </div>

          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-xs text-gray-400">
              Loading analytics...
            </div>
          ) : (
            <div className="h-52 flex items-end gap-3 pt-6">
              {chartData.map((d: any, idx: number) => {
                const heightPercent = Math.max(8, Math.round((d.revenue / maxRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      ৳{d.revenue.toLocaleString()} ({d.orders} orders)
                    </div>
                    <div className="w-full bg-slate-50 rounded-xl overflow-hidden flex flex-col justify-end h-36">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-sg-pink to-[#ff6b8b] rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">{d.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Lifecycle Matrix */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Order Pipelines</h3>
              <Link href="/admin/orders" className="text-xs font-bold text-sg-pink hover:underline">
                View All →
              </Link>
            </div>
            <p className="text-xs text-gray-400 mb-4">Distribution by fulfillment stage</p>

            <div className="space-y-3">
              {[
                { label: 'Pending', count: statusDistribution.pending || 0, color: 'bg-amber-400' },
                { label: 'Processing', count: statusDistribution.processing || 0, color: 'bg-indigo-500' },
                { label: 'Shipped', count: statusDistribution.shipped || 0, color: 'bg-cyan-500' },
                { label: 'Delivered', count: statusDistribution.delivered || 0, color: 'bg-emerald-500' },
                { label: 'Cancelled', count: statusDistribution.cancelled || 0, color: 'bg-rose-500' },
              ].map((st) => (
                <div key={st.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">{st.label}</span>
                    <span className="text-gray-900">{st.count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${st.color} rounded-full`}
                      style={{
                        width: `${
                          stats.totalOrders > 0 ? (st.count / stats.totalOrders) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/admin/orders"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <span>Manage Fulfillment Pipeline</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Selling Products & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Top Selling Products</h3>
              <p className="text-xs text-gray-400">Highest volume performers</p>
            </div>
            <Link href="/admin/products" className="text-xs font-bold text-sg-pink hover:underline">
              Catalog →
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {topProducts.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No sales data recorded yet.</p>
            ) : (
              topProducts.map((p: any) => (
                <div key={p._id || p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.thumbnail || '/assets/placeholder.png'}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {p.category} • {p.sold_count || 0} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-gray-900">৳{p.sale_price || p.price}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      ★ {p.rating || 5.0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Low Stock Inventory</h3>
              <p className="text-xs text-gray-400">Items below replenish threshold (≤ 5)</p>
            </div>
            <Link href="/admin/products" className="text-xs font-bold text-rose-600 hover:underline">
              Restock All →
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-emerald-600 py-6 text-center font-medium">
                ✓ All inventory items are adequately stocked!
              </p>
            ) : (
              lowStockProducts.map((p: any) => (
                <div key={p._id || p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.thumbnail || '/assets/placeholder.png'}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{p.brand || 'Catalog'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                        p.stock === 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.stock === 0 ? 'Out of Stock' : `${p.stock} units left`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Stream */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Customer Orders</h3>
            <p className="text-xs text-gray-400">Incoming purchases and fulfillment status</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-sg-pink hover:underline"
          >
            All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-400 uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o: any) => (
                  <tr key={o._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-900">#{o.orderNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{o.customer?.fullName}</td>
                    <td className="px-4 py-3 text-gray-500">{o.customer?.city}</td>
                    <td className="px-4 py-3 uppercase font-semibold text-gray-600">
                      {o.paymentMethod || 'COD'}
                    </td>
                    <td className="px-4 py-3 font-black text-gray-900">
                      ৳{o.grandTotal || o.pricing?.total || 0}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} type="order" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders?search=${o.orderNumber}`}
                        className="text-sg-pink font-bold hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
