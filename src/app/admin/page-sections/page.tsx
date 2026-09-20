"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';

export default function AdminPageSectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    section_type: 'product_slider',
    order: 0,
    isActive: true,
  });

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/page-sections?page=home');
      const json = await res.json();
      if (json.success) {
        setSections(json.sections || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const openCreate = () => {
    setEditingSection(null);
    setFormData({
      title: '',
      subtitle: '',
      section_type: 'product_slider',
      order: sections.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (sec: any) => {
    setEditingSection(sec);
    setFormData({
      title: sec.title,
      subtitle: sec.subtitle || '',
      section_type: sec.section_type,
      order: sec.order || 0,
      isActive: sec.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // re-assign orders
    const updated = newSections.map((sec, idx) => ({
      _id: sec._id,
      order: idx + 1,
    }));

    setSections(newSections);

    try {
      await fetch('/api/admin/page-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: true, sections: updated }),
      });
    } catch (e) {
      loadSections();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/page-sections';
      const method = editingSection ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingSection && { id: editingSection._id }),
          ...formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadSections();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      const res = await fetch(`/api/admin/page-sections?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadSections();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Position',
      accessor: 'order',
      render: (row, rowIdx = 0) => (
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-lg bg-gray-100 font-black text-xs text-gray-700 flex items-center justify-center">
            {row.order}
          </span>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => moveOrder(sections.indexOf(row), 'up')}
              className="text-[9px] px-1 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 leading-none"
            >
              ▲
            </button>
            <button
              onClick={() => moveOrder(sections.indexOf(row), 'down')}
              className="text-[9px] px-1 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 leading-none"
            >
              ▼
            </button>
          </div>
        </div>
      ),
    },
    {
      header: 'Section Title',
      accessor: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900 text-xs">{row.title}</p>
          {row.subtitle && <p className="text-[11px] text-gray-400">{row.subtitle}</p>}
        </div>
      ),
    },
    {
      header: 'Layout Type',
      accessor: 'section_type',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          {row.section_type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.isActive !== false ? 'Visible' : 'Hidden'}
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Homepage Section Layout</h1>
          <p className="text-xs text-gray-500 mt-1">
            Reorder and customize storefront blocks: sliders, category circles, and flash sales
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:from-[#d10057] hover:to-[#e65a78] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
        >
          <span>+ Add Layout Section</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={sections}
        loading={loading}
        searchKey="title"
        searchPlaceholder="Search sections..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSection ? 'Edit Section' : 'Create Section'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Section Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Best Selling Skincare Deals"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Handpicked premium recommendations for glowing skin"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Section Type</label>
              <select
                value={formData.section_type}
                onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white"
              >
                <option value="banner_carousel">Banner Slider (Hero)</option>
                <option value="categories_grid">Categories Grid</option>
                <option value="product_slider">Product Carousel Slider</option>
                <option value="flash_sale">Flash Sale Countdown</option>
                <option value="two_column_banner">Twin Promotional Banners</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Visibility</label>
            <select
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white"
            >
              <option value="true">Visible on Homepage</option>
              <option value="false">Hidden / Disabled</option>
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
              {editingSection ? 'Update Section' : 'Add Section'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
