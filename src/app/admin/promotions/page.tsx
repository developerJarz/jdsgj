"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'flash_sale',
    description: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    discount_type: 'percentage',
    discount_value: 20,
    badge_text: 'FLASHSALE',
    banner_image: '',
    isActive: true,
  });

  const loadPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promotions');
      const json = await res.json();
      if (json.success) {
        setPromotions(json.promotions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const openCreate = () => {
    setEditingPromo(null);
    setFormData({
      name: '',
      type: 'flash_sale',
      description: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      discount_type: 'percentage',
      discount_value: 20,
      badge_text: 'FLASHSALE',
      banner_image: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingPromo(p);
    setFormData({
      name: p.name,
      type: p.type || 'flash_sale',
      description: p.description || '',
      startDate: new Date(p.startDate).toISOString().slice(0, 10),
      endDate: new Date(p.endDate).toISOString().slice(0, 10),
      discount_type: p.discount_type || 'percentage',
      discount_value: p.discount_value || 0,
      badge_text: p.badge_text || '',
      banner_image: p.banner_image || '',
      isActive: p.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPromo ? `/api/admin/promotions/${editingPromo._id}` : '/api/admin/promotions';
      const method = editingPromo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadPromos();
      } else {
        alert(data.message || 'Failed to save campaign');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadPromos();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Campaign Name',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900 text-xs">{row.name}</p>
          {row.badge_text && (
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700">
              {row.badge_text}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
          {row.type?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Discount Deal',
      render: (row) => (
        <span className="font-black text-xs text-sg-pink">
          {row.discount_type === 'percentage'
            ? `${row.discount_value}% OFF`
            : `৳${row.discount_value} OFF`}
        </span>
      ),
    },
    {
      header: 'Schedule',
      render: (row) => {
        const isLive =
          new Date(row.startDate) <= new Date() && new Date(row.endDate) >= new Date();
        return (
          <div className="text-xs">
            <p className="text-gray-700">
              {new Date(row.startDate).toLocaleDateString()} — {new Date(row.endDate).toLocaleDateString()}
            </p>
            {isLive ? (
              <span className="text-[10px] font-bold text-emerald-600 animate-pulse">● Live Now</span>
            ) : (
              <span className="text-[10px] text-gray-400">Scheduled</span>
            )}
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Promotions & Flash Sales</h1>
          <p className="text-xs text-gray-500 mt-1">
            Time-bound flash sales, seasonal events, and bundle deals
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:from-[#d10057] hover:to-[#e65a78] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
        >
          <span>+ Create Campaign</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={promotions}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search campaigns..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPromo ? 'Edit Campaign' : 'Create Flash Sale / Promotion'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Campaign Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Eid Mega Flash Sale, Winter Skincare Carnival"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Campaign Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white"
              >
                <option value="flash_sale">Flash Sale</option>
                <option value="campaign">Seasonal Campaign</option>
                <option value="discount_deal">Daily Deal</option>
                <option value="bundle">Bundle & Save</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Badge Text</label>
              <input
                type="text"
                value={formData.badge_text}
                onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                placeholder="e.g. 50% OFF, LIMITED"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block font-bold text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Discount Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Discount Value</label>
              <input
                type="number"
                required
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Banner Image URL</label>
            <input
              type="url"
              value={formData.banner_image}
              onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
              placeholder="https://..."
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
              <option value="true">Active & Live</option>
              <option value="false">Inactive / Draft</option>
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
              {editingPromo ? 'Update Campaign' : 'Publish Campaign'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
