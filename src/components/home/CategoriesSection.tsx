import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';

interface CategoriesSectionProps {
  categories: Category[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-6">
      <h2 className="text-center font-bold text-xs uppercase tracking-wider mb-4 text-sg-black">
        SHOP BEAUTY PRODUCTS BY CATEGORY
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
        {categories.slice(0, 8).map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className="group relative block rounded-xl overflow-hidden bg-white border border-gray-100 hover:border-sg-pink/30 hover:shadow-md transition-all duration-300"
          >
            <div className="relative w-full aspect-[4/3] bg-gray-50">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sg-pink font-bold text-sm bg-sg-pink-light">
                  {cat.name}
                </div>
              )}
            </div>
            <div className="p-2.5 text-center bg-white border-t border-gray-50">
              <span className="text-xs font-bold text-sg-black group-hover:text-sg-pink transition-colors">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
