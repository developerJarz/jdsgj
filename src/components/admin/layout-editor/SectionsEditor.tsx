"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HOME_SECTION_TYPES, PRODUCT_SOURCES, SECTION_ICONS,
  type HomeSection, type HomeSectionType, type SiteContent,
} from '@/lib/siteContent';
import { Card, LinkField, SelectField, SmallButton, TextAreaField, TextField, Toggle, move } from './fields';

export interface LookupData {
  banners: { id: string; title: string; items: number; active: boolean }[];
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
}

const NEW_SECTION: Record<HomeSectionType, Omit<HomeSection, 'id'>> = {
  hero: { type: 'hero', enabled: true, interval: 4.5 },
  under_hero: { type: 'under_hero', enabled: true },
  banner_grid: { type: 'banner_grid', enabled: true, title: 'New Banner Section', bannerId: '', columns: 4, style: 'cards' },
  product_grid: { type: 'product_grid', enabled: true, title: 'New Product Section', subtitle: '', source: 'bestsellers', sourceValue: '', icon: 'none', viewAllHref: '/shop', limit: 10 },
  categories: { type: 'categories', enabled: true, title: 'Shop by Category', limit: 8 },
  concerns: { type: 'concerns', enabled: true, title: 'Shop by Concern' },
};

export function sectionName(section: HomeSection): string {
  return section.title || HOME_SECTION_TYPES[section.type].label;
}

