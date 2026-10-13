"use client";

import React from 'react';
import AnnouncementBar from '@/components/common/AnnouncementBar';
import type { SiteContent } from '@/lib/siteContent';
import { Card, ColorField, LinkField, TextAreaField, Toggle } from './fields';

type Announcement = SiteContent['announcement'];

const PRESETS: { label: string; background: string; color: string }[] = [
  { label: 'Classic black', background: '#1f1f1f', color: '#ffffff' },
  { label: 'Brand pink', background: '#eb0064', color: '#ffffff' },
  { label: 'Soft pink', background: '#fff0f5', color: '#c90054' },
  { label: 'Emerald', background: '#047857', color: '#ffffff' },
];

export default function AnnouncementEditor({ value, onChange }: { value: Announcement; onChange: (value: Announcement) => void }) {
  const set = (patch: Partial<Announcement>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-6">
      <Card title="Live preview" description="Exactly how the bar appears above the header.">
        <div className="overflow-hidden rounded-xl border border-gray-100">
          {value.enabled && value.text
            ? <AnnouncementBar announcement={value} />
            : <p className="bg-gray-50 py-2 text-center text-[11px] text-gray-400">The announcement bar is hidden.</p>}
          <div className="flex items-center justify-between bg-white px-4 py-3 text-[11px] text-gray-400"><span className="font-black text-sg-pink">SHAJGOJ</span><span>Search • Account • Bag</span></div>
        </div>
      </Card>

      <Card title="Announcement bar" description="The thin message strip at the very top of every storefront page.">
        <Toggle checked={value.enabled} onChange={(enabled) => set({ enabled })} label="Show the announcement bar" description="Turn off to remove the strip from every page." />
        <Toggle checked={value.showOnMobile} onChange={(showOnMobile) => set({ showOnMobile })} label="Also show on phones" description="Off keeps the mobile header compact (current behaviour)." />
        <TextAreaField label="Message" value={value.text} rows={2} onChange={(text) => set({ text })} hint={`Tip: separate messages with •  (${value.text.length}/400 characters)`} />
        <LinkField label="Link (optional)" value={value.link} onChange={(link) => set({ link })} placeholder="/shop?offer=special" hint="Makes the whole bar clickable. Leave empty for plain text." />
      </Card>

      <Card title="Colors">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => set({ background: preset.background, color: preset.color })}
              className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-bold"
              style={{ backgroundColor: preset.background, color: preset.color }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorField label="Background color" value={value.background} onChange={(background) => set({ background })} />
          <ColorField label="Text color" value={value.color} onChange={(color) => set({ color })} />
        </div>
      </Card>
    </div>
  );
}
