import React from 'react';
import { FlameIcon, ZapIcon, SparklesIcon } from '@/components/common/Icons';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/services/apiClient';
import HeroSlider from '@/components/home/HeroSlider';
import DealsSection from '@/components/home/DealsSection';
import BrandsSection from '@/components/home/BrandsSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import ConcernSection from '@/components/home/ConcernSection';
import ProductGrid from '@/components/product/ProductGrid';

export default async function HomePage() {
  const [products, categories, banners] = await Promise.all([
    apiClient.getProducts(),
    apiClient.getCategories(),
    apiClient.getBanners(),
  ]);

  // Extract banner sections
  const heroSliderData = banners.find(b => b.widget_name === 'hero_slider')?.items.map(item => ({
    id: Number(item.id),
    title: item.title || '',
    image: item.image,
    url: item.url,
    alt: item.alt || item.title || 'Shajgoj Banner'
  }));

  const dealsYouCannotMiss = banners.find(b => b.id === 'deals-cannot-miss')?.items || [];
  const topBrandsOffers = banners.find(b => b.id === 'top-brands-offers')?.items || [];
  const limitedTimeOffers = banners.find(b => b.id === 'limited-time-offers')?.items || [];
  const shopByConcerns = banners.find(b => b.id === 'shop-by-concerns')?.items || [];

  // Segment products
  const bestsellers = products.slice(0, 10);
  const hotDeals = products.filter(p => p.has_sale).slice(0, 10);
  const newArrivals = products.filter(p => p.is_new).slice(0, 10);

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Main Hero Carousel */}
      <HeroSlider slides={heroSliderData} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 2. Ponds Miracle Prime Highlight Banner */}
        <div className="pt-2">
          <Link
            href="/shop?brand=ponds"
            className="block relative w-full aspect-[1920/380] rounded-xl overflow-hidden shadow-xs hover:opacity-95 transition-opacity"
          >
            <Image
              src="https://bk.shajgoj.com/storage/2026/08/prime-banner-ponds-miracle-me-web.png"
              alt="Ponds Miracle Prime Banner"
              fill
              className="object-cover"
              priority
            />
          </Link>
        </div>

        {/* 3. Deals You Cannot Miss (4-Columns) */}
        <DealsSection
          title="DEALS YOU CANNOT MISS"
          items={dealsYouCannotMiss}
          columns={4}
        />

        {/* 6. Limited Time Offers Grid */}
        <DealsSection
          title="LIMITED TIME OFFERS & COMBOS"
          items={limitedTimeOffers}
          columns={4}
        />



        {/* 4. Bestselling Products Grid */}
        <ProductGrid
          title={<span className="flex items-center gap-2"><FlameIcon className="w-5 h-5 text-sg-pink" /> BESTSELLERS & TOP RATED</span>}
          subtitle="Customer favorites backed by 100% authenticity guarantee"
          products={bestsellers}
          viewAllHref="/shop"
        />

        {/* 5. Top Brands & Offers (3-Columns) */}
        <BrandsSection
          title="TOP BRANDS & OFFERS"
          items={topBrandsOffers}
        />


        {/* 7. Flash Sale & Deals Product Grid */}
        <ProductGrid
          title={<span className="flex items-center gap-2"><ZapIcon className="w-5 h-5 text-sg-pink" /> SPECIAL DEALS & DISCOUNTS</span>}
          subtitle="Exclusive discounted beauty essentials for you"
          products={hotDeals}
          viewAllHref="/shop?offer=special"
        />

        {/* 8. Shop Beauty Products by Category */}
        <CategoriesSection categories={categories} />

        {/* 9. Shop By Concerns Circular Highlights */}
        <ConcernSection items={shopByConcerns} />

        {/* 10. New Arrivals Product Grid */}
        <ProductGrid
          title={<span className="flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-sg-pink" /> NEW ARRIVALS</span>}
          subtitle="Just launched genuine skincare and cosmetics"
          products={newArrivals.length > 0 ? newArrivals : products.slice(10, 20)}
          viewAllHref="/shop?sort=newest"
        />
      </div>
    </div>
  );
}
