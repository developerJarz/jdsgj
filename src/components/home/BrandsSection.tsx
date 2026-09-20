import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BannerItem } from '@/types';

interface BrandsSectionProps {
  title?: string;
  items: BannerItem[];
}

export default function BrandsSection({ title = "TOP BRANDS & OFFERS", items }: BrandsSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-6">
      <h2 className="text-center font-bold text-xs uppercase tracking-wider mb-4 text-sg-black">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.url}
            className="group relative block overflow-hidden rounded-xl bg-gray-100 shadow-xs hover:shadow-md transition-all duration-300"
          >
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={item.image}
                alt={item.title || "Brand Offer"}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover group-hover:scale-103 transition-transform duration-500"
              />
            </div>
            {item.title && (
              <div className="p-2 text-center bg-white border-t border-gray-100">
                <span className="text-xs font-bold text-sg-black group-hover:text-sg-pink transition-colors">
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
