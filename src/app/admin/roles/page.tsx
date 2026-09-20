"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import { PERMISSION_GROUPS } from '@/lib/permissions';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    isActive: true,
  });

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      const json = await res.json();
      if (json.success) {
        setRoles(json.roles || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const openCreate = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: ['orders.view'],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (r: any) => {
    setEditingRole(r);
    setFormData({
      name: r.name,
      description: r.description || '',
      permissions: r.permissions || [],
      isActive: r.isActive !== false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingRole && { id: editingRole._id }),
          ...formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadRoles();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom role template?')) return;
    try {
      const res = await fetch(`/api/admin/roles?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadRoles();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Role Template',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900 text-xs">{row.name}</p>
          <p className="text-[11px] text-gray-400 font-mono">/{row.slug}</p>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => <p className="text-xs text-gray-600 max-w-sm">{row.description}</p>,
    },
    {
      header: 'Permission Count',
      accessor: 'permissions',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
          {row.permissions?.length || 0} permissions
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
          {row.isActive !== false ? 'Active' : 'Disabled'}
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Roles & Permissions</h1>
          <p className="text-xs text-gray-500 mt-1">
            Build reusable role presets with predefined permission bundles
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:from-[#d10057] hover:to-[#e65a78] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
        >
          <span>+ Create Role</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search roles..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Edit Role Preset' : 'New Role Preset'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Role Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Catalog Specialist, Dispatch Coordinator"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Responsibilities and purpose of this role..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">
              Permissions Bundle ({formData.permissions.length} selected)
            </label>
            <div className="max-h-64 overflow-y-auto space-y-4 border border-gray-200 p-3 rounded-xl bg-gray-50/50">
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
              {editingRole ? 'Update Role' : 'Save Role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
