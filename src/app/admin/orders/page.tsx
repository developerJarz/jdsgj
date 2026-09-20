"use client";

import React, { useState, useEffect, useMemo } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import { 
  CheckIcon, 
  CloseIcon, 
  ShoppingBagIcon, 
  PhoneIcon, 
  ShieldCheckIcon,
  SearchIcon,
  ArrowRightIcon
} from '@/components/common/Icons';

const ALL_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
];

const STAGE_STEPS = [
  { key: 'pending', label: 'Pending', icon: '⏳', desc: 'Awaiting review' },
  { key: 'confirmed', label: 'Confirmed', icon: '✓', desc: 'Order approved' },
  { key: 'processing', label: 'Processing', icon: '⚙', desc: 'Items being picked' },
  { key: 'packed', label: 'Packed', icon: '📦', desc: 'Package ready' },
  { key: 'shipped', label: 'Shipped', icon: '🚚', desc: 'Handed to courier' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵', desc: 'Rider on the way' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Received by customer' },
];

const COURIER_PRESETS = [
  { name: 'Steadfast Courier', prefix: 'STF-' },
  { name: 'Pathao Courier', prefix: 'PTH-' },
  { name: 'RedX Delivery', prefix: 'REDX-' },
  { name: 'Paperfly', prefix: 'PFLY-' },
  { name: 'Sundarban Courier', prefix: 'SC-' },
  { name: 'eCourier', prefix: 'ECR-' },
  { name: 'In-House Rider', prefix: 'RIDER-' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('Steadfast Courier');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter === 'all' ? '/api/orders' : `/api/orders?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  // Sync selected order state when opened
  useEffect(() => {
    if (selectedOrder) {
      setTrackingNumber(selectedOrder.trackingNumber || '');
      setAdminNotes(selectedOrder.adminNotes || '');
    }
  }, [selectedOrder]);

  const handleStatusChange = async (orderId: string, newStatus: string, note?: string) => {
    setIsUpdating(true);
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId || o.orderNumber === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.orderNumber === orderId)) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus, 
          trackingNumber: trackingNumber || undefined,
          adminNotes: adminNotes || undefined,
          note: note || `Status advanced to ${newStatus.toUpperCase().replace(/_/g, ' ')}`
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        showToast(`Order status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
      } else {
        showToast(resData.message || 'Status updated');
      }
    } catch (e: any) {
      console.error(e);
      showToast('Status updated');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickConfirm = async (order: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await handleStatusChange(order._id || order.orderNumber, 'confirmed', 'Order confirmed by Admin');
  };

  const handleAdvanceNextStage = async (order: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentIndex = STAGE_STEPS.findIndex(s => s.key === order.status);
    if (currentIndex >= 0 && currentIndex < STAGE_STEPS.length - 1) {
      const nextStage = STAGE_STEPS[currentIndex + 1].key;
      await handleStatusChange(order._id || order.orderNumber, nextStage);
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const orderId = selectedOrder._id || selectedOrder.orderNumber;
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          trackingNumber, 
          adminNotes,
          paymentStatus: selectedOrder.paymentStatus 
        }),
      });
      setSelectedOrder((prev: any) => ({ ...prev, trackingNumber, adminNotes }));
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, trackingNumber, adminNotes } : o))
      );
      showToast('Order details & logistics saved successfully!');
    } catch (e) {
      showToast('Failed to update details');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkConfirm = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsUpdating(true);
    try {
      for (const id of selectedOrderIds) {
        await fetch(`/api/orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'confirmed', note: 'Bulk confirmed by Admin' }),
        });
      }
      setOrders(prev => prev.map(o => selectedOrderIds.includes(o._id) ? { ...o, status: 'confirmed' } : o));
      setSelectedOrderIds([]);
      showToast(`Bulk confirmed ${selectedOrderIds.length} orders successfully!`);
    } catch {
      showToast('Completed bulk action');
    } finally {
      setIsUpdating(false);
    }
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    ALL_STATUSES.forEach(st => {
      map[st] = orders.filter(o => o.status === st).length;
    });
    return map;
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter(
      (o) =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.phone?.includes(search) ||
        o.customer?.city?.toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search]);

  const getNextStageLabel = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Confirm Order', color: 'bg-emerald-600 hover:bg-emerald-700 text-white', icon: '✓' };
      case 'confirmed': return { label: 'Start Processing', color: 'bg-blue-600 hover:bg-blue-700 text-white', icon: '⚙' };
      case 'processing': return { label: 'Mark as Packed', color: 'bg-indigo-600 hover:bg-indigo-700 text-white', icon: '📦' };
      case 'packed': return { label: 'Ship with Courier', color: 'bg-purple-600 hover:bg-purple-700 text-white', icon: '🚚' };
      case 'shipped': return { label: 'Out for Delivery', color: 'bg-amber-600 hover:bg-amber-700 text-white', icon: '🛵' };
      case 'out_for_delivery': return { label: 'Mark Delivered', color: 'bg-emerald-700 hover:bg-emerald-800 text-white', icon: '🎉' };
      default: return null;
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 border border-gray-700">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px]">✓</div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Order Management & Confirmation</span>
            <span className="text-xs bg-sg-pink/10 text-sg-pink font-bold px-2.5 py-0.5 rounded-full">
              Live Pipeline
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time multi-stage order confirmation, courier tracking assignments, and inventory sync
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            disabled={isLoading}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>↻ Refresh</span>
          </button>

          {selectedOrderIds.length > 0 && (
            <button
              onClick={handleBulkConfirm}
              disabled={isUpdating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Confirm Selected ({selectedOrderIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-gray-800 border-gray-100 hover:border-gray-200'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">All Orders</span>
          <span className="text-xl font-black block mt-0.5">{counts.all || 0}</span>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-amber-50/50 text-amber-900 border-amber-100 hover:bg-amber-50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">⏳ Pending Confirmation</span>
          <span className="text-xl font-black block mt-0.5">{counts.pending || 0}</span>
        </div>

        <div
          onClick={() => setStatusFilter('confirmed')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'confirmed'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-blue-50/50 text-blue-900 border-blue-100 hover:bg-blue-50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">✓ Confirmed</span>
          <span className="text-xl font-black block mt-0.5">{counts.confirmed || 0}</span>
        </div>

        <div
          onClick={() => setStatusFilter('processing')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'processing'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-indigo-50/50 text-indigo-900 border-indigo-100 hover:bg-indigo-50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">⚙ Processing</span>
          <span className="text-xl font-black block mt-0.5">{counts.processing || 0}</span>
        </div>

        <div
          onClick={() => setStatusFilter('shipped')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'shipped'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-purple-50/50 text-purple-900 border-purple-100 hover:bg-purple-50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">🚚 Shipped</span>
          <span className="text-xl font-black block mt-0.5">{counts.shipped || 0}</span>
        </div>

        <div
          onClick={() => setStatusFilter('delivered')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'delivered'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-emerald-50/50 text-emerald-900 border-emerald-100 hover:bg-emerald-50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">🎉 Delivered</span>
          <span className="text-xl font-black block mt-0.5">{counts.delivered || 0}</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-wrap gap-1.5 border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({counts.all || 0})
          </button>
          {ALL_STATUSES.map((tab) => {
            const count = counts[tab] || 0;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-full capitalize transition-all flex items-center gap-1.5 ${
                  statusFilter === tab
                    ? 'bg-sg-pink text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.replace(/_/g, ' ')}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    statusFilter === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search by order #, customer name, phone, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap self-end sm:self-center">
            Showing <strong>{filtered.length}</strong> matching orders
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400">Loading order records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <div className="text-3xl">📦</div>
            <p className="text-xs font-bold text-gray-700">No orders found for this filter</p>
            <p className="text-[11px] text-gray-400">Try changing the status tab or search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/75 text-gray-400 font-bold uppercase border-b border-gray-100">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.length === filtered.length && filtered.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedOrderIds(filtered.map(o => o._id));
                        else setSelectedOrderIds([]);
                      }}
                      className="rounded accent-sg-pink"
                    />
                  </th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount & Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Stage & Status</th>
                  <th className="py-3 px-4">One-Click Action</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => {
                  const nextAction = getNextStageLabel(order.status);
                  const isPending = order.status === 'pending';

                  return (
                    <tr 
                      key={order._id || order.orderNumber} 
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isPending ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order._id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order._id]);
                            else setSelectedOrderIds(selectedOrderIds.filter(id => id !== order._id));
                          }}
                          className="rounded accent-sg-pink"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block font-mono">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                        {order.trackingNumber && (
                          <span className="text-[10px] text-blue-600 font-mono block mt-0.5 truncate max-w-[120px]">
                            🔍 {order.trackingNumber}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-800 block">{order.customer?.fullName}</span>
                        <span className="text-gray-400 text-[11px] block">
                          📱 {order.customer?.phone}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[150px] block">
                          📍 {order.customer?.city || 'Dhaka'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-black text-sg-pink block">৳{order.grandTotal}</span>
                        <span className="text-gray-400 text-[10px]">
                          {order.items?.length || 1} item{order.items?.length > 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] inline-block ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {order.paymentMethod || 'COD'} ({order.paymentStatus || 'pending'})
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={order.status} type="order" />
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id || order.orderNumber, e.target.value)}
                          className="text-[11px] font-semibold text-gray-600 rounded-lg px-2 py-1 border border-gray-200 mt-1 bg-white cursor-pointer hover:border-gray-300 focus:outline-none"
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st.replace(/_/g, ' ').toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={(e) => handleQuickConfirm(order, e)}
                            disabled={isUpdating}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95 animate-pulse"
                          >
                            <CheckIcon className="w-3.5 h-3.5" />
                            <span>Confirm Order</span>
                          </button>
                        ) : nextAction ? (
                          <button
                            type="button"
                            onClick={(e) => handleAdvanceNextStage(order, e)}
                            disabled={isUpdating}
                            className={`px-3 py-1.5 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 active:scale-95 ${nextAction.color}`}
                          >
                            <span>{nextAction.icon}</span>
                            <span>{nextAction.label}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No next stage</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          Details & Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Order Detail & Confirmation Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-gray-900">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <StatusBadge status={selectedOrder.status} type="order" />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={printInvoice}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                >
                  🖨 Print Invoice
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Visual Stage Stepper */}
            <div className="p-4 bg-gray-50/75 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-3">
                Fulfillment Pipeline Stage
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                {STAGE_STEPS.map((step, idx) => {
                  const currentIdx = STAGE_STEPS.findIndex(s => s.key === selectedOrder.status);
                  const isCurrent = step.key === selectedOrder.status;
                  const isPassed = currentIdx > idx;

                  return (
                    <button
                      key={step.key}
                      onClick={() => handleStatusChange(selectedOrder._id || selectedOrder.orderNumber, step.key)}
                      className={`p-2 rounded-xl text-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-sg-pink text-white shadow-md scale-102'
                          : isPassed
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-sm mb-0.5">{step.icon}</span>
                      <span className="text-[10px] block truncate">{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="p-4 bg-gray-50 rounded-2xl space-y-2 text-xs border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Customer & Delivery Destination
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedOrder.customer?.phone}`}
                    className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-200"
                  >
                    <PhoneIcon className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${selectedOrder.customer?.fullName}\n${selectedOrder.customer?.phone}\n${selectedOrder.customer?.address}, ${selectedOrder.customer?.city}`);
                      showToast('Address copied to clipboard!');
                    }}
                    className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold hover:bg-gray-300"
                  >
                    Copy Address
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-gray-700">
                <p>👤 <strong>Name:</strong> {selectedOrder.customer?.fullName}</p>
                <p>📱 <strong>Mobile:</strong> {selectedOrder.customer?.phone}</p>
                <p>📍 <strong>City:</strong> {selectedOrder.customer?.city}</p>
                <p>📧 <strong>Email:</strong> {selectedOrder.customer?.email || 'N/A'}</p>
                <p className="sm:col-span-2">🏠 <strong>Full Address:</strong> {selectedOrder.customer?.address}</p>
                {selectedOrder.customer?.notes && (
                  <p className="sm:col-span-2 bg-amber-50 p-2 rounded-lg text-amber-900 text-[11px] border border-amber-100">
                    📝 <strong>Customer Notes:</strong> {selectedOrder.customer?.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Courier & Logistics Tracking */}
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-900 uppercase text-[10px] tracking-wider block">
                  Courier Logistics & Tracking ID
                </span>
                <span className="text-[11px] text-blue-700 font-semibold">
                  Select Partner Preset
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={selectedCourier}
                  onChange={(e) => {
                    setSelectedCourier(e.target.value);
                    const preset = COURIER_PRESETS.find(p => p.name === e.target.value);
                    if (preset && !trackingNumber) {
                      setTrackingNumber(`${preset.prefix}${selectedOrder.orderNumber.replace('SG-', '')}`);
                    }
                  }}
                  className="px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs outline-none font-semibold text-gray-800"
                >
                  {COURIER_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Tracking # (e.g. STF-94821)"
                  className="sm:col-span-2 px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs outline-none font-mono"
                />
              </div>

              {/* Admin Internal Note */}
              <div>
                <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                  Internal Staff Notes (Private)
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Verified customer on phone, priority packaging requested..."
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveDetails}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  Save Tracking & Notes
                </button>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2">
                Ordered Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 flex justify-between items-center text-xs hover:bg-gray-50/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block line-clamp-1">{item.name}</span>
                        <span className="text-[11px] text-gray-400">
                          Qty: {item.quantity || item.qty || 1} × ৳{item.price}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-sg-pink text-xs">
                      ৳{item.price * (item.quantity || item.qty || 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-gray-50 rounded-2xl text-xs space-y-1.5 border border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">৳{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee:</span>
                <span>৳{selectedOrder.shippingFee}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-৳{selectedOrder.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-gray-900 pt-2 border-t border-gray-200">
                <span>Grand Total:</span>
                <span className="text-sg-pink text-base">৳{selectedOrder.grandTotal}</span>
              </div>
            </div>

            {/* Status Timeline */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="border border-gray-100 rounded-2xl p-3 text-xs space-y-2">
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                  Audit & Status Timeline
                </h4>
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {selectedOrder.statusHistory.map((h: any, i: number) => (
                    <div key={i} className="text-[11px] flex justify-between items-center text-gray-500 bg-gray-50 p-2 rounded-xl">
                      <div>
                        <span className="font-bold text-gray-800 capitalize mr-2">
                          {h.status?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-gray-400">by {h.changedByName || 'Staff'}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{new Date(h.changedAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Change Stage:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder._id || selectedOrder.orderNumber, e.target.value)}
                  className="w-full sm:w-auto text-xs font-bold rounded-xl px-3 py-2 border border-gray-300 focus:outline-none bg-white cursor-pointer"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrder.status === 'pending' ? (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedOrder._id || selectedOrder.orderNumber, 'confirmed', 'Confirmed via modal')}
                  disabled={isUpdating}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Confirm Order Now</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
