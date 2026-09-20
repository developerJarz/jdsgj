"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${statusFilter}`);
      const json = await res.json();
      if (json.success) {
        setReviews(json.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  const toggleApproval = async (id: string, current: boolean) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: !current }),
      });
      const data = await res.json();
      if (data.success) {
        loadReviews();
      }
    } catch (e) {
      alert('Action failed');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview) return;
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeReview._id, adminReply: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setIsReplyModalOpen(false);
        loadReviews();
      }
    } catch (e) {
      alert('Failed to post reply');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently remove this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadReviews();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Product',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.product?.thumbnail || '/assets/placeholder.png'}
            alt=""
            className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0"
          />
          <div className="min-w-0 max-w-xs">
            <p className="font-bold text-gray-900 truncate">{row.product?.name || 'Deleted Product'}</p>
            <p className="text-[11px] text-gray-400">ID: {row.product?._id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Customer & Rating',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1 text-amber-500 font-black text-xs mb-0.5">
            {'★'.repeat(row.rating)}
            {'☆'.repeat(5 - row.rating)}
            <span className="text-gray-600 ml-1">({row.rating}/5)</span>
          </div>
          <p className="font-semibold text-gray-800 text-xs">{row.user?.name || 'Verified Customer'}</p>
          <p className="text-[10px] text-gray-400">{row.user?.phone || row.user?.email}</p>
        </div>
      ),
    },
    {
      header: 'Feedback',
      render: (row) => (
        <div className="max-w-sm space-y-1">
          {row.title && <p className="font-bold text-gray-900 text-xs">{row.title}</p>}
          <p className="text-xs text-gray-600 line-clamp-2">{row.comment}</p>
          {row.adminReply && (
            <div className="text-[11px] bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-700 mt-1">
              <span className="font-bold text-sg-pink">Admin Reply: </span>
              {row.adminReply}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'isApproved',
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            row.isApproved
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.isApproved ? '✓ Published' : '⏳ Pending Approval'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => toggleApproval(row._id, row.isApproved)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
              row.isApproved
                ? 'text-amber-600 hover:bg-amber-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {row.isApproved ? 'Unpublish' : 'Approve'}
          </button>
          <button
            onClick={() => {
              setActiveReview(row);
              setReplyText(row.adminReply || '');
              setIsReplyModalOpen(true);
            }}
            className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Reply
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Reviews</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review moderation queue, star ratings, and administrator responses
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'pending', 'approved'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === f
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f === 'all' ? 'All Reviews' : f === 'pending' ? 'Pending Approval' : 'Published'}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        searchPlaceholder="Search customer reviews..."
      />

      <Modal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        title="Official Store Reply"
      >
        <form onSubmit={handleReplySubmit} className="space-y-4 text-xs">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <p className="font-bold text-gray-800 mb-1">{activeReview?.title || 'Review'}</p>
            <p className="text-gray-600 italic">"{activeReview?.comment}"</p>
            <p className="text-[11px] text-gray-400 mt-2">By: {activeReview?.user?.name}</p>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Your Response</label>
            <textarea
              rows={4}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Thank the customer or address their inquiry..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReplyModalOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] text-white font-bold rounded-xl shadow-sm hover:brightness-105"
            >
              Publish Reply
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
