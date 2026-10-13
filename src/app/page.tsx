import React from 'react';
import { FlameIcon, ZapIcon, SparklesIcon } from '@/components/common/Icons';
import Link from 'next/link';
import Image from 'next/image';
import { getServerProducts, getServerCategories, getServerBanners, getSiteContent } from '@/lib/serverData';
import HeroSlider from '@/components/home/HeroSlider';
import DealsSection from '@/components/home/DealsSection';
import BrandsSection from '@/components/home/BrandsSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import ConcernSection from '@/components/home/ConcernSection';
import ProductGrid from '@/components/product/ProductGrid';
import { isUnderHeroBanner } from '@/lib/homepageBanners';
import type { HomeSection, SectionIcon } from '@/lib/siteContent';
import type { BannerSection, Product } from '@/types';

// Served from the cache and regenerated in the background. Admin changes to
// products, categories, banners and the homepage layout invalidate the
// underlying data tags, so the homepage stays in sync without querying MongoDB
// on every visit.
export const revalidate = 300;

const ICONS: Record<Exclude<SectionIcon, 'none'>, React.ReactNode> = {
  flame: <FlameIcon className="w-5 h-5 text-sg-pink" />,
  zap: <ZapIcon className="w-5 h-5 text-sg-pink" />,
  sparkles: <SparklesIcon className="w-5 h-5 text-sg-pink" />,
};

const findBanner = (banners: BannerSection[], id?: string) =>
  banners.find((b) => b.id === id || b.widget_name === id);

function productsFor(section: HomeSection, products: Product[]): Product[] {
  const limit = section.limit ?? 10;
  const value = (section.sourceValue ?? '').toLowerCase();
  switch (section.source) {
    case 'on_sale': return products.filter((p) => p.has_sale).slice(0, limit);
    case 'new': {
      const fresh = products.filter((p) => p.is_new).slice(0, limit);
      // Keep the section useful when nothing is flagged as new yet.
      return fresh.length > 0 ? fresh : products.slice(limit, limit * 2);
    }
    case 'category': return products.filter((p) => p.category_slug?.toLowerCase() === value).slice(0, limit);
    case 'brand': return products.filter((p) => p.brand_slug?.toLowerCase() === value).slice(0, limit);
    default: return products.slice(0, limit);
  }
}

export default async function HomePage() {
  const [products, categories, banners, siteContent] = await Promise.all([
    getServerProducts(),
    getServerCategories(),
    getServerBanners(),
    getSiteContent(),
  ]);

  // Order, visibility and options come from Admin → Page Layout Sections.
  const renderSection = (section: HomeSection): React.ReactNode => {
    switch (section.type) {
      case 'hero': {
        const slides = findBanner(banners, 'hero-slider')?.items.map((item) => ({
          id: item.id,
          title: item.title || '',
          image: item.image,
          url: item.url,
          alt: item.alt || item.title || 'Shajgoj Banner',
        }));
        return <HeroSlider slides={slides} interval={section.interval} />;
      }
      case 'under_hero': {
        // Hidden when the banner is switched off in Banners & Hero or has no image
        const items = (banners.find(isUnderHeroBanner)?.items ?? []).filter((item) => item.image);
        if (items.length === 0) return null;
        return (
          <div className="space-y-4">
            {items.map((item, index) => (
              <Link
                key={item.id ?? index}
                href={item.url || '/shop'}
                className="block relative w-full aspect-[1920/380] rounded-xl overflow-hidden shadow-xs hover:opacity-95 transition-opacity"
              >
                <Image src={item.image} alt={item.alt || item.title || 'Shajgoj Banner'} fill className="object-cover" priority={index === 0} />
              </Link>
            ))}
          </div>
        );
      }
      case 'banner_grid': {
        const items = findBanner(banners, section.bannerId)?.items ?? [];
        return section.style === 'brands'
          ? <BrandsSection title={section.title} items={items} />
          : <DealsSection title={section.title ?? ''} items={items} columns={section.columns} />;
      }
      case 'product_grid': {
        const list = productsFor(section, products);
        if (list.length === 0) return null;
        const icon = section.icon && section.icon !== 'none' ? ICONS[section.icon] : null;
        return (
          <ProductGrid
            title={section.title ? <span className="flex items-center gap-2">{icon}{section.title}</span> : undefined}
            subtitle={section.subtitle || undefined}
            products={list}
            viewAllHref={section.viewAllHref || undefined}
          />
        );
      }
      case 'categories':
        return <CategoriesSection categories={categories} title={section.title} limit={section.limit} />;
      case 'concerns':
        return <ConcernSection items={findBanner(banners, 'shop-by-concerns')?.items ?? []} title={section.title} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {siteContent.homeSections.filter((section) => section.enabled).map((section) => {
        const content = renderSection(section);
        if (!content) return null;
        // The hero spans the full width; every other section sits in the page column.
        return section.type === 'hero'
          ? <React.Fragment key={section.id}>{content}</React.Fragment>
          : <div key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{content}</div>;
      })}
    </div>
  );
}
