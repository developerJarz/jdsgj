import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BannerItem } from '@/types';

interface ConcernSectionProps {
  items: BannerItem[];
}

export default function ConcernSection({ items }: ConcernSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-6">
      <h2 className="text-center font-bold text-xs uppercase tracking-wider mb-4 text-sg-black">
        SHOP BY CONCERN
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.url}
            className="group block p-3 bg-white rounded-xl border border-gray-100 hover:border-sg-pink/30 hover:shadow-sm text-center transition-all duration-300"
          >
            <div className="relative w-16 h-16 mx-auto rounded-full bg-sg-pink-light/40 flex items-center justify-center overflow-hidden mb-2 border border-sg-pink-border/30">
              <Image
                src={item.image}
                alt={item.title || "Concern"}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-xs font-semibold text-sg-black group-hover:text-sg-pink transition-colors line-clamp-1">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
