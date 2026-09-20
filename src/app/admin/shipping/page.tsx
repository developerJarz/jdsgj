"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';

export default function AdminShippingPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    areas: '',
    shippingFee: 60,
    freeShippingThreshold: 1500,
    estimatedDays: '1-2 Days',
    isActive: true,
  });

  const loadZones = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shipping-zones');
      const json = await res.json();
      if (json.success) {
        setZones(json.zones || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const openCreate = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      code: '',
      areas: '',
      shippingFee: 60,
      freeShippingThreshold: 1500,
      estimatedDays: '2-3 Days',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (z: any) => {
    setEditingZone(z);
    setFormData({
      name: z.name,
      code: z.code,
      areas: Array.isArray(z.areas) ? z.areas.join(', ') : z.areas,
      shippingFee: z.shippingFee,
      freeShippingThreshold: z.freeShippingThreshold || 0,
      estimatedDays: z.estimatedDays || '2-4 Days',
      isActive: z.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/shipping-zones';
      const method = editingZone ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingZone && { id: editingZone._id }),
          ...formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadZones();
      } else {
        alert(data.message || 'Failed to save zone');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this delivery zone?')) return;
    try {
      const res = await fetch(`/api/admin/shipping-zones?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadZones();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Delivery Zone',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900 text-xs">{row.name}</p>
          <span className="font-mono text-[10px] text-gray-400">{row.code}</span>
        </div>
      ),
    },
    {
      header: 'Covered Areas',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-sm">
          {Array.isArray(row.areas) ? (
            row.areas.slice(0, 5).map((area: string, i: number) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px]"
              >
                {area}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500">{row.areas}</span>
          )}
          {row.areas?.length > 5 && (
            <span className="text-[10px] text-gray-400">+{row.areas.length - 5} more</span>
          )}
        </div>
      ),
    },
    {
      header: 'Shipping Fee',
      accessor: 'shippingFee',
      sortable: true,
      render: (row) => <span className="font-black text-xs text-gray-900">৳{row.shippingFee}</span>,
    },
    {
      header: 'Free Shipping Above',
      render: (row) => (
        <span className="text-xs font-semibold text-emerald-600">
          {row.freeShippingThreshold ? `৳${row.freeShippingThreshold}` : 'None'}
        </span>
      ),
    },
    {
      header: 'Estimated Transit',
      accessor: 'estimatedDays',
      render: (row) => <span className="text-xs text-gray-600">{row.estimatedDays}</span>,
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Shipping Zones & Delivery</h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure courier delivery fees, free delivery thresholds, and transit times
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:from-[#d10057] hover:to-[#e65a78] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
        >
          <span>+ Add Shipping Zone</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={zones}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search delivery zone..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingZone ? 'Edit Shipping Zone' : 'New Shipping Zone'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Zone Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Inside Dhaka Metropolitan"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Zone Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. DHAKA_INSIDE"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl uppercase font-mono font-bold focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Covered Districts / Areas (comma-separated) *
            </label>
            <textarea
              rows={3}
              required
              value={formData.areas}
              onChange={(e) => setFormData({ ...formData, areas: e.target.value })}
              placeholder="e.g. Dhanmondi, Gulshan, Banani, Uttara, Mirpur"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Shipping Fee (৳) *</label>
              <input
                type="number"
                required
                value={formData.shippingFee}
                onChange={(e) =>
                  setFormData({ ...formData, shippingFee: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Free Shipping Above (৳)</label>
              <input
                type="number"
                value={formData.freeShippingThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    freeShippingThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Estimated Days</label>
              <input
                type="text"
                value={formData.estimatedDays}
                onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                placeholder="1-2 Days"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Status</label>
            <select
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white"
            >
              <option value="true">Active</option>
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
              {editingZone ? 'Update Zone' : 'Create Zone'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
