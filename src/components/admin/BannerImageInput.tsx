"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif';

interface BannerImageInputProps {
  value: string;
  onChange: (url: string) => void;
  onBusyChange?: (busy: boolean) => void;
  /** Shown under the field, e.g. the recommended banner size. */
  hint?: string;
  inputClassName?: string;
}

/**
 * Banner image field: paste an image URL or upload a file. Banners are wide,
 * so files upload at full resolution (no browser downscaling).
 */
export default function BannerImageInput({ value, onChange, onBusyChange, hint, inputClassName }: BannerImageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    if (!ACCEPT.split(',').includes(file.type)) return setError('Use a JPG, PNG, WebP, AVIF or GIF image.');
    if (file.size > MAX_BYTES) return setError('Image must be under 4 MB.');
    setUploading(true);
    onBusyChange?.(true);
    try {
      const form = new FormData();
      form.append('files', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message || json?.error || 'Upload failed');
      onChange(json.images[0].url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      onBusyChange?.(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="url"
          placeholder="Image URL *"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName ?? 'w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sg-pink'}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="shrink-0 px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload image'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }}
        />
      </div>
      {hint && <p className="text-[10px] text-gray-500">{hint}</p>}
      {error && <p role="alert" className="text-[11px] font-semibold text-rose-600">{error}</p>}
      {value && (
        <div className="relative w-full h-24 bg-white rounded-lg overflow-hidden border border-gray-100">
          <Image src={value} alt="" fill className="object-contain" />
        </div>
      )}
    </div>
  );
}
