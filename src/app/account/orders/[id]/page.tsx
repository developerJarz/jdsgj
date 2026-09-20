"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Return modal state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Damaged or defective item');
  const [returnDesc, setReturnDesc] = useState('');

  // Cancel state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/account/orders/${id}`);
      const json = await res.json();
      if (json.success) {
        setOrder(json.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      const res = await fetch(`/api/account/orders/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', reason: cancelReason }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCancelModalOpen(false);
        loadOrder();
      } else {
        alert(data.message || 'Could not cancel order');
      }
    } catch (e) {
      alert('Action failed');
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/account/orders/${id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason, description: returnDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setIsReturnModalOpen(false);
        alert('Return request submitted! Our support team will verify your claim.');
        loadOrder();
      } else {
        alert(data.message || 'Submission failed');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-xs text-gray-400">Loading order #{id}...</div>;
  }

  if (!order) {
    return (
      <div className="py-16 text-center text-xs text-gray-500">
        Order not found.{' '}
        <Link href="/account/orders" className="text-sg-pink font-bold underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const canReturn = order.status === 'delivered' && !order.refundStatus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 font-mono tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <StatusBadge status={order.status} type="order" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3.5 py-1.5 border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel Order
            </button>
          )}
          {canReturn && (
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Request Return
            </button>
          )}
        </div>
      </div>

      {/* Tracking Banner if active */}
      {order.trackingNumber && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-blue-900">Courier Tracking Number</p>
            <p className="font-mono text-blue-700 text-sm font-bold mt-0.5">{order.trackingNumber}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px]">
            In Transit
          </span>
        </div>
      )}

      {/* Delivery Address & Payment Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1 text-xs">
          <h3 className="font-bold text-gray-900 text-sm mb-2">Delivery Address</h3>
          <p className="font-bold text-gray-800">{order.customer?.fullName}</p>
          <p className="text-gray-600">{order.customer?.address}</p>
          <p className="text-gray-600">{order.customer?.city}</p>
          <p className="text-gray-500 pt-1">📱 Mobile: {order.customer?.phone}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2 text-xs">
          <h3 className="font-bold text-gray-900 text-sm mb-2">Payment Summary</h3>
          <div className="flex justify-between text-gray-600">
            <span>Payment Method:</span>
            <span className="font-bold uppercase text-gray-800">
              {order.paymentMethod || 'Cash On Delivery'}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Payment Status:</span>
            <StatusBadge status={order.paymentStatus || 'pending'} type="payment" />
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee:</span>
            <span>৳{order.shippingFee}</span>
          </div>
          <div className="flex justify-between font-black text-sm text-gray-900 pt-2 border-t border-gray-100">
            <span>Total Paid/Due:</span>
            <span className="text-sg-pink text-base">৳{order.grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Ordered Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Package Contents</h3>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                  />
                )}
                <div>
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <p className="text-gray-400 text-[11px]">
                    Qty: {item.qty || item.quantity} × ৳{item.price}
                  </p>
                </div>
              </div>
              <span className="font-black text-gray-900">
                ৳{item.price * (item.qty || item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status History Timeline */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Fulfillment Timeline</h3>
          <div className="space-y-3">
            {order.statusHistory.map((h: any, i: number) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-sg-pink mt-1 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800 capitalize">
                    {h.status?.replace(/_/g, ' ')}
                  </p>
                  {h.note && <p className="text-gray-500 mt-0.5">{h.note}</p>}
                </div>
                <span className="text-[11px] text-gray-400">
                  {new Date(h.changedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Request Product Return / Refund"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Reason for Return *</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white font-semibold"
            >
              <option value="Damaged or defective item">Damaged or defective item</option>
              <option value="Incorrect shade or product sent">Incorrect shade or product sent</option>
              <option value="Expired or near-expiry date">Expired or near-expiry date</option>
              <option value="Product not as described">Product not as described</option>
              <option value="Allergic reaction / other">Allergic reaction / other</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              required
              value={returnDesc}
              onChange={(e) => setReturnDesc(e.target.value)}
              placeholder="Describe the issue with batch numbers or packaging condition..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] text-white font-bold rounded-xl shadow-sm hover:brightness-105"
            >
              Submit Return Claim
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order Confirmation"
      >
        <div className="space-y-4 text-xs">
          <p className="text-gray-600">
            Are you sure you want to cancel Order <strong>#{order.orderNumber}</strong>?
            Any reserved inventory will be automatically restored.
          </p>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Reason for Cancellation</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white font-semibold"
            >
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found better price elsewhere">Found better price elsewhere</option>
              <option value="Change of delivery address">Change of delivery address</option>
              <option value="Delivery time too long">Delivery time too long</option>
              <option value="Other reasons">Other reasons</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50"
            >
              Keep Order
            </button>
            <button
              onClick={handleCancelOrder}
              className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl shadow-sm hover:bg-rose-700"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