export default function SectionsEditor({ sections, onChange, lookups, announcement, footer }: {
  sections: HomeSection[];
  onChange: (sections: HomeSection[]) => void;
  lookups: LookupData;
  announcement: SiteContent['announcement'];
  footer: SiteContent['footer'];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const update = (id: string, patch: Partial<HomeSection>) =>
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const remove = (id: string) => onChange(sections.filter((s) => s.id !== id));
  const add = (type: HomeSectionType) => {
    const id = `${type.replace(/_/g, '-')}-${Date.now().toString(36)}`;
    onChange([...sections, { id, ...NEW_SECTION[type] }]);
    setOpenId(id);
    setAdding(false);
  };
  const duplicate = (section: HomeSection) => {
    const id = `${section.type.replace(/_/g, '-')}-${Date.now().toString(36)}`;
    const index = sections.findIndex((s) => s.id === section.id);
    const copy = { ...section, id, title: section.title ? `${section.title} (copy)` : section.title };
    onChange([...sections.slice(0, index + 1), copy, ...sections.slice(index + 1)]);
    setOpenId(id);
  };

  const addable = (Object.keys(HOME_SECTION_TYPES) as HomeSectionType[])
    .filter((type) => !HOME_SECTION_TYPES[type].single || !sections.some((s) => s.type === type));
  const visibleCount = sections.filter((s) => s.enabled).length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card
        title="Homepage sections"
        description={`${visibleCount} of ${sections.length} sections visible. Top to bottom is the order on the homepage.`}
        actions={<SmallButton tone="primary" onClick={() => setAdding((v) => !v)}>{adding ? 'Close' : '+ Add section'}</SmallButton>}
      >
        {adding && (
          <div className="grid gap-2 sm:grid-cols-2 rounded-xl border border-dashed border-sg-pink/40 bg-pink-50/40 p-3">
            {addable.map((type) => (
              <button key={type} type="button" onClick={() => add(type)} className="rounded-xl border border-gray-100 bg-white p-3 text-left hover:border-sg-pink/40">
                <p className="text-xs font-bold text-gray-900">{HOME_SECTION_TYPES[type].label}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">{HOME_SECTION_TYPES[type].description}</p>
              </button>
            ))}
          </div>
        )}

        {sections.length === 0 && <p className="py-8 text-center text-xs text-gray-500">No sections. Add one to build your homepage.</p>}

        <ol className="space-y-2">
          {sections.map((section, index) => {
            const open = openId === section.id;
            const problem = sectionProblem(section, lookups);
            return (
              <li key={section.id} className={`rounded-xl border transition-colors ${open ? 'border-sg-pink/40 bg-pink-50/20' : 'border-gray-100'} ${section.enabled ? '' : 'opacity-60'}`}>
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 text-[11px] font-black text-gray-700">{index + 1}</span>
                  <div className="flex flex-col gap-0.5">
                    <button type="button" aria-label={`Move ${sectionName(section)} up`} disabled={index === 0} onClick={() => onChange(move(sections, index, index - 1))} className="rounded bg-gray-100 px-1 text-[9px] leading-4 text-gray-600 hover:bg-gray-200 disabled:opacity-30">▲</button>
                    <button type="button" aria-label={`Move ${sectionName(section)} down`} disabled={index === sections.length - 1} onClick={() => onChange(move(sections, index, index + 1))} className="rounded bg-gray-100 px-1 text-[9px] leading-4 text-gray-600 hover:bg-gray-200 disabled:opacity-30">▼</button>
                  </div>
                  <button type="button" onClick={() => setOpenId(open ? null : section.id)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-xs font-bold text-gray-900">{sectionName(section)}</p>
                    <p className="text-[10px] text-gray-500">
                      <span className="font-semibold text-purple-700">{HOME_SECTION_TYPES[section.type].label}</span>
                      {summary(section, lookups)}
                      {problem && <span className="ml-1 font-semibold text-amber-700">• {problem}</span>}
                    </p>
                  </button>
                  <Toggle checked={section.enabled} onChange={(enabled) => update(section.id, { enabled })} label={section.enabled ? 'Visible' : 'Hidden'} />
                  <SmallButton onClick={() => setOpenId(open ? null : section.id)}>{open ? 'Done' : 'Edit'}</SmallButton>
                </div>

                {open && (
                  <div className="space-y-3 border-t border-gray-100 p-4">
                    <SectionOptions section={section} lookups={lookups} onChange={(patch) => update(section.id, patch)} />
                    <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3">
                      {!HOME_SECTION_TYPES[section.type].single && <SmallButton onClick={() => duplicate(section)}>Duplicate</SmallButton>}
                      <SmallButton tone="danger" onClick={() => { remove(section.id); setOpenId(null); }}>Remove from homepage</SmallButton>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      <PageOutline sections={sections} announcement={announcement} footer={footer} onSelect={setOpenId} />
    </div>
  );
}

function summary(section: HomeSection, lookups: LookupData): string {
  switch (section.type) {
    case 'hero': return ` • ${section.interval ?? 4.5}s per slide`;
    case 'banner_grid': {
      const banner = lookups.banners.find((b) => b.id === section.bannerId);
      return banner ? ` • ${banner.title} (${banner.items} images)` : '';
    }
    case 'product_grid': {
      const source = PRODUCT_SOURCES.find((s) => s.value === section.source)?.label ?? '';
      return ` • ${section.limit} products • ${source}${section.sourceValue ? `: ${section.sourceValue}` : ''}`;
    }
    case 'categories': return ` • up to ${section.limit} categories`;
    default: return '';
  }
}

// Sections whose images live in a fixed Banners & Hero group.
const FIXED_BANNER: Partial<Record<HomeSectionType, string>> = {
  hero: 'hero-slider',
  under_hero: 'under-hero-banner',
  concerns: 'shop-by-concerns',
};

function sectionProblem(section: HomeSection, lookups: LookupData): string | null {
  const fixed = FIXED_BANNER[section.type];
  if (fixed && lookups.banners.find((b) => b.id === fixed)?.active === false) {
    return 'Not shown: its images are switched off in Banners & Hero';
  }
  if (section.type === 'banner_grid') {
    if (!section.bannerId) return 'Choose a banner group';
    const banner = lookups.banners.find((b) => b.id === section.bannerId);
    if (lookups.banners.length && !banner) return 'Banner group not found';
    if (banner && !banner.active) return 'Banner group is switched off';
  }
  if (section.type === 'product_grid' && (section.source === 'category' || section.source === 'brand') && !section.sourceValue) {
    return `Choose a ${section.source}`;
  }
  return null;
}

function SectionOptions({ section, lookups, onChange }: { section: HomeSection; lookups: LookupData; onChange: (patch: Partial<HomeSection>) => void }) {
  const bannerLink = <Link href="/admin/banners" className="font-semibold text-sg-pink hover:underline">Banners &amp; Hero</Link>;
  switch (section.type) {
    case 'hero':
      return (
        <>
          <SelectField
            label="Time per slide"
            value={section.interval ?? 4.5}
            options={[3, 4, 4.5, 5, 6, 8, 10].map((v) => ({ value: v, label: `${v} seconds` }))}
            onChange={(interval) => onChange({ interval })}
          />
          <p className="text-[11px] text-gray-500">Slide images and links are managed in {bannerLink} → Hero Slider.</p>
        </>
      );
    case 'under_hero':
      return <p className="text-[11px] text-gray-500">Change this image in {bannerLink} → Banner Under Hero.</p>;
    case 'banner_grid':
      return (
        <>
          <TextField label="Section title" value={section.title ?? ''} onChange={(title) => onChange({ title })} />
          <SelectField
            label="Banner group"
            value={section.bannerId ?? ''}
            options={[{ value: '', label: 'Choose a banner group…' }, ...lookups.banners.map((b) => ({ value: b.id, label: `${b.title} (${b.items} images${b.active ? '' : ', switched off'})` }))]}
            onChange={(bannerId) => onChange({ bannerId })}
            hint={<>Images come from {bannerLink}. Create a new group there to show it here.</>}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Card style" value={section.style ?? 'cards'} options={[{ value: 'cards', label: 'Image cards' }, { value: 'brands', label: 'Wide brand cards (3 per row)' }]} onChange={(style) => onChange({ style })} />
            {section.style !== 'brands' && (
              <SelectField label="Images per row" value={section.columns ?? 4} options={[1, 2, 3, 4].map((v) => ({ value: v, label: String(v) }))} onChange={(columns) => onChange({ columns })} />
            )}
          </div>
        </>
      );
    case 'product_grid': {
      const choices = section.source === 'category'
        ? lookups.categories.map((c) => ({ value: c.slug, label: c.name }))
        : lookups.brands.map((b) => ({ value: b.slug, label: b.name }));
      return (
        <>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
            <TextField label="Section title" value={section.title ?? ''} onChange={(title) => onChange({ title })} />
            <SelectField label="Title icon" value={section.icon ?? 'none'} options={SECTION_ICONS} onChange={(icon) => onChange({ icon })} />
          </div>
          <TextAreaField label="Subtitle" value={section.subtitle ?? ''} rows={2} maxLength={200} onChange={(subtitle) => onChange({ subtitle })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Which products" value={section.source ?? 'bestsellers'} options={PRODUCT_SOURCES} onChange={(source) => onChange({ source, sourceValue: '' })} />
            {(section.source === 'category' || section.source === 'brand') && (
              <SelectField
                label={section.source === 'category' ? 'Category' : 'Brand'}
                value={section.sourceValue ?? ''}
                options={[{ value: '', label: `Choose a ${section.source}…` }, ...choices]}
                onChange={(sourceValue) => onChange({ sourceValue })}
              />
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Number of products" value={section.limit ?? 10} options={[4, 5, 8, 10, 12, 15, 20].map((v) => ({ value: v, label: String(v) }))} onChange={(limit) => onChange({ limit })} />
            <LinkField label='"View all" link' value={section.viewAllHref ?? ''} onChange={(viewAllHref) => onChange({ viewAllHref })} hint="Leave empty to hide the link." />
          </div>
          <p className="text-[11px] text-gray-500">The section hides itself automatically when no products match.</p>
        </>
      );
    }
    case 'categories':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Section title" value={section.title ?? ''} onChange={(title) => onChange({ title })} />
          <SelectField label="Categories to show" value={section.limit ?? 8} options={[4, 6, 8, 12, 16].map((v) => ({ value: v, label: String(v) }))} onChange={(limit) => onChange({ limit })} />
        </div>
      );
    case 'concerns':
      return (
        <>
          <TextField label="Section title" value={section.title ?? ''} onChange={(title) => onChange({ title })} />
          <p className="text-[11px] text-gray-500">Concern images come from {bannerLink} → Shop By Concerns. The section only shows while that group is switched on.</p>
        </>
      );
  }
}

/** Schematic of the whole storefront page so admins see where each block lands. */
function PageOutline({ sections, announcement, footer, onSelect }: {
  sections: HomeSection[]; announcement: SiteContent['announcement']; footer: SiteContent['footer']; onSelect: (id: string) => void;
}) {
  const visible = sections.filter((s) => s.enabled);
  return (
    <aside className="space-y-3 lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-xs font-bold text-gray-900">Homepage outline</h2>
          <p className="text-[10px] text-gray-500">How the page stacks up, top to bottom.</p>
        </div>
        <div className="space-y-1.5 p-3 text-[10px] font-semibold">
          {announcement.enabled && (
            <div className="truncate rounded px-2 py-1" style={{ backgroundColor: announcement.background, color: announcement.color }}>{announcement.text || 'Announcement bar'}</div>
          )}
          <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-gray-500">Header &amp; menu</div>
          {visible.length === 0 && <div className="rounded border border-dashed border-gray-300 px-2 py-4 text-center text-gray-400">No visible sections</div>}
          {visible.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={`block w-full truncate rounded px-2 text-left hover:ring-2 hover:ring-sg-pink/40 ${
                s.type === 'hero' ? 'bg-pink-100 py-3 text-pink-900'
                  : s.type === 'under_hero' ? 'bg-pink-50 py-1.5 text-pink-800'
                  : s.type === 'product_grid' ? 'bg-sky-50 py-2.5 text-sky-900'
                  : 'bg-violet-50 py-2 text-violet-900'
              }`}
            >
              {sectionName(s)}
            </button>
          ))}
          {footer.enabled
            ? <div className="rounded bg-[#1a1a1a] px-2 py-2 text-gray-300">Footer</div>
            : <div className="rounded border border-dashed border-gray-300 px-2 py-1.5 text-gray-400">Footer hidden</div>}
        </div>
      </div>
      <Link href="/" target="_blank" className="block rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-[11px] font-bold text-gray-700 hover:border-sg-pink hover:text-sg-pink">
        Open live homepage ↗
      </Link>
    </aside>
  );
}
