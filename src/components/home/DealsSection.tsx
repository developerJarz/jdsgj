import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BannerItem } from '@/types';

interface DealsSectionProps {
  title: string;
  items: BannerItem[];
  columns?: number;
}

export default function DealsSection({ title, items, columns = 4 }: DealsSectionProps) {
  if (!items || items.length === 0) return null;

  const colClasses = columns === 3
    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
    : 'grid-cols-2 md:grid-cols-4';

  return (
    <section className="py-6">
      <h2 className="text-center font-bold text-xs uppercase tracking-wider mb-4 text-sg-black">
        {title}
      </h2>
      <div className={`grid ${colClasses} gap-3`}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.url}
            className="group relative block overflow-hidden rounded-xl bg-gray-100 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={item.image}
                alt={item.title || title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover group-hover:scale-103 transition-transform duration-500"
              />
            </div>
            {item.title && (
              <div className="p-2 text-center bg-white border-t border-gray-100">
                <span className="text-[11px] font-bold text-sg-black group-hover:text-sg-pink transition-colors">
                  {item.title}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
