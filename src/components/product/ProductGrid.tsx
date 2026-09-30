import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: React.ReactNode;
  subtitle?: string;
  viewAllHref?: string;
}

export default function ProductGrid({
  products,
  title,
  subtitle,
  viewAllHref
}: ProductGridProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-6">
      {/* Header */}
      {(title || viewAllHref) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className="section-title">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-bold text-sg-pink hover:underline uppercase tracking-wide flex items-center gap-1"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product._id ?? product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
