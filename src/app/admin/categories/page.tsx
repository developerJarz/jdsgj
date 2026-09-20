"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [newCat, setNewCat] = useState({
    name: '', slug: '', image: '', icon: '📦', description: '', parent: '', order: 0,
  });

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadCategories(); }, []);

  const handleToggleActive = async (cat: any) => {
    const id = cat._id || cat.id;
    const newActive = !(cat.isActive !== false);
    setCategories(prev => prev.map(c => (c._id || c.id) === id ? { ...c, isActive: newActive } : c));
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (cat: any) => {
    const id = cat._id || cat.id;
    if (!confirm(`Delete category "${cat.name}"? Products in this category will need reassignment.`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.filter(c => (c._id || c.id) !== id));
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (e) { console.error(e); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => [...prev, data.category]);
        setIsCreateOpen(false);
        setNewCat({ name: '', slug: '', image: '', icon: '📦', description: '', parent: '', order: 0 });
      } else {
        alert(data.message || 'Failed to create');
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCat) return;
    const id = editCat._id || editCat.id;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editCat.name, slug: editCat.slug, image: editCat.image,
          icon: editCat.icon, description: editCat.description, order: editCat.order,
          isActive: editCat.isActive, parent: editCat.parent || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.map(c => (c._id || c.id) === id ? { ...c, ...data.category } : c));
        setEditCat(null);
      }
    } catch (e) { console.error(e); }
  };

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const iconOptions = ['📦', '💄', '🧴', '💅', '👶', '🧥', '💇', '🌸', '✨', '🎁', '🔥', '⭐', '🌿', '🧖'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Category Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Organize product categories, hierarchy, and storefront navigation</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:brightness-110 text-white text-xs font-bold uppercase rounded-full shadow-md transition-all active:scale-95"
        >
          + Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sg-pink"
        />
        <span className="text-xs text-gray-400 font-semibold">{filtered.length} Categories</span>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400">Loading categories...</div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cat) => {
                  const isActive = cat.isActive !== false;
                  return (
                    <tr key={cat._id || cat.id} className={`hover:bg-gray-50/70 transition-colors ${!isActive ? 'opacity-50' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-lg border border-gray-100 flex-shrink-0 overflow-hidden">
                            {cat.image ? (
                              <Image src={cat.image} alt={cat.name} width={40} height={40} className="object-cover w-full h-full" />
                            ) : (
                              <span>{cat.icon || '📦'}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{cat.icon} {cat.name}</span>
                            {cat.description && <span className="text-[10px] text-gray-400 line-clamp-1">{cat.description}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{cat.slug}</code>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                          {cat.product_count || 0} items
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-600">{cat.order || 0}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isActive ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditCat({ ...cat })}
                            className="px-3 py-1 bg-gray-100 hover:bg-sg-pink hover:text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="text-red-400 hover:text-red-600 text-xs font-bold p-1"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Add New Category</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text" required value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
                  placeholder="e.g. Skin Care" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Slug</label>
                  <input type="text" value={newCat.slug} onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Icon</label>
                  <div className="flex flex-wrap gap-1">
                    {iconOptions.map(ic => (
                      <button key={ic} type="button" onClick={() => setNewCat({ ...newCat, icon: ic })}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border transition-colors ${newCat.icon === ic ? 'border-sg-pink bg-sg-pink-light' : 'border-gray-200 hover:border-gray-300'}`}
                      >{ic}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Image URL</label>
                <input type="url" value={newCat.image} onChange={(e) => setNewCat({ ...newCat, image: e.target.value })}
                  placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Parent Category</label>
                  <select value={newCat.parent} onChange={(e) => setNewCat({ ...newCat, parent: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink">
                    <option value="">None (Top Level)</option>
                    {categories.map(c => (<option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Display Order</label>
                  <input type="number" value={newCat.order} onChange={(e) => setNewCat({ ...newCat, order: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink" />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border rounded-full font-bold text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-sg-pink text-white rounded-full font-bold">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scroll">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Edit Category: {editCat.name}</h3>
              <button onClick={() => setEditCat(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name *</label>
                <input type="text" required value={editCat.name}
                  onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Slug</label>
                  <input type="text" value={editCat.slug}
                    onChange={(e) => setEditCat({ ...editCat, slug: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Icon</label>
                  <div className="flex flex-wrap gap-1">
                    {iconOptions.map(ic => (
                      <button key={ic} type="button" onClick={() => setEditCat({ ...editCat, icon: ic })}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border transition-colors ${editCat.icon === ic ? 'border-sg-pink bg-sg-pink-light' : 'border-gray-200 hover:border-gray-300'}`}
                      >{ic}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Image URL</label>
                <input type="url" value={editCat.image || ''}
                  onChange={(e) => setEditCat({ ...editCat, image: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea value={editCat.description || ''} onChange={(e) => setEditCat({ ...editCat, description: e.target.value })}
                  rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Parent Category</label>
                  <select value={editCat.parent || ''} onChange={(e) => setEditCat({ ...editCat, parent: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink">
                    <option value="">None (Top Level)</option>
                    {categories.filter(c => (c._id || c.id) !== (editCat._id || editCat.id)).map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Display Order</label>
                  <input type="number" value={editCat.order || 0}
                    onChange={(e) => setEditCat({ ...editCat, order: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink" />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button type="button" onClick={() => setEditCat(null)} className="px-4 py-2 border rounded-full font-bold text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-sg-pink text-white rounded-full font-bold shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
