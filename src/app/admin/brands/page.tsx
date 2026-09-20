"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: '',
    order: 0,
    isActive: true,
  });

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/brands');
      const json = await res.json();
      if (json.success) {
        setBrands(json.brands || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openCreate = () => {
    setEditingBrand(null);
    setFormData({ name: '', logo: '', description: '', order: brands.length + 1, isActive: true });
    setIsModalOpen(true);
  };

  const openEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo: brand.logo || '',
      description: brand.description || '',
      order: brand.order || 0,
      isActive: brand.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBrand ? `/api/admin/brands/${editingBrand._id}` : '/api/admin/brands';
      const method = editingBrand ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadBrands();
      } else {
        alert(data.message || 'Failed to save brand');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadBrands();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Brand',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
            {row.logo ? (
              <img src={row.logo} alt={row.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs font-bold text-gray-400">{row.name[0]}</span>
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">{row.name}</p>
            <p className="text-[11px] text-gray-400 font-mono">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => (
        <p className="text-xs text-gray-500 max-w-xs truncate">{row.description || '—'}</p>
      ),
    },
    {
      header: 'Sort Order',
      accessor: 'order',
      sortable: true,
      render: (row) => <span className="font-semibold text-gray-700">#{row.order || 0}</span>,
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {row.isActive !== false ? 'Active' : 'Hidden'}
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Brand Directory</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage cosmetic and beauty brand entities and logos
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:from-[#d10057] hover:to-[#e65a78] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
        >
          <span>+ Add Brand</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={brands}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search brands..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Edit Brand' : 'Create New Brand'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Brand Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              placeholder="e.g. The Ordinary, COSRX, Cerave"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Logo URL</label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              placeholder="Brief summary of brand origin or heritage..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Display Sort Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
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
                <option value="true">Active & Visible</option>
                <option value="false">Hidden</option>
              </select>
            </div>
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
              {editingBrand ? 'Update Brand' : 'Save Brand'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
