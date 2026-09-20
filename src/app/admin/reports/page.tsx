"use client";

import React, { useState, useEffect } from 'react';

export default function AdminReportsPage() {
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) setStatsData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-gray-400">Compiling financial and sales reports...</div>;
  }

  const stats = statsData?.stats || {};
  const timeline = statsData?.salesTimeline || [];
  const statusCounts = statsData?.statusCounts || {};

  const totalDelivered = statusCounts.delivered || 0;
  const totalOrders = stats.totalOrders || 1;
  const fulfillmentRate = Math.round((totalDelivered / totalOrders) * 100);

  const exportCSV = () => {
    const headers = 'Date,Revenue (BDT)\n';
    const rows = timeline.map((t: any) => `${t.date},${t.revenue}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shajgoj_sales_report_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Sales Reports & Financial Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Aggregated revenue performance and order conversion metrics</p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-full transition-colors flex items-center gap-2"
        >
          <span>📥 Export Report (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Gross Revenue</span>
          <p className="text-2xl font-black text-gray-900 mt-1">৳{stats.totalSales?.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-medium">All non-cancelled orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Average Order Value</span>
          <p className="text-2xl font-black text-gray-900 mt-1">৳{stats.averageOrderValue}</p>
          <span className="text-[11px] text-blue-600 font-medium">Per checkout cart</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Fulfillment Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{fulfillmentRate}%</p>
          <span className="text-[11px] text-gray-400">{totalDelivered} delivered orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Active Shoppers</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalCustomers}</p>
          <span className="text-[11px] text-purple-600 font-medium">Registered customer accounts</span>
        </div>
      </div>

      {/* Revenue by Day Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
            Recent Days Performance
          </h2>
        </div>
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Reporting Period</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {timeline.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-bold text-gray-900">{item.date}</td>
                  <td className="py-3 px-4 font-black text-sg-pink">৳{item.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Settled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
