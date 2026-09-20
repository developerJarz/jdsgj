"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import StatusBadge from '@/components/admin/StatusBadge';
import { PERMISSION_GROUPS } from '@/lib/permissions';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'moderator',
    permissions: [] as string[],
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffRes, rolesRes] = await Promise.all([
        fetch('/api/admin/staff'),
        fetch('/api/admin/roles'),
      ]);
      const staffJson = await staffRes.json();
      const rolesJson = await rolesRes.json();
      if (staffJson.success) setStaff(staffJson.staff || []);
      if (rolesJson.success) setRoles(rolesJson.roles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'moderator',
      permissions: ['orders.view', 'products.view'],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (member: any) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      password: '',
      role: member.role || 'moderator',
      permissions: member.permissions || [],
      isActive: member.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const togglePermission = (perm: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      };
    });
  };

  const applyRoleTemplate = (roleSlug: string) => {
    const selected = roles.find((r) => r.slug === roleSlug);
    if (selected && selected.permissions) {
      setFormData((prev) => ({ ...prev, permissions: selected.permissions }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStaff ? `/api/admin/staff/${editingStaff._id}` : '/api/admin/staff';
      const method = editingStaff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadData();
      } else {
        alert(data.message || 'Staff operation failed');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff account?')) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Staff Member',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white font-black text-xs flex items-center justify-center">
            {row.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-xs">{row.name}</p>
            <p className="text-[11px] text-gray-500">{row.email || 'No email'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Mobile Phone',
      accessor: 'phone',
      render: (row) => <span className="font-mono text-xs text-gray-700">{row.phone}</span>,
    },
    {
      header: 'Access Role',
      accessor: 'role',
      render: (row) => <StatusBadge status={row.role} type="role" />,
    },
    {
      header: 'Granted Permissions',
      render: (row) => (
        <span className="text-xs font-semibold text-gray-600">
          {row.role === 'admin' || row.role === 'superadmin'
            ? 'Full Access (*)'
            : `${row.permissions?.length || 0} permissions`}
        </span>
      ),
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
          {row.isActive !== false ? 'Active' : 'Suspended'}
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
          {row.role !== 'superadmin' && (
            <button
              onClick={() => handleDelete(row._id)}
              className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Staff & Moderators</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage administrative personnel, assign operator roles and custom granular permissions
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:from-[#d10057] hover:to-[#e65a78] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
        >
          <span>+ Add Staff Member</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={staff}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search staff members..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Staff Member' : 'Invite Staff Member'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                disabled={!!editingStaff}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {editingStaff ? 'Change Password (optional)' : 'Password *'}
              </label>
              <input
                type="password"
                required={!editingStaff}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingStaff ? 'Leave blank to keep current' : 'Min 6 characters'}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Role Hierarchy</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white font-semibold"
              >
                <option value="moderator">Moderator (Restricted Access)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Apply Role Template</label>
              <select
                onChange={(e) => applyRoleTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a template to auto-populate...
                </option>
                {roles.map((r) => (
                  <option key={r._id} value={r.slug}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.role === 'moderator' && (
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                Granular Permissions ({formData.permissions.length} selected)
              </label>
              <div className="max-h-60 overflow-y-auto space-y-4 border border-gray-200 p-3 rounded-xl bg-gray-50/50">
                {PERMISSION_GROUPS.map((grp) => (
                  <div key={grp.name} className="space-y-1.5">
                    <p className="font-black text-[11px] uppercase tracking-wider text-gray-600">
                      {grp.name}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {grp.permissions.map((p) => {
                        const checked = formData.permissions.includes(p.key);
                        return (
                          <label
                            key={p.key}
                            className={`flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                              checked
                                ? 'bg-white border-sg-pink/50 shadow-xs'
                                : 'bg-transparent border-gray-200/80 hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(p.key)}
                              className="mt-0.5 accent-sg-pink"
                            />
                            <div>
                              <p className="font-bold text-gray-800 text-[11px] leading-tight">
                                {p.label}
                              </p>
                              <p className="text-[10px] text-gray-400">{p.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 mb-1">Account Status</label>
            <select
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none bg-white"
            >
              <option value="true">Active</option>
              <option value="false">Suspended</option>
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
              {editingStaff ? 'Update Staff Member' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
