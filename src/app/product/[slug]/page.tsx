import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import productsData from '@/data/products.json';
import { Product } from '@/types';
import ProductDetailClient from '@/components/product/ProductDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Direct synchronous lookup from static JSON — zero network delay
  const allProducts = productsData as unknown as Product[];
  const product = allProducts.find(
    (p) => p.slug === slug || String(p.id) === slug
  );

  if (!product) {
    // Fallback: show first product if slug not found (matches old behavior)
    const fallback = allProducts[0];
    if (!fallback) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
          <h2 className="text-xl font-bold text-sg-black">Product Not Found</h2>
          <p className="text-xs text-gray-500">We couldn&apos;t locate this beauty item.</p>
          <Link href="/shop" className="inline-block px-5 py-2 bg-sg-pink text-white rounded-full text-xs font-bold">
            Back to Shop
          </Link>
        </div>
      );
    }

    const related = allProducts
      .filter((p) => p.category_slug === fallback.category_slug && p.id !== fallback.id)
      .slice(0, 5);

    return <ProductDetailClient product={fallback} relatedProducts={related} />;
  }

  // Find related products from same category
  const relatedProducts = allProducts
    .filter((p) => p.category_slug === product.category_slug && p.id !== product.id)
    .slice(0, 5);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
