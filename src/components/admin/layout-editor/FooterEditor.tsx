"use client";

import React from 'react';
import { FOOTER_FEATURE_ICONS, formatCopyright, type SiteContent } from '@/lib/siteContent';
import { Card, LinkField, SelectField, SmallButton, TextAreaField, TextField, Toggle, inputClass, move } from './fields';

type Footer = SiteContent['footer'];

export default function FooterEditor({ value, onChange }: { value: Footer; onChange: (value: Footer) => void }) {
  const set = (patch: Partial<Footer>) => onChange({ ...value, ...patch });
  const setFeature = (i: number, patch: Partial<Footer['features'][number]>) =>
    set({ features: value.features.map((f, j) => (j === i ? { ...f, ...patch } : f)) });
  const setColumn = (i: number, patch: Partial<Footer['columns'][number]>) =>
    set({ columns: value.columns.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const setLink = (ci: number, li: number, patch: Partial<{ label: string; href: string }>) =>
    setColumn(ci, { links: value.columns[ci].links.map((l, j) => (j === li ? { ...l, ...patch } : l)) });

  return (
    <div className="space-y-6">
      <Card title="Footer" description="The dark section at the bottom of every storefront page.">
        <Toggle checked={value.enabled} onChange={(enabled) => set({ enabled })} label="Show the footer" description="Turn off to remove the whole footer from the storefront." />
      </Card>

      <div className={value.enabled ? 'space-y-6' : 'pointer-events-none space-y-6 opacity-50'} aria-disabled={!value.enabled}>
        <Card
          title="Highlights row"
          description="The icon boxes across the top of the footer."
          actions={<SmallButton disabled={value.features.length >= 6} onClick={() => set({ features: [...value.features, { icon: 'star', title: 'New highlight', text: '' }] })}>+ Add highlight</SmallButton>}
        >
          <Toggle checked={value.showFeatures} onChange={(showFeatures) => set({ showFeatures })} label="Show highlights row" />
          {value.features.map((feature, i) => (
            <div key={i} className="grid gap-3 rounded-xl bg-gray-50 p-3 sm:grid-cols-[130px_minmax(0,1fr)_minmax(0,1.6fr)_auto] sm:items-end">
              <SelectField label="Icon" value={feature.icon} options={FOOTER_FEATURE_ICONS} onChange={(icon) => setFeature(i, { icon })} />
              <TextField label="Title" value={feature.title} onChange={(title) => setFeature(i, { title })} />
              <TextField label="Text" value={feature.text} maxLength={200} onChange={(text) => setFeature(i, { text })} />
              <div className="flex gap-1">
                <SmallButton title="Move left" disabled={i === 0} onClick={() => set({ features: move(value.features, i, i - 1) })}>◀</SmallButton>
                <SmallButton title="Move right" disabled={i === value.features.length - 1} onClick={() => set({ features: move(value.features, i, i + 1) })}>▶</SmallButton>
                <SmallButton tone="danger" title="Remove highlight" onClick={() => set({ features: value.features.filter((_, j) => j !== i) })}>✕</SmallButton>
              </div>
            </div>
          ))}
        </Card>

        <Card title="About & contact" description="Shown under the logo.">
          <TextAreaField label="About text" value={value.about} maxLength={1000} onChange={(about) => set({ about })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField label="Address" value={value.address} maxLength={400} onChange={(address) => set({ address })} />
            <TextField label="Phone" value={value.phone} placeholder="09613-222333" onChange={(phone) => set({ phone })} hint="Optional. Clickable on phones." />
            <TextField label="Email" value={value.email} onChange={(email) => set({ email })} />
          </div>
        </Card>

        <Card
          title="Link columns"
          description="Up to 4 columns of links, e.g. categories and policies."
          actions={<SmallButton disabled={value.columns.length >= 4} onClick={() => set({ columns: [...value.columns, { title: 'New column', links: [] }] })}>+ Add column</SmallButton>}
        >
          {value.columns.length === 0 && <p className="text-[11px] text-gray-500">No link columns.</p>}
          {value.columns.map((column, ci) => (
            <div key={ci} className="space-y-3 rounded-xl border border-gray-100 p-3">
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-48 flex-1"><TextField label={`Column ${ci + 1} heading`} value={column.title} onChange={(title) => setColumn(ci, { title })} /></div>
                <SmallButton title="Move column left" disabled={ci === 0} onClick={() => set({ columns: move(value.columns, ci, ci - 1) })}>◀</SmallButton>
                <SmallButton title="Move column right" disabled={ci === value.columns.length - 1} onClick={() => set({ columns: move(value.columns, ci, ci + 1) })}>▶</SmallButton>
                <SmallButton tone="danger" onClick={() => set({ columns: value.columns.filter((_, j) => j !== ci) })}>Remove column</SmallButton>
              </div>
              {column.links.map((link, li) => (
                <div key={li} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                  <TextField label="Link text" value={link.label} onChange={(label) => setLink(ci, li, { label })} />
                  <LinkField label="Goes to" value={link.href} onChange={(href) => setLink(ci, li, { href })} />
                  <div className="flex gap-1">
                    <SmallButton title="Move link up" disabled={li === 0} onClick={() => setColumn(ci, { links: move(column.links, li, li - 1) })}>▲</SmallButton>
                    <SmallButton title="Move link down" disabled={li === column.links.length - 1} onClick={() => setColumn(ci, { links: move(column.links, li, li + 1) })}>▼</SmallButton>
                    <SmallButton tone="danger" title="Remove link" onClick={() => setColumn(ci, { links: column.links.filter((_, j) => j !== li) })}>✕</SmallButton>
                  </div>
                </div>
              ))}
              <SmallButton disabled={column.links.length >= 20} onClick={() => setColumn(ci, { links: [...column.links, { label: '', href: '/' }] })}>+ Add link</SmallButton>
            </div>
          ))}
        </Card>

        <Card title="Newsletter & payments">
          <Toggle checked={value.newsletter.enabled} onChange={(enabled) => set({ newsletter: { ...value.newsletter, enabled } })} label="Show newsletter sign-up" />
          {value.newsletter.enabled && (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Heading" value={value.newsletter.title} onChange={(title) => set({ newsletter: { ...value.newsletter, title } })} />
              <TextField label="Text" value={value.newsletter.text} maxLength={400} onChange={(text) => set({ newsletter: { ...value.newsletter, text } })} />
            </div>
          )}
          <Toggle checked={value.showPayments} onChange={(showPayments) => set({ showPayments })} label="Show payment methods" />
          {value.showPayments && (
            <div>
              <label htmlFor="payment-methods" className="mb-1 block text-[11px] font-bold text-gray-700">Payment methods</label>
              <input
                // Remount when the saved list changes (e.g. Discard) so the text resets
                key={value.paymentMethods.join('|')}
                id="payment-methods"
                type="text"
                defaultValue={value.paymentMethods.join(', ')}
                onBlur={(e) => set({ paymentMethods: e.target.value.split(',').map((m) => m.trim()).filter(Boolean) })}
                className={inputClass}
              />
              <p className="mt-1 text-[10px] text-gray-500">Separate with commas, e.g. bKash, Nagad, COD.</p>
            </div>
          )}
        </Card>

        <Card title="Bottom line">
          <TextField label="Copyright text" value={value.copyright} maxLength={400} onChange={(copyright) => set({ copyright })} hint={<>Use {'{year}'} for the current year. Preview: {formatCopyright(value.copyright)}</>} />
          <Toggle checked={value.credit.enabled} onChange={(enabled) => set({ credit: { ...value.credit, enabled } })} label="Show designer credit" />
          {value.credit.enabled && (
            <div className="grid gap-3 sm:grid-cols-3">
              <TextField label="Text" value={value.credit.text} onChange={(text) => set({ credit: { ...value.credit, text } })} />
              <TextField label="Link text" value={value.credit.label} onChange={(label) => set({ credit: { ...value.credit, label } })} />
              <LinkField label="Link" value={value.credit.url} placeholder="https://" onChange={(url) => set({ credit: { ...value.credit, url } })} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
