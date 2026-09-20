"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 10,
    minOrderAmount: 0,
    maxDiscount: '',
    usageLimit: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    description: '',
    isActive: true,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const json = await res.json();
      if (json.success) {
        setCoupons(json.coupons || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: 10,
      minOrderAmount: 0,
      maxDiscount: '',
      usageLimit: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      type: c.type || 'percentage',
      value: c.value,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscount: c.maxDiscount || '',
      usageLimit: c.usageLimit || '',
      startDate: new Date(c.startDate).toISOString().slice(0, 10),
      endDate: new Date(c.endDate).toISOString().slice(0, 10),
      description: c.description || '',
      isActive: c.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCoupon ? `/api/admin/coupons/${editingCoupon._id}` : '/api/admin/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.trim().toUpperCase(),
          maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadCoupons();
      } else {
        alert(data.message || 'Failed to save coupon');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadCoupons();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Code',
      accessor: 'code',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-black text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-white tracking-wider font-mono">
            {row.code}
          </span>
          {row.description && <p className="text-[11px] text-gray-400 mt-1">{row.description}</p>}
        </div>
      ),
    },
    {
      header: 'Discount',
      render: (row) => (
        <div>
          <span className="font-black text-sm text-sg-pink">
            {row.type === 'percentage' ? `${row.value}% OFF` : `৳${row.value} FLAT`}
          </span>
          {row.maxDiscount && (
            <p className="text-[10px] text-gray-400">Capped at ৳{row.maxDiscount}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Threshold',
      render: (row) => (
        <span className="text-xs text-gray-600 font-semibold">
          {row.minOrderAmount ? `Min order: ৳${row.minOrderAmount}` : 'No minimum'}
        </span>
      ),
    },
    {
      header: 'Usage',
      render: (row) => (
        <span className="text-xs text-gray-700">
          <strong className="text-gray-900">{row.usedCount || 0}</strong> /{' '}
          {row.usageLimit ? `${row.usageLimit} uses` : 'Unlimited'}
        </span>
      ),
    },
    {
      header: 'Validity',
      render: (row) => {
        const isExpired = new Date(row.endDate) < new Date();
        return (
          <div className="text-xs">
            <p className={isExpired ? 'text-rose-600 font-bold' : 'text-gray-700'}>
              Until {new Date(row.endDate).toLocaleDateString()}
            </p>
            {isExpired && <span className="text-[10px] text-rose-500 font-semibold">Expired</span>}
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.isActive ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEdit(row)}
            className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Edit
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Coupons & Vouchers</h1>
          <p className="text-xs text-gray-500 mt-1">
            Create percentage discounts, fixed vouchers, and minimum purchase rules
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:from-[#d10057] hover:to-[#e65a78] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
        >
          <span>+ New Coupon</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        loading={loading}
        searchKey="code"
        searchPlaceholder="Search coupon code..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. BEAUTY20"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl uppercase font-mono font-bold focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Value ({formData.type === 'percentage' ? '%' : '৳'}) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Min Order (৳)</label>
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) =>
                  setFormData({ ...formData, minOrderAmount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Max Discount (৳)</label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Usage Limit</label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="Unlimited"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Description / Tagline</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. 15% off on all makeup items"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Active Status</label>
            <select
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white"
            >
              <option value="true">Active & Usable</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] text-white font-bold rounded-xl shadow-sm hover:brightness-105"
            >
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
