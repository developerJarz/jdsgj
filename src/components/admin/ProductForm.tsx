"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import SearchableSelect, { SelectOption } from './SearchableSelect';
import ImageUploader from './ImageUploader';

export interface ProductFormValues {
  name: string;
  brand_id: string;
  category_id: string;
  regular_price: string;
  sale_price: string;
  stock: string;
  low_stock_threshold: string;
  sku: string;
  short_description: string;
  description: string;
  how_to_use: string;
  ingredients: string;
  tags: string;
  images: string[];
  is_active: boolean;
  is_new: boolean;
  featured: boolean;
  bestseller: boolean;
}

export const EMPTY_PRODUCT: ProductFormValues = {
  name: '',
  brand_id: '',
  category_id: '',
  regular_price: '',
  sale_price: '',
  stock: '10',
  low_stock_threshold: '5',
  sku: '',
  short_description: '',
  description: '',
  how_to_use: '',
  ingredients: '',
  tags: '',
  images: [],
  is_active: true,
  is_new: true,
  featured: false,
  bestseller: false,
};

interface ProductFormProps {
  initialValues: ProductFormValues;
  brandOptions: SelectOption[];
  categoryOptions: SelectOption[];
  optionsLoading: boolean;
  isEditing: boolean;
  onSubmit: (values: ProductFormValues) => Promise<string | null>;
  onCancel: () => void;
}

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sg-pink focus:bg-white';
const labelClass = 'block text-[11px] font-bold text-gray-700 mb-1';

function Field({ label, children, hint, error }: { label: string; children: React.ReactNode; hint?: string; error?: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error ? <p className="text-[10px] text-rose-600 mt-1">{error}</p> : hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-sg-pink" />
    </label>
  );
}

export default function ProductForm({
  initialValues,
  brandOptions,
  categoryOptions,
  optionsLoading,
  isEditing,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const sale = Number(values.sale_price);
  const regular = Number(values.regular_price);
  const discount = regular > sale && sale > 0 ? Math.round(((regular - sale) / regular) * 100) : 0;

  const validate = () => {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = 'Product name is required';
    if (!values.brand_id) next.brand_id = 'Choose a brand';
    if (!values.category_id) next.category_id = 'Choose a category';
    if (!(sale > 0)) next.sale_price = 'Enter a selling price';
    if (values.regular_price && regular < sale) next.regular_price = 'MRP should be at least the selling price';
    if (values.stock === '' || Number(values.stock) < 0) next.stock = 'Enter stock quantity';
    if (values.images.length === 0) next.images = 'Add at least one photo so shoppers can see the product';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    setServerError(null);
    const error = await onSubmit(values);
    setIsSaving(false);
    if (error) setServerError(error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <section className="space-y-3">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Basic info</h4>
        <Field label="Product name *" error={errors.name}>
          <input
            type="text"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. COSRX Advanced Snail 96 Mucin Power Essence 100ml"
            className={inputClass}
            autoFocus={!isEditing}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Brand *"
            error={errors.brand_id}
            hint={!optionsLoading && brandOptions.length === 0 ? undefined : `${brandOptions.length} brands`}
          >
            <SearchableSelect
              options={brandOptions}
              value={values.brand_id}
              onChange={(v) => set('brand_id', v)}
              placeholder="Search brands…"
              isLoading={optionsLoading}
              invalid={Boolean(errors.brand_id)}
              emptyText={<span>No brand found. <Link href="/admin/brands" className="text-sg-pink font-bold">Add a brand</Link></span>}
              required
            />
          </Field>
          <Field label="Category *" error={errors.category_id}>
            <SearchableSelect
              options={categoryOptions}
              value={values.category_id}
              onChange={(v) => set('category_id', v)}
              placeholder="Choose category…"
              isLoading={optionsLoading}
              invalid={Boolean(errors.category_id)}
              emptyText={<span>No category found. <Link href="/admin/categories" className="text-sg-pink font-bold">Add a category</Link></span>}
              required
            />
          </Field>
        </div>

        <Field label="Short description" hint="Shown under the title on the product page">
          <input type="text" value={values.short_description} onChange={(e) => set('short_description', e.target.value)} className={inputClass} maxLength={200} />
        </Field>
      </section>

      <section className="space-y-3">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Images</h4>
        <ImageUploader images={values.images} onChange={(imgs) => set('images', imgs)} onBusyChange={setImagesUploading} />
        {errors.images && <p className="text-[10px] text-rose-600">{errors.images}</p>}
      </section>

      <section className="space-y-3">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Pricing & inventory</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="MRP (৳)" error={errors.regular_price}>
            <input type="number" min={0} inputMode="decimal" value={values.regular_price} onChange={(e) => set('regular_price', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Selling price (৳) *" error={errors.sale_price} hint={discount > 0 ? `${discount}% off` : undefined}>
            <input type="number" min={0} inputMode="decimal" value={values.sale_price} onChange={(e) => set('sale_price', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Stock qty *" error={errors.stock}>
            <input type="number" min={0} inputMode="numeric" value={values.stock} onChange={(e) => set('stock', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Low stock alert at">
            <input type="number" min={0} inputMode="numeric" value={values.low_stock_threshold} onChange={(e) => set('low_stock_threshold', e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="SKU">
            <input type="text" value={values.sku} onChange={(e) => set('sku', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Tags" hint="Comma separated, helps search (e.g. vitamin c, glow)">
            <input type="text" value={values.tags} onChange={(e) => set('tags', e.target.value)} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Details</h4>
        <Field label="Description">
          <textarea rows={4} value={values.description} onChange={(e) => set('description', e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="How to use">
            <textarea rows={3} value={values.how_to_use} onChange={(e) => set('how_to_use', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Ingredients">
            <textarea rows={3} value={values.ingredients} onChange={(e) => set('ingredients', e.target.value)} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Visibility</h4>
        <div className="grid grid-cols-2 gap-2">
          <Toggle label="Visible on store" checked={values.is_active} onChange={(v) => set('is_active', v)} />
          <Toggle label="New arrival" checked={values.is_new} onChange={(v) => set('is_new', v)} />
          <Toggle label="Featured" checked={values.featured} onChange={(v) => set('featured', v)} />
          <Toggle label="Bestseller" checked={values.bestseller} onChange={(v) => set('bestseller', v)} />
        </div>
      </section>

      {serverError && (
        <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{serverError}</p>
      )}

      <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving || imagesUploading}
          className="px-5 py-2 bg-sg-pink hover:bg-sg-pink-hover disabled:opacity-60 disabled:cursor-wait text-white rounded-full text-xs font-bold shadow-md shadow-sg-pink/20"
        >
          {imagesUploading ? 'Uploading photos…' : isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Add product'}
        </button>
      </div>
    </form>
  );
}
