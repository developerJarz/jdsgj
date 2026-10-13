"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import BannerImageInput from '@/components/admin/BannerImageInput';
import { isUnderHeroBanner, UNDER_HERO_RECOMMENDED_SIZE } from '@/lib/homepageBanners';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editBanner, setEditBanner] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({
    widget_name: 'custom_banner',
    title: '',
    columns: 1,
    items: [{ id: 1, title: '', image: '', url: '/', alt: '' }],
  });

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (Array.isArray(data)) setBanners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const handleToggleActive = async (banner: any) => {
    const id = banner._id || banner.id;
    const newActive = !(banner.isActive !== false);
    setBanners(prev => prev.map(b => (b._id || b.id) === id ? { ...b, isActive: newActive } : b));
    try {
      await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId: id, isActive: newActive }),
      });
    } catch (e) { console.error(e); }
  };

  const handleDeleteBanner = async (banner: any) => {
    const id = banner._id || banner.id;
    if (!confirm(`Delete banner "${banner.title || banner.widget_name}"?`)) return;
    setBanners(prev => prev.filter(b => (b._id || b.id) !== id));
    try {
      await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    } catch (e) { console.error(e); }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner),
      });
      const data = await res.json();
      if (data.success) {
        setBanners(prev => [...prev, data.banner]);
        setIsCreateOpen(false);
        setNewBanner({ widget_name: 'custom_banner', title: '', columns: 1, items: [{ id: 1, title: '', image: '', url: '/', alt: '' }] });
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBanner) return;
    const id = editBanner._id || editBanner.id;
    if ((editBanner.items || []).some((item: any) => !item.image?.trim())) {
      setSaveError('Every banner item needs an image. Upload one or remove the empty item.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editBanner.title,
          widget_name: editBanner.widget_name,
          columns: editBanner.columns,
          items: editBanner.items,
          isActive: editBanner.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBanners(prev => prev.map(b => (b._id || b.id) === id ? { ...b, ...data.banner } : b));
        setEditBanner(null);
      } else {
        setSaveError(data.message || data.error || 'Could not save the banner.');
      }
    } catch (e) {
      setSaveError('Could not reach the server. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addItemToEdit = () => {
    if (!editBanner) return;
    setEditBanner({
      ...editBanner,
      items: [...(editBanner.items || []), { id: Date.now(), title: '', image: '', url: '/', alt: '' }],
    });
  };

  const removeItemFromEdit = (idx: number) => {
    if (!editBanner) return;
    setEditBanner({
      ...editBanner,
      items: editBanner.items.filter((_: any, i: number) => i !== idx),
    });
  };

  const updateEditItem = (idx: number, field: string, value: string) => {
    if (!editBanner) return;
    const updated = [...editBanner.items];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditBanner({ ...editBanner, items: updated });
  };

  const widgetTypes = [
    { value: 'hero_slider', label: 'Hero Slider (Homepage Top)' },
    { value: 'under_hero_banner', label: 'Banner Under Hero (Homepage)' },
    { value: 'deals-cannot-miss', label: 'Deals Section' },
    { value: 'top-brands-offers', label: 'Top Brands & Offers' },
    { value: 'limited-time-offers', label: 'Limited Time Offers' },
    { value: 'shop-by-concerns', label: 'Shop By Concerns' },
    { value: 'custom_banner', label: 'Custom Banner' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Banners & Homepage Customization</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage hero sliders, promotional banners, deals sections, and homepage widgets</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:brightness-110 text-white text-xs font-bold uppercase rounded-full shadow-md transition-all active:scale-95"
        >
          + Add New Banner
        </button>
      </div>

      {/* Banner Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading banner widgets from database...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* The under-hero slot is listed first so it is easy to find */}
          {[...banners].sort((a, b) => Number(isUnderHeroBanner(b)) - Number(isUnderHeroBanner(a))).map((banner) => {
            const isActive = banner.isActive !== false;
            const underHero = isUnderHeroBanner(banner);
            return (
              <div key={banner._id || banner.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isActive ? (underHero ? 'border-sg-pink/40 ring-1 ring-sg-pink/20' : 'border-gray-100') : 'border-red-200 opacity-70'}`}>
                {/* Banner Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{banner.title || banner.widget_name}</h3>
                    {underHero && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        The image right under the hero slider on the homepage. {isActive ? 'Live now.' : 'Hidden from the homepage.'}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold uppercase">
                        {widgetTypes.find((wt) => wt.value === banner.widget_name)?.label || banner.widget_name}
                      </span>
                      <span className="text-[10px] text-gray-400">{banner.items?.length || 0} items</span>
                      <span className="text-[10px] text-gray-400">• {banner.columns || 1} cols</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isActive ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                {/* Banner Preview - show first 3 images */}
                <div className="p-3">
                  <div className="flex gap-2 overflow-x-auto custom-scroll pb-2">
                    {(banner.items || []).slice(0, 4).map((item: any, idx: number) => (
                      <div key={idx} className="relative w-24 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.image ? (
                          <Image src={item.image} alt={item.alt || item.title || ''} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                        )}
                      </div>
                    ))}
                    {(banner.items?.length || 0) > 4 && (
                      <div className="w-24 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-xs text-gray-400 font-bold flex-shrink-0 border border-gray-100">
                        +{banner.items.length - 4} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
                  <button
                    onClick={() => { setSaveError(null); setEditBanner({ ...banner }); }}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:border-sg-pink hover:text-sg-pink rounded-lg text-xs font-bold transition-colors"
                  >
                    {underHero ? '🖼 Change Image' : '✏️ Edit Banner'}
                  </button>
                  {underHero ? (
                    <span className="px-3 py-1.5 text-[11px] text-gray-400">Use the switch to hide it</span>
                  ) : (
                    <button
                      onClick={() => handleDeleteBanner(banner)}
                      className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Banner Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scroll">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Add New Banner Widget</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateBanner} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Widget Type *</label>
                <select
                  value={newBanner.widget_name}
                  onChange={(e) => setNewBanner({ ...newBanner, widget_name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                >
                  {widgetTypes.map(wt => (
                    <option key={wt.value} value={wt.value}>{wt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  placeholder="e.g. Summer Sale Banners"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Columns</label>
                <select
                  value={newBanner.columns}
                  onChange={(e) => setNewBanner({ ...newBanner, columns: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                >
                  <option value={1}>1 Column (Full Width)</option>
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">First Banner Item</label>
                <div className="mb-2">
                  <BannerImageInput
                    value={newBanner.items[0]?.image || ''}
                    onChange={(image) => {
                      const items = [...newBanner.items];
                      items[0] = { ...items[0], image };
                      setNewBanner({ ...newBanner, items });
                    }}
                    onBusyChange={setIsUploading}
                    hint={newBanner.widget_name === 'under_hero_banner' ? `Recommended size: ${UNDER_HERO_RECOMMENDED_SIZE}` : undefined}
                    inputClassName="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Link URL (e.g. /shop?brand=ponds)"
                  value={newBanner.items[0]?.url || ''}
                  onChange={(e) => {
                    const items = [...newBanner.items];
                    items[0] = { ...items[0], url: e.target.value };
                    setNewBanner({ ...newBanner, items });
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border rounded-full font-bold text-gray-600">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-5 py-2 bg-sg-pink text-white rounded-full font-bold disabled:opacity-50">Create Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Banner Modal */}
      {editBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scroll">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Edit Banner: {editBanner.title || editBanner.widget_name}</h3>
              <button onClick={() => setEditBanner(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleUpdateBanner} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Widget Name</label>
                  <select
                    value={editBanner.widget_name}
                    onChange={(e) => setEditBanner({ ...editBanner, widget_name: e.target.value })}
                    disabled={isUnderHeroBanner(editBanner)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink disabled:opacity-60"
                  >
                    {widgetTypes.map(wt => (
                      <option key={wt.value} value={wt.value}>{wt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editBanner.title || ''}
                    onChange={(e) => setEditBanner({ ...editBanner, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sg-pink"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-gray-700">Banner Items ({editBanner.items?.length || 0})</label>
                  <button type="button" onClick={addItemToEdit} className="px-3 py-1 bg-gray-100 hover:bg-sg-pink hover:text-white rounded-lg font-bold transition-colors">
                    + Add Item
                  </button>
                </div>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scroll">
                  {(editBanner.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Item #{idx + 1}</span>
                        <button type="button" onClick={() => removeItemFromEdit(idx)} className="text-red-400 hover:text-red-600 text-xs font-bold">Remove</button>
                      </div>
                      <input
                        type="text"
                        placeholder="Title (optional)"
                        value={item.title || ''}
                        onChange={(e) => updateEditItem(idx, 'title', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sg-pink"
                      />
                      <BannerImageInput
                        value={item.image || ''}
                        onChange={(image) => updateEditItem(idx, 'image', image)}
                        onBusyChange={setIsUploading}
                        hint={isUnderHeroBanner(editBanner) ? `Recommended size: ${UNDER_HERO_RECOMMENDED_SIZE} (wide banner, shown full width)` : undefined}
                      />
                      <input
                        type="text"
                        placeholder="Link URL (e.g. /shop?brand=ponds)"
                        value={item.url || ''}
                        onChange={(e) => updateEditItem(idx, 'url', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sg-pink"
                      />
                      <input
                        type="text"
                        placeholder="Image description for accessibility (alt text)"
                        value={item.alt || ''}
                        onChange={(e) => updateEditItem(idx, 'alt', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sg-pink"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {saveError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 font-semibold text-rose-700">{saveError}</p>}
              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button type="button" onClick={() => setEditBanner(null)} className="px-4 py-2 border rounded-full font-bold text-gray-600">Cancel</button>
                <button type="submit" disabled={isUploading || isSaving} className="px-5 py-2 bg-sg-pink text-white rounded-full font-bold shadow-md disabled:opacity-50">
                  {isUploading ? 'Waiting for upload...' : isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
