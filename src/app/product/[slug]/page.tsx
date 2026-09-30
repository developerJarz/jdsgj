import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerProducts, getServerProductBySlug, getServerRelatedProducts } from '@/lib/serverData';
import ProductDetailClient from '@/components/product/ProductDetailClient';
import { richTextToPlain } from '@/components/product/RichText';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Product data is cached and tag-invalidated when admins edit the catalog.
export const revalidate = 300;

// Prerender the most popular products at build time; every other product page
// is generated on its first visit and then served from the cache.
export async function generateStaticParams() {
  const products = await getServerProducts();
  return products.slice(0, 50).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getServerProductBySlug(slug);
  if (!product) return { title: 'Product Not Found | Shajgoj.bd' };

  return {
    title: `${product.name} | Shajgoj.bd`,
    description:
      richTextToPlain(product.short_description || product.description) ||
      `Buy authentic ${product.name} by ${product.brand} online in Bangladesh.`,
    openGraph: {
      images: product.thumbnail ? [product.thumbnail] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getServerProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getServerRelatedProducts(product);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
