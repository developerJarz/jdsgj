"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatsCard from '@/components/admin/StatsCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { ShoppingCartIcon, BarChartIcon, UsersIcon, PackageIcon, AlertTriangleIcon, GlobeIcon } from '@/components/common/Icons';

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
];

const PIPELINE = [
  { key: 'pending', label: 'Pending', color: 'bg-amber-400' },
  { key: 'confirmed', label: 'Confirmed', color: 'bg-sky-400' },
  { key: 'processing', label: 'Processing', color: 'bg-indigo-500' },
  { key: 'shipped', label: 'Shipped', color: 'bg-cyan-500' },
  { key: 'delivered', label: 'Delivered', color: 'bg-emerald-500' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-rose-500' },
];

const taka = (n: number) => `৳${Math.round(n || 0).toLocaleString('en-US')}`;
const trendProps = (value?: number) =>
  value === undefined ? {} : { change: `${Math.abs(value)}% vs prev.`, isPositive: value >= 0 };

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/dashboard?range=${dateRange}`);
        const json = await res.json();
        if (cancelled) return;
        if (json.success) setData(json.data);
        else setError(json.error || 'Could not load dashboard data');
      } catch {
        if (!cancelled) setError('Could not reach the server');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadStats();
    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  // Live widget refreshes every 20s while the tab is visible
  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await fetch('/api/admin/activity?range=today');
        const json = await res.json();
        if (json.success) setActivity(json.data);
      } catch {
        // live widget is best-effort
      }
    }
    loadActivity();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadActivity();
    }, 20_000);
    return () => window.clearInterval(interval);
  }, []);

  const stats = data?.stats ?? {};
  const trends = data?.trends ?? {};
  const chartData: { label: string; revenue: number; orders: number }[] = data?.chartData ?? [];
  const statusDistribution: Record<string, number> = data?.statusDistribution ?? {};
  const topProducts = data?.topProducts ?? [];
  const lowStockProducts = data?.lowStockProducts ?? [];
  const recentOrders = data?.recentOrders ?? [];
  const maxRevenue = Math.max(1, ...chartData.map((d) => d.revenue));
  const pipelineTotal = Math.max(1, Object.values(statusDistribution).reduce((a, b) => a + b, 0));
  const rangeLabel = RANGES.find((r) => r.key === dateRange)?.label ?? '';

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Sales, customers and store activity at a glance</p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setDateRange(r.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRange === r.key ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
        <StatsCard title="Revenue" value={taka(stats.totalRevenue)} icon="৳" gradient="from-emerald-500 to-teal-600" {...trendProps(trends.revenue)} />
        <StatsCard title="Orders" value={stats.totalOrders ?? 0} icon={<ShoppingCartIcon className="w-5 h-5" />} gradient="from-blue-500 to-indigo-600" {...trendProps(trends.orders)} />
        <StatsCard title="Avg. Order" value={taka(stats.avgOrderValue)} icon={<BarChartIcon className="w-5 h-5" />} gradient="from-purple-500 to-pink-600" {...trendProps(trends.avgOrderValue)} />
        <StatsCard title="New Customers" value={stats.newCustomers ?? 0} icon={<UsersIcon className="w-5 h-5" />} gradient="from-cyan-500 to-blue-600" {...trendProps(trends.newCustomers)} />
        <StatsCard title="Visitors" value={stats.visitors ?? 0} icon={<GlobeIcon className="w-5 h-5" />} gradient="from-fuchsia-500 to-sg-pink" subtitle={`${stats.conversionRate ?? 0}% converted`} />
        <StatsCard title="Low Stock" value={stats.lowStockCount ?? 0} icon={<AlertTriangleIcon className="w-5 h-5" />} gradient="from-rose-500 to-red-600" subtitle="Items ≤ 5 qty" />
      </div>

      {/* Revenue chart + live activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-gray-900">Revenue</h3>
              <p className="text-xs text-gray-400">{dateRange === 'today' ? 'By hour, today' : `By day, last ${rangeLabel.toLowerCase()}`}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-extrabold text-gray-900">
                {hoveredBar !== null && chartData[hoveredBar] ? taka(chartData[hoveredBar].revenue) : taka(stats.totalRevenue)}
              </p>
              <p className="text-[11px] text-gray-400">
                {hoveredBar !== null && chartData[hoveredBar]
                  ? `${chartData[hoveredBar].label} • ${chartData[hoveredBar].orders} orders`
                  : `${stats.totalOrders ?? 0} orders in period`}
              </p>
            </div>
          </div>

          {isLoading && chartData.length === 0 ? (
            <div className="h-52 rounded-xl bg-gray-50 animate-pulse" />
          ) : chartData.every((d) => d.revenue === 0) ? (
            <div className="h-52 flex items-center justify-center text-xs text-gray-400">No sales recorded in this period yet.</div>
          ) : (
            <div className="h-52 flex items-end gap-[3px] pt-4" onMouseLeave={() => setHoveredBar(null)}>
              {chartData.map((d, idx) => (
                <div
                  key={d.label}
                  className="flex-1 h-full flex flex-col justify-end cursor-default"
                  onMouseEnter={() => setHoveredBar(idx)}
                  title={`${d.label}: ${taka(d.revenue)} (${d.orders} orders)`}
                >
                  <div
                    style={{ height: `${Math.max(2, (d.revenue / maxRevenue) * 100)}%` }}
                    className={`w-full rounded-t-md transition-colors ${
                      hoveredBar === idx ? 'bg-sg-pink' : d.revenue > 0 ? 'bg-sg-pink/70' : 'bg-gray-100'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}
          {chartData.length > 0 && (
            <div className="flex justify-between text-[10px] text-gray-400 mt-2">
              <span>{chartData[0]?.label}</span>
              <span>{chartData[Math.floor(chartData.length / 2)]?.label}</span>
              <span>{chartData[chartData.length - 1]?.label}</span>
            </div>
          )}
        </div>

        {/* Live activity widget */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Live on Store</h3>
            <Link href="/admin/activity" className="text-xs font-bold text-sg-pink hover:underline">
              Full report →
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex w-3 h-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full w-3 h-3 bg-emerald-500" />
            </span>
            <p className="text-3xl font-extrabold text-gray-900">{activity?.live?.visitors ?? 0}</p>
            <p className="text-xs text-gray-500 leading-tight">visitors in the<br />last 5 minutes</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            {[
              { label: 'Views today', value: activity?.totals?.pageViews ?? 0 },
              { label: 'Add to bag', value: activity?.totals?.addToCarts ?? 0 },
              { label: 'Orders', value: activity?.totals?.orders ?? 0 },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl py-2">
                <p className="text-sm font-extrabold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex-1 min-h-0 max-h-56 overflow-y-auto custom-scroll -mx-2">
            <ActivityFeed events={(activity?.feed ?? []).slice(0, 8)} compact />
          </div>
        </div>
      </div>

      {/* Pipeline, Top sellers, Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Order Pipeline</h3>
            <Link href="/admin/orders" className="text-xs font-bold text-sg-pink hover:underline">Manage →</Link>
          </div>
          <div className="space-y-3">
            {PIPELINE.map((st) => {
              const count = statusDistribution[st.key] || 0;
              return (
                <Link key={st.key} href={`/admin/orders?status=${st.key}`} className="block space-y-1 group">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600 group-hover:text-sg-pink">{st.label}</span>
                    <span className="text-gray-900">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${st.color} rounded-full transition-all`} style={{ width: `${(count / pipelineTotal) * 100}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Top Sellers</h3>
            <span className="text-[11px] text-gray-400">{rangeLabel}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No sales in this period yet.</p>
            ) : (
              topProducts.map((p: any, i: number) => (
                <div key={p._id || i} className="py-2.5 flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-gray-300">{i + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumbnail || '/favicon.png'} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.units} sold</p>
                  </div>
                  <p className="text-xs font-extrabold text-gray-900">{taka(p.revenue)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Low Stock</h3>
            <Link href="/admin/products?stock=low" className="text-xs font-bold text-rose-600 hover:underline">Restock →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-emerald-600 py-6 text-center font-medium">✓ Everything is well stocked</p>
            ) : (
              lowStockProducts.map((p: any) => (
                <div key={p._id} className="py-2.5 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumbnail || '/favicon.png'} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.brand}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${p.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.stock === 0 ? 'Out' : `${p.stock} left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
            <p className="text-xs text-gray-400">Latest purchases across the store</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-sg-pink hover:underline">All orders →</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-400 uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No orders yet.</td>
                </tr>
              ) : (
                recentOrders.map((o: any) => (
                  <tr key={o._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold">
                      <Link href={`/admin/orders?search=${o.orderNumber}`} className="text-gray-900 hover:text-sg-pink">#{o.orderNumber}</Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{o.customer?.fullName}</td>
                    <td className="px-4 py-3 text-gray-500">{o.customer?.city}</td>
                    <td className="px-4 py-3 uppercase font-semibold text-gray-600">{o.paymentMethod || 'COD'}</td>
                    <td className="px-4 py-3 font-extrabold text-gray-900">{taka(o.grandTotal)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} type="order" /></td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {new Date(o.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/products?new=1', label: 'Add product', icon: <PackageIcon className="w-4 h-4" /> },
          { href: '/admin/orders?status=pending', label: `Pending orders (${statusDistribution.pending ?? 0})`, icon: <ShoppingCartIcon className="w-4 h-4" /> },
          { href: '/admin/activity', label: 'Store activity', icon: <GlobeIcon className="w-4 h-4" /> },
          { href: '/admin/audit-log', label: `Staff actions`, icon: <BarChartIcon className="w-4 h-4" /> },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-100 shadow-xs text-xs font-bold text-gray-700 hover:border-sg-pink/40 hover:text-sg-pink transition-colors"
          >
            {a.icon}
            <span>{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
