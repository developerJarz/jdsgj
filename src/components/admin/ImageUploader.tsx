"use client";

import React, { useEffect, useRef, useState } from 'react';

const MAX_DIMENSION = 1600;
const COMPRESS_ABOVE_BYTES = 600 * 1024;
const MAX_PARALLEL = 3;

/**
 * Downscale large photos in the browser before uploading (max 1600px, WebP).
 * Keeps uploads fast on mobile data and product pages light.
 */
async function compressImage(file: File): Promise<File> {
  if (file.type === 'image/gif' || file.size <= COMPRESS_ABOVE_BYTES) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
  } catch {
    return file;
  }
}

/** Single-file upload with real progress (fetch can't report upload progress). */
function uploadWithProgress(file: File, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('files', file);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && json.success) resolve(json.images[0].url);
        else reject(new Error(json.message || json.error || 'Upload failed'));
      } catch {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Network error — check your connection'));
    xhr.open('POST', '/api/admin/upload');
    xhr.send(form);
  });
}

interface PendingUpload {
  key: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  onBusyChange?: (busy: boolean) => void;
  max?: number;
}

export default function ImageUploader({ images, onChange, onBusyChange, max = 8 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [provider, setProvider] = useState<'cloudinary' | 'database' | null>(null);

  // Keep a live reference so parallel uploads append to the latest list
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const isBusy = pending.some((p) => !p.error);
  useEffect(() => {
    onBusyChange?.(isBusy);
  }, [isBusy, onBusyChange]);

  useEffect(() => {
    fetch('/api/admin/upload')
      .then((r) => r.json())
      .then((json) => json.success && setProvider(json.provider))
      .catch(() => {});
  }, []);

  const remaining = max - images.length - pending.length;

  const runUpload = async (item: PendingUpload) => {
    try {
      const prepared = await compressImage(item.file);
      const url = await uploadWithProgress(prepared, (progress) =>
        setPending((list) => list.map((p) => (p.key === item.key ? { ...p, progress } : p)))
      );
      const next = [...imagesRef.current, url];
      imagesRef.current = next;
      onChange(next);
      setPending((list) => list.filter((p) => p.key !== item.key));
      URL.revokeObjectURL(item.preview);
    } catch (err) {
      setPending((list) => list.map((p) => (p.key === item.key ? { ...p, error: (err as Error).message } : p)));
    }
  };

  const addFiles = async (fileList: FileList | File[]) => {
    setNotice(null);
    const all = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (all.length === 0) {
      setNotice('Choose JPG, PNG or WebP images.');
      return;
    }
    if (remaining <= 0) {
      setNotice(`A product can have up to ${max} images. Remove one to add another.`);
      return;
    }
    const accepted = all.slice(0, remaining);
    if (accepted.length < all.length) setNotice(`Only ${accepted.length} of ${all.length} images were added (limit ${max}).`);

    const items = accepted.map((file) => ({
      key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));
    setPending((list) => [...list, ...items]);

    // Upload a few at a time so one slow photo doesn't block the rest
    const queue = [...items];
    const worker = async () => {
      for (let item = queue.shift(); item; item = queue.shift()) await runUpload(item);
    };
    await Promise.all(Array.from({ length: Math.min(MAX_PARALLEL, queue.length) }, worker));
    if (inputRef.current) inputRef.current.value = '';
  };

  const retry = (item: PendingUpload) => {
    setPending((list) => list.map((p) => (p.key === item.key ? { ...p, error: undefined, progress: 0 } : p)));
    runUpload({ ...item, error: undefined, progress: 0 });
  };

  const dismiss = (item: PendingUpload) => {
    URL.revokeObjectURL(item.preview);
    setPending((list) => list.filter((p) => p.key !== item.key));
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      setNotice('Paste a full image link that starts with https://');
      return;
    }
    if (remaining <= 0) return;
    onChange([...images, url]);
    setUrlInput('');
    setNotice(null);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'));
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  };

  const tileBase = 'relative rounded-xl overflow-hidden border bg-white';

  return (
    <div className="space-y-3" onPaste={handlePaste}>
      {(images.length > 0 || pending.length > 0) && (
        <ul className="grid grid-cols-4 sm:grid-cols-5 gap-2 auto-rows-fr">
          {images.map((src, i) => {
            const isCover = i === 0;
            return (
              <li
                key={`${src}-${i}`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dragIndex !== null) move(dragIndex, i);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={`${tileBase} group cursor-grab active:cursor-grabbing ${
                  isCover ? 'col-span-2 row-span-2 border-sg-pink/40' : 'aspect-square border-gray-200'
                } ${dragIndex === i ? 'opacity-40' : ''}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={isCover ? 'Cover image' : `Image ${i + 1}`} className="w-full h-full object-contain p-1" draggable={false} />
                {isCover && (
                  <span className="absolute left-2 top-2 rounded-full bg-sg-pink px-2 py-0.5 text-[10px] font-bold text-white">
                    Cover
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-1.5 bg-gradient-to-t from-black/65 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="h-6 w-6 rounded bg-white/90 text-xs font-bold text-gray-700 disabled:opacity-40" aria-label="Move earlier">‹</button>
                    <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="h-6 w-6 rounded bg-white/90 text-xs font-bold text-gray-700 disabled:opacity-40" aria-label="Move later">›</button>
                  </div>
                  {!isCover && (
                    <button type="button" onClick={() => move(i, 0)} className="h-6 px-2 rounded bg-white/90 text-[10px] font-bold text-gray-800">
                      Make cover
                    </button>
                  )}
                  <button type="button" onClick={() => onChange(images.filter((_, idx) => idx !== i))} className="h-6 w-6 rounded bg-rose-600 text-xs font-bold text-white" aria-label="Remove image">
                    ✕
                  </button>
                </div>
              </li>
            );
          })}

          {pending.map((item) => (
            <li key={item.key} className={`${tileBase} aspect-square ${item.error ? 'border-rose-300' : 'border-gray-200'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.preview} alt="" className={`w-full h-full object-contain p-1 ${item.error ? 'opacity-40' : 'opacity-60'}`} />
              {item.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/70 p-1.5 text-center">
                  <p className="text-[10px] font-semibold text-rose-700 leading-tight line-clamp-2" title={item.error}>{item.error}</p>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => retry(item)} className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-bold text-white">Retry</button>
                    <button type="button" onClick={() => dismiss(item)} className="px-2 py-0.5 rounded border border-gray-300 bg-white text-[10px] font-bold text-gray-700">Remove</button>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-x-2 bottom-2" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${item.file.name}`}>
                  <div className="h-1.5 rounded-full bg-white/80 overflow-hidden">
                    <div className="h-full bg-sg-pink transition-[width] duration-200" style={{ width: `${Math.max(6, item.progress)}%` }} />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (dragIndex === null) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (dragIndex === null) addFiles(e.dataTransfer.files);
          }}
          className={`flex items-center gap-4 rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sg-pink/40 ${
            isDragging ? 'border-sg-pink bg-sg-pink-light/60' : 'border-gray-200 bg-gray-50 hover:border-sg-pink/60 hover:bg-white'
          }`}
        >
          <span className="w-10 h-10 shrink-0 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sg-pink">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
          </span>
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-800">
              {isDragging ? 'Drop to upload' : images.length === 0 ? 'Add product photos' : 'Add more photos'}
            </p>
            <p className="text-[11px] text-gray-500">
              Drag files here, click to browse, or paste with Ctrl+V. {remaining} of {max} left. Large photos are resized automatically.
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            multiple
            hidden
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>
      )}

      {remaining > 0 && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="Or paste an image link"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sg-pink"
          />
          <button type="button" onClick={addUrl} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:border-sg-pink hover:text-sg-pink">
            Add link
          </button>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        {notice ? <p className="text-[11px] font-semibold text-amber-700">{notice}</p> : <span />}
        {provider && (
          <p className="text-[10px] text-gray-400 text-right shrink-0">
            {provider === 'cloudinary' ? 'Stored on Cloudinary' : 'Stored in your database (Cloudinary not connected)'}
          </p>
        )}
      </div>
    </div>
  );
}
