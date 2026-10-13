"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { SiteContent } from '@/lib/siteContent';
import SectionsEditor, { type LookupData } from '@/components/admin/layout-editor/SectionsEditor';
import AnnouncementEditor from '@/components/admin/layout-editor/AnnouncementEditor';
import FooterEditor from '@/components/admin/layout-editor/FooterEditor';

type Tab = 'sections' | 'announcement' | 'footer';
const TABS: { id: Tab; label: string; description: string }[] = [
  { id: 'sections', label: 'Homepage sections', description: 'Order, show/hide and customize every homepage block' },
  { id: 'announcement', label: 'Top announcement bar', description: 'The message strip above the header' },
  { id: 'footer', label: 'Footer', description: 'Footer text, links and blocks' },
];

export default function AdminPageSectionsPage() {
  const [tab, setTab] = useState<Tab>('sections');
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saved, setSaved] = useState<SiteContent | null>(null);
  const [defaults, setDefaults] = useState<SiteContent | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [lookups, setLookups] = useState<LookupData>({ banners: [], categories: [], brands: [] });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/page-sections', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not load the layout settings.');
      setContent(json.content);
      setSaved(json.content);
      setDefaults(json.defaults);
      setUpdatedAt(json.updatedAt);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load the layout settings.');
    }
  }, []);

  useEffect(() => {
    void load();
    // Dropdown data; each list is optional, so failures just leave it empty.
    Promise.allSettled([
      fetch('/api/admin/banners').then((r) => r.json()),
      fetch('/api/admin/categories').then((r) => r.json()),
      fetch('/api/admin/brands').then((r) => r.json()),
    ]).then(([banners, categories, brands]) => {
      setLookups({
        banners: banners.status === 'fulfilled' && Array.isArray(banners.value)
          ? banners.value.map((b: any) => ({ id: String(b.id), title: b.title || b.widget_name, items: b.items?.length ?? 0, active: b.isActive !== false }))
          : [],
        categories: categories.status === 'fulfilled' && Array.isArray(categories.value)
          ? categories.value.map((c: any) => ({ slug: c.slug, name: c.name }))
          : [],
        brands: brands.status === 'fulfilled' && Array.isArray(brands.value?.brands)
          ? brands.value.brands.map((b: any) => ({ slug: b.slug, name: b.name }))
          : [],
      });
    });
  }, [load]);

  const changed = useMemo(() => JSON.stringify(content) !== JSON.stringify(saved), [content, saved]);

  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [changed]);

  const update = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setContent((current) => (current ? { ...current, [key]: value } : current));
    setMessage(null);
    setSaveError(null);
  };

  const save = async () => {
    if (!content) return;
    setSaving(true);
    setSaveError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/page-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not save your changes.');
      setContent(json.content);
      setSaved(json.content);
      setUpdatedAt(json.updatedAt);
      setMessage('Saved. The live storefront now shows these changes.');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  const resetTab = () => {
    if (!defaults || !content) return;
    const key = tab === 'sections' ? 'homeSections' : tab;
    if (!confirm(`Reset the ${TABS.find((t) => t.id === tab)?.label.toLowerCase()} to the original design? You can still discard before saving.`)) return;
    update(key, defaults[key]);
  };

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Homepage &amp; Site Layout</h1>
          <p className="mt-1 text-xs text-gray-500">Arrange the homepage and edit the announcement bar and footer. Changes go live when you save.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/banners" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-sg-pink hover:text-sg-pink">Manage banner images</Link>
          <Link href="/" target="_blank" className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700">View storefront ↗</Link>
        </div>
      </div>

      <div role="tablist" aria-label="Layout areas" className="grid gap-2 sm:grid-cols-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-2xl border p-3 text-left transition-colors ${tab === t.id ? 'border-sg-pink bg-pink-50/60' : 'border-gray-100 bg-white hover:border-gray-300'}`}
          >
            <p className={`text-xs font-bold ${tab === t.id ? 'text-sg-pink' : 'text-gray-900'}`}>{t.label}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">{t.description}</p>
          </button>
        ))}
      </div>

      {loadError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <span>{loadError}</span>
          <button type="button" onClick={() => void load()} className="rounded-lg bg-white px-3 py-1.5 font-bold">Try again</button>
        </div>
      )}

      {!content && !loadError && <div role="status" className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-xs text-gray-400">Loading layout settings…</div>}

      {content && (
        <div role="tabpanel">
          {tab === 'sections' && (
            <SectionsEditor
              sections={content.homeSections}
              onChange={(homeSections) => update('homeSections', homeSections)}
              lookups={lookups}
              announcement={content.announcement}
              footer={content.footer}
            />
          )}
          {tab === 'announcement' && <AnnouncementEditor value={content.announcement} onChange={(announcement) => update('announcement', announcement)} />}
          {tab === 'footer' && <FooterEditor value={content.footer} onChange={(footer) => update('footer', footer)} />}
        </div>
      )}

      {content && (
        <div className="fixed inset-x-4 bottom-4 z-40 lg:left-72">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg sm:p-4">
            <div className="min-w-0">
              {saveError ? <p role="alert" className="text-xs font-bold text-rose-700">{saveError}</p>
                : message ? <p role="status" className="text-xs font-bold text-emerald-700">{message}</p>
                : <p className="text-xs font-bold text-gray-900">{changed ? 'You have unsaved changes' : 'All changes saved'}</p>}
              <p className="mt-0.5 text-[10px] text-gray-500">
                {updatedAt ? `Last saved ${new Date(updatedAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })} (Dhaka)` : 'Showing the original design. Save to start customizing.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={resetTab} disabled={saving} className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-40">Reset this tab</button>
              <button type="button" onClick={() => { setContent(saved); setSaveError(null); setMessage(null); }} disabled={!changed || saving} className="rounded-xl px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40">Discard</button>
              <button type="button" onClick={save} disabled={!changed || saving} className="rounded-xl bg-sg-pink px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sg-pink-hover disabled:opacity-40">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
