"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processData, setProcessData] = useState({
    status: 'approved',
    refundAmount: 0,
    adminNotes: '',
  });

  const loadReturns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/returns?status=${statusFilter}`);
      const json = await res.json();
      if (json.success) {
        setReturns(json.returns || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, [statusFilter]);

  const openProcess = (ret: any) => {
    setSelectedReturn(ret);
    setProcessData({
      status: ret.status === 'pending' ? 'approved' : ret.status,
      refundAmount: ret.refundAmount || ret.order?.grandTotal || 0,
      adminNotes: ret.adminNotes || '',
    });
    setIsProcessModalOpen(true);
  };

  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;
    try {
      const res = await fetch('/api/admin/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReturn._id,
          ...processData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsProcessModalOpen(false);
        loadReturns();
      } else {
        alert(data.message || 'Processing failed');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Order & Customer',
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900">#{row.orderNumber}</p>
          <p className="text-xs text-gray-600 font-medium">{row.userName || row.user?.name}</p>
          <p className="text-[11px] text-gray-400">{row.userPhone || row.user?.phone}</p>
        </div>
      ),
    },
    {
      header: 'Reason & Details',
      render: (row) => (
        <div className="max-w-xs">
          <span className="font-bold text-gray-800 text-xs">{row.reason}</span>
          {row.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Items to Return',
      render: (row) => (
        <div className="text-xs text-gray-700">
          {row.items?.map((item: any, i: number) => (
            <p key={i}>
              • {item.name} <span className="text-gray-400">(x{item.quantity})</span>
            </p>
          )) || 'All order items'}
        </div>
      ),
    },
    {
      header: 'Refund Value',
      render: (row) => (
        <span className="font-black text-xs text-gray-900">
          ৳{row.refundAmount || row.order?.grandTotal || 0}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} type="return" />,
    },
    {
      header: 'Date',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (row) => (
        <button
          onClick={() => openProcess(row)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          Process
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Returns & Refunds</h1>
          <p className="text-xs text-gray-500 mt-1">
            Customer return requests, inspection pipeline, and refund processing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'pending', 'approved', 'rejected', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={returns}
        loading={loading}
        searchPlaceholder="Search return requests..."
      />

      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title={`Process Return for #${selectedReturn?.orderNumber}`}
      >
        <form onSubmit={handleProcessSubmit} className="space-y-4 text-xs">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
            <p className="text-gray-700">
              <strong className="text-gray-900">Customer:</strong> {selectedReturn?.userName} (
              {selectedReturn?.userPhone})
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-900">Reason:</strong> {selectedReturn?.reason}
            </p>
            {selectedReturn?.description && (
              <p className="text-gray-500 italic">"{selectedReturn.description}"</p>
            )}
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Decision / Status *</label>
            <select
              value={processData.status}
              onChange={(e) => setProcessData({ ...processData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white font-semibold"
            >
              <option value="pending">Pending Review</option>
              <option value="approved">Approve Return (Awaiting Goods)</option>
              <option value="completed">Completed & Refunded</option>
              <option value="rejected">Reject Request</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Refund Amount (৳)</label>
            <input
              type="number"
              value={processData.refundAmount}
              onChange={(e) =>
                setProcessData({ ...processData, refundAmount: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Resolution Notes (Internal)</label>
            <textarea
              rows={3}
              value={processData.adminNotes}
              onChange={(e) => setProcessData({ ...processData, adminNotes: e.target.value })}
              placeholder="Record return inspection details, courier tracking, or refund gateway reference..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsProcessModalOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] text-white font-bold rounded-xl shadow-sm hover:brightness-105"
            >
              Update Return Status
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
