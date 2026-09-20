"use client";

import React, { useState, useEffect } from 'react';

export default function AdminMegaMenuPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    title: '', type: 'link' as 'link' | 'dropdown' | 'mega', href: '/',
    items: [] as any[],
  });

  const loadMenu = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/mega-menu');
      const data = await res.json();
      if (Array.isArray(data)) setMenuItems(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadMenu(); }, []);

  const handleToggleActive = async (item: any) => {
    const id = item._id;
    const newActive = !item.isActive;
    setMenuItems(prev => prev.map(m => m._id === id ? { ...m, isActive: newActive } : m));
    try {
      await fetch(`/api/admin/mega-menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });
    } catch (e) { console.error(e); }
  };

  const handleMoveUp = async (idx: number) => {
    if (idx <= 0) return;
    const updated = [...menuItems];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    updated.forEach((item, i) => { item.position = i + 1; });
    setMenuItems(updated);
    try {
      await fetch('/api/admin/mega-menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated.map((m, i) => ({ _id: m._id, position: i + 1 }))),
      });
    } catch (e) { console.error(e); }
  };

  const handleMoveDown = async (idx: number) => {
    if (idx >= menuItems.length - 1) return;
    const updated = [...menuItems];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    updated.forEach((item, i) => { item.position = i + 1; });
    setMenuItems(updated);
    try {
      await fetch('/api/admin/mega-menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated.map((m, i) => ({ _id: m._id, position: i + 1 }))),
      });
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete menu item "${item.title}"?`)) return;
    setMenuItems(prev => prev.filter(m => m._id !== item._id));
    try {
      await fetch(`/api/admin/mega-menu/${item._id}`, { method: 'DELETE' });
    } catch (e) { console.error(e); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/mega-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (data.success && data.menuItem) {
        setMenuItems(prev => [...prev, data.menuItem]);
        setIsCreateOpen(false);
        setNewItem({ title: '', type: 'link', href: '/', items: [] });
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      const res = await fetch(`/api/admin/mega-menu/${editItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editItem.title, type: editItem.type, href: editItem.href,
          items: editItem.items, isActive: editItem.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMenuItems(prev => prev.map(m => m._id === editItem._id ? { ...m, ...data.menuItem } : m));
        setEditItem(null);
      }
    } catch (e) { console.error(e); }
  };

  const addChildToNew = () => {
    setNewItem({ ...newItem, items: [...newItem.items, { label: '', href: '/', children: [] }] });
  };

  const removeChildFromNew = (idx: number) => {
    setNewItem({ ...newItem, items: newItem.items.filter((_, i) => i !== idx) });
  };

  const addChildToEdit = () => {
    if (!editItem) return;
    setEditItem({ ...editItem, items: [...(editItem.items || []), { label: '', href: '/', children: [] }] });
  };

  const removeChildFromEdit = (idx: number) => {
    if (!editItem) return;
    setEditItem({ ...editItem, items: editItem.items.filter((_: any, i: number) => i !== idx) });
  };

  const typeLabels: Record<string, { label: string; color: string; bg: string }> = {
    link: { label: 'Link', color: 'text-blue-700', bg: 'bg-blue-50' },
    dropdown: { label: 'Dropdown', color: 'text-purple-700', bg: 'bg-purple-50' },
    mega: { label: 'Mega Panel', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Mega Menu Builder</h1>
          <p className="text-xs text-gray-500 mt-0.5">Configure storefront navigation items — links, dropdowns, and mega flyout panels</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:brightness-110 text-white text-xs font-bold uppercase rounded-full shadow-md transition-all active:scale-95"
        >
          + Add Menu Item
        </button>
      </div>

      {/* Live Preview Strip */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">📺 Live Navigation Preview</span>
        </div>
        <div className="px-4 py-3 flex items-center gap-1 overflow-x-auto custom-scroll">
          {menuItems.filter(m => m.isActive !== false).map((item) => {
            const t = typeLabels[item.type] || typeLabels.link;
            return (
              <span key={item._id || item.slug} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-sg-black hover:text-sg-pink whitespace-nowrap transition-colors cursor-default flex items-center gap-1">
                {item.title}
                {item.type !== 'link' && <span className="text-[8px]">▼</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* Menu Items List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400">Loading navigation menu...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {menuItems.map((item, idx) => {
              const isActive = item.isActive !== false;
              const t = typeLabels[item.type] || typeLabels.link;
              return (
                <div key={item._id || item.slug} className={`p-4 flex items-center gap-4 ${!isActive ? 'opacity-50' : ''}`}>
                  {/* Reorder Arrows */}
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleMoveUp(idx)} disabled={idx === 0}
                      className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-xs font-bold text-gray-600">
                      ↑
                    </button>
                    <button onClick={() => handleMoveDown(idx)} disabled={idx === menuItems.length - 1}
                      className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-xs font-bold text-gray-600">
                      ↓
                    </button>
                  </div>

                  {/* Position Badge */}
                  <div className="w-8 h-8 rounded-lg bg-sg-pink/10 text-sg-pink font-black text-sm flex items-center justify-center flex-shrink-0">
                    {item.position || idx + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{item.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${t.bg} ${t.color}`}>
                        {t.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                      <span>→ {item.href}</span>
                      {item.items?.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-bold">{item.items.length} children</span>
                      )}
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isActive ? 'left-5' : 'left-0.5'}`} />
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setEditItem({ ...item })}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-sg-pink hover:text-white rounded-lg text-xs font-bold transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item)}
                      className="text-red-400 hover:text-red-600 text-xs font-bold p-1">
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Menu Item Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scroll">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Add Navigation Item</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Menu Title *</label>
                <input type="text" required value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g. SKIN CARE" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Type *</label>
                  <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink">
                    <option value="link">Simple Link</option>
                    <option value="dropdown">Dropdown Menu</option>
                    <option value="mega">Mega Panel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Link URL</label>
                  <input type="text" value={newItem.href} onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
                    placeholder="/shop?category=..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink" />
                </div>
              </div>

              {(newItem.type === 'dropdown' || newItem.type === 'mega') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-gray-700">Child Items ({newItem.items.length})</label>
                    <button type="button" onClick={addChildToNew} className="px-3 py-1 bg-gray-100 hover:bg-sg-pink hover:text-white rounded-lg font-bold transition-colors">+ Add</button>
                  </div>
                  <div className="space-y-2">
                    {newItem.items.map((child: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-gray-50 rounded-lg flex items-center gap-2">
                        <input type="text" placeholder="Label" value={child.label}
                          onChange={(e) => { const u = [...newItem.items]; u[idx] = { ...u[idx], label: e.target.value }; setNewItem({ ...newItem, items: u }); }}
                          className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-sg-pink" />
                        <input type="text" placeholder="URL" value={child.href}
                          onChange={(e) => { const u = [...newItem.items]; u[idx] = { ...u[idx], href: e.target.value }; setNewItem({ ...newItem, items: u }); }}
                          className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-sg-pink" />
                        <button type="button" onClick={() => removeChildFromNew(idx)} className="text-red-400 hover:text-red-600 font-bold">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border rounded-full font-bold text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-sg-pink text-white rounded-full font-bold">Create Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scroll">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Edit: {editItem.title}</h3>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Menu Title *</label>
                <input type="text" required value={editItem.title}
                  onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Type</label>
                  <select value={editItem.type} onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink">
                    <option value="link">Simple Link</option>
                    <option value="dropdown">Dropdown Menu</option>
                    <option value="mega">Mega Panel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Link URL</label>
                  <input type="text" value={editItem.href || ''}
                    onChange={(e) => setEditItem({ ...editItem, href: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink" />
                </div>
              </div>

              {(editItem.type === 'dropdown' || editItem.type === 'mega') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-gray-700">Child Items ({editItem.items?.length || 0})</label>
                    <button type="button" onClick={addChildToEdit} className="px-3 py-1 bg-gray-100 hover:bg-sg-pink hover:text-white rounded-lg font-bold transition-colors">+ Add</button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scroll">
                    {(editItem.items || []).map((child: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-gray-50 rounded-lg flex items-center gap-2">
                        <input type="text" placeholder="Label" value={child.label || ''}
                          onChange={(e) => { const u = [...editItem.items]; u[idx] = { ...u[idx], label: e.target.value }; setEditItem({ ...editItem, items: u }); }}
                          className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-sg-pink" />
                        <input type="text" placeholder="URL" value={child.href || ''}
                          onChange={(e) => { const u = [...editItem.items]; u[idx] = { ...u[idx], href: e.target.value }; setEditItem({ ...editItem, items: u }); }}
                          className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-sg-pink" />
                        <button type="button" onClick={() => removeChildFromEdit(idx)} className="text-red-400 hover:text-red-600 font-bold">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 border rounded-full font-bold text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-sg-pink text-white rounded-full font-bold shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
