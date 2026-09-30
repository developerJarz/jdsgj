import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerProducts, getNavData } from '@/lib/serverData';
import ShopClient from '@/components/shop/ShopClient';
import ProductGridSkeleton from '@/components/product/ProductGridSkeleton';

export const metadata: Metadata = {
  title: 'Shop Authentic Beauty Products | Shajgoj.bd',
  description: 'Browse makeup, skincare, haircare and fragrance from 450+ authentic brands with fast delivery across Bangladesh.',
};

// Catalog comes from MongoDB via the tagged cache, so products added in the
// admin panel appear here immediately.
export const revalidate = 300;

export default async function ShopPage() {
  const [products, { categories, brands }] = await Promise.all([getServerProducts(), getNavData()]);

  return (
    <Suspense fallback={<ProductGridSkeleton withSidebar />}>
      <ShopClient products={products} categories={categories} brands={brands} />
    </Suspense>
  );
}
