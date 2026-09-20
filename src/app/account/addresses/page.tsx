"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/components/admin/Modal';

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [formData, setFormData] = useState({
    label: 'Home',
    city: 'Dhaka',
    area: '',
    address: '',
    phone: '',
    isDefault: false,
  });

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/account/addresses');
      const json = await res.json();
      if (json.success) {
        setAddresses(json.addresses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openCreate = () => {
    setEditingAddress(null);
    setFormData({
      label: 'Home',
      city: 'Dhaka',
      area: '',
      address: '',
      phone: '',
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const openEdit = (addr: any) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label || 'Home',
      city: addr.city || 'Dhaka',
      area: addr.area || '',
      address: addr.address || '',
      phone: addr.phone || '',
      isDefault: !!addr.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/account/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingAddress && { id: editingAddress._id }),
          ...formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadAddresses();
      } else {
        alert(data.message || 'Failed to save address');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      const res = await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadAddresses();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Saved Delivery Addresses</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage home, office, and secondary courier drop-off destinations
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:from-[#d10057] hover:to-[#e65a78] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
        >
          <span>+ Add Address</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
          Loading addresses...
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
          No addresses saved yet. Click "+ Add Address" above to save your shipping location!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`p-5 rounded-2xl bg-white border transition-all relative flex flex-col justify-between ${
                addr.isDefault ? 'border-sg-pink shadow-xs ring-1 ring-sg-pink/20' : 'border-gray-100 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>📍</span>
                    <span>{addr.label || 'Home'}</span>
                  </span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-50 text-sg-pink text-[10px] font-bold">
                      Default Delivery
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700 font-medium">{addr.address}</p>
                <p className="text-xs text-gray-500">
                  {addr.area ? `${addr.area}, ` : ''}
                  {addr.city}
                </p>
                <p className="text-xs text-gray-500 mt-2 font-mono">📱 {addr.phone}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-4 text-xs">
                <button
                  onClick={() => openEdit(addr)}
                  className="px-3 py-1 font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="px-3 py-1 font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Label</label>
              <select
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white font-semibold"
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">City / Region *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Dhaka, Chittagong, Sylhet"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Area / Thana</label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="e.g. Dhanmondi, Gulshan, Uttara"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Street Address & Details *</label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="House, Road, Apartment or Landmark info..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Contact Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 017XXXXXXXX"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="accent-sg-pink"
            />
            <span className="font-bold text-gray-700">Set as my primary default delivery address</span>
          </label>

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
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
