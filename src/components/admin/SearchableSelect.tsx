"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  emptyText?: React.ReactNode;
  required?: boolean;
  invalid?: boolean;
}

/** Dropdown with type-to-filter, for long lists like 450+ brands. */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  isLoading = false,
  emptyText = 'No matches',
  required,
  invalid,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen]);

  const choose = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setQuery('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && isOpen) {
      e.preventDefault();
      if (filtered[highlight]) choose(filtered[highlight]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-required={required}
        aria-invalid={invalid}
        value={isOpen ? query : selected?.label ?? ''}
        placeholder={isLoading ? 'Loading…' : selected ? selected.label : placeholder}
        onFocus={() => {
          setIsOpen(true);
          setHighlight(0);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setHighlight(0);
        }}
        onKeyDown={onKeyDown}
        disabled={isLoading}
        className={`w-full bg-gray-50 border rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:bg-white ${
          invalid ? 'border-rose-400 focus:border-rose-500' : 'border-gray-200 focus:border-sg-pink'
        }`}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</span>

      {isOpen && !isLoading && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto custom-scroll bg-white border border-gray-200 rounded-lg shadow-lg py-1"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-gray-400">{emptyText}</li>
          ) : (
            filtered.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(o);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between ${
                  i === highlight ? 'bg-sg-pink-light/60 text-sg-pink' : o.value === value ? 'font-bold text-gray-900' : 'text-gray-700'
                }`}
              >
                <span>{o.label}</span>
                {o.hint && <span className="text-[10px] text-gray-400">{o.hint}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
