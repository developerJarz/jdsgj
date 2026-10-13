"use client";

import React, { useId } from 'react';
import { isSafeHref } from '@/lib/siteContent';

export const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none';

export function Field({ label, hint, error, children }: { label: string; hint?: React.ReactNode; error?: string | null; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold text-gray-700 mb-1">{label}</label>
      {children(id)}
      {error ? <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p> : hint && <p className="mt-1 text-[10px] text-gray-500">{hint}</p>}
    </div>
  );
}

export function TextField({ label, value, onChange, hint, placeholder, maxLength = 120 }: {
  label: string; value: string; onChange: (value: string) => void; hint?: React.ReactNode; placeholder?: string; maxLength?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      {(id) => <input id={id} type="text" value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />}
    </Field>
  );
}

export function TextAreaField({ label, value, onChange, hint, maxLength = 400, rows = 3 }: {
  label: string; value: string; onChange: (value: string) => void; hint?: React.ReactNode; maxLength?: number; rows?: number;
}) {
  return (
    <Field label={label} hint={hint ?? `${value.length}/${maxLength} characters`}>
      {(id) => <textarea id={id} rows={rows} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} className={`${inputClass} resize-y`} />}
    </Field>
  );
}

/** Link input that flags anything the server would reject. */
export function LinkField({ label, value, onChange, hint, placeholder = '/shop' }: {
  label: string; value: string; onChange: (value: string) => void; hint?: React.ReactNode; placeholder?: string;
}) {
  const invalid = value.trim() !== '' && !isSafeHref(value.trim());
  return (
    <Field label={label} hint={hint} error={invalid ? 'Use a site path like /shop or a full https:// address.' : null}>
      {(id) => <input id={id} type="text" inputMode="url" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${inputClass} ${invalid ? 'border-rose-300' : ''}`} />}
    </Field>
  );
}

export function SelectField<T extends string | number>({ label, value, options, onChange, hint }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; hint?: React.ReactNode;
}) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <select
          id={id}
          value={String(value)}
          onChange={(e) => {
            const match = options.find((o) => String(o.value) === e.target.value);
            if (match) onChange(match.value);
          }}
          className={inputClass}
        >
          {options.map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
        </select>
      )}
    </Field>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: string; description?: string }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-xs font-bold text-gray-800 cursor-pointer">{label}</label>
        {description && <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="flex min-h-9 min-w-11 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sg-pink"
      >
        <span aria-hidden="true" className={`flex h-6 w-11 items-center rounded-full px-1 transition-colors ${checked ? 'bg-sg-pink' : 'bg-gray-300'}`}>
          <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </span>
      </button>
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const valid = /^#[0-9a-f]{6}$/i.test(value);
  return (
    <Field label={label} error={valid ? null : 'Use a color like #1f1f1f.'}>
      {(id) => (
        <div className="flex gap-2">
          <input type="color" aria-label={`${label} picker`} value={valid ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-white p-1" />
          <input id={id} type="text" value={value} maxLength={7} onChange={(e) => onChange(e.target.value)} className={`${inputClass} font-mono`} />
        </div>
      )}
    </Field>
  );
}

export function Card({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          {description && <p className="mt-0.5 text-[11px] text-gray-500">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

export function SmallButton({ children, onClick, disabled, tone = 'default', title }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; tone?: 'default' | 'danger' | 'primary'; title?: string;
}) {
  const tones = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'text-rose-600 hover:bg-rose-50',
    primary: 'bg-slate-900 text-white hover:bg-slate-700',
  };
  return (
    <button type="button" title={title} aria-label={title} onClick={onClick} disabled={disabled} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}>
      {children}
    </button>
  );
}

/** Immutable move of one array item. */
export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
