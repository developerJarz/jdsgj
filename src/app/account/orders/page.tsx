"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === 'all'
          ? '/api/account/orders'
          : `/api/account/orders?status=${statusFilter}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setOrders(json.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Purchase History</h1>
          <p className="text-xs text-gray-500 mt-1">Track past orders, invoices, and active parcels</p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-sg-pink text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
            No orders found in this category.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 font-mono text-sm">
                    #{order.orderNumber}
                  </span>
                  <StatusBadge status={order.status} type="order" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Order Items Snapshot */}
              <div className="divide-y divide-gray-50">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="py-2 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                        />
                      )}
                      <div>
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-[11px] text-gray-400">
                          Qty: {item.qty || item.quantity} × ৳{item.price}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">
                      ৳{item.price * (item.qty || item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-500">Payment: </span>
                  <span className="font-bold uppercase text-gray-800">
                    {order.paymentMethod || 'COD'}
                  </span>
                  {order.trackingNumber && (
                    <span className="ml-3 text-blue-600 font-medium">
                      Tracking: {order.trackingNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-gray-500 mr-1.5">Total:</span>
                    <span className="font-black text-sm text-sg-pink">৳{order.grandTotal}</span>
                  </div>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-xs"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
