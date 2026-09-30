import { revalidateTag } from 'next/cache';

/**
 * Cache tags for storefront data. Reads in serverData.ts are cached under these
 * tags; admin mutations call invalidateStorefront() so changes show up on the
 * very next page load instead of waiting for the time-based revalidation.
 */
export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  brands: 'brands',
  banners: 'banners',
  menu: 'menu',
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export function invalidateStorefront(...tags: CacheTag[]) {
  for (const tag of tags) {
    // Route Handlers can't use updateTag; expire immediately so admins see
    // their change on the next storefront request.
    revalidateTag(tag, { expire: 0 });
  }
}
