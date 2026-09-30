import 'server-only';
import { unstable_cache } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { Product as ProductModel } from '@/models/Product';
import { Category as CategoryModel } from '@/models/Category';
import { Banner as BannerModel } from '@/models/Banner';
import { Brand as BrandModel } from '@/models/Brand';
import { MegaMenu as MegaMenuModel } from '@/models/MegaMenu';
import { ensureDatabaseSeeded } from '@/lib/seed';
import { CACHE_TAGS } from '@/lib/cacheTags';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import brandsData from '@/data/brands.json';
import bannersData from '@/data/banners.json';
import { Product, Category, Brand, BannerSection, NavMenuItem, NavData } from '@/types';

/**
 * Server-side data provider for the storefront.
 *
 * Every read is cached with unstable_cache and tagged (see cacheTags.ts), so a
 * page view no longer costs a round-trip to MongoDB Atlas. Admin mutations
 * invalidate the relevant tag, which keeps the storefront in sync instantly.
 *
 * The cached functions throw on DB failure so an outage is never cached; the
 * exported wrappers catch and fall back to the bundled JSON instead.
 */

// Time-based safety net in case a mutation path forgets to invalidate.
const REVALIDATE_SECONDS = 300;

function serialize<T>(docs: unknown): T {
  return JSON.parse(JSON.stringify(docs)) as T;
}

let seedChecked = false;
async function seedIfEmpty(isEmpty: boolean) {
  if (!isEmpty || seedChecked) return false;
  seedChecked = true;
  await ensureDatabaseSeeded();
  return true;
}

const cachedAllProducts = unstable_cache(
  async (): Promise<Product[]> => {
    await connectToDatabase();
    const query = { is_active: { $ne: false } };
    let products = await ProductModel.find(query).sort({ rating: -1, stock: -1 }).lean();
    if (await seedIfEmpty(products.length === 0)) {
      products = await ProductModel.find(query).sort({ rating: -1, stock: -1 }).lean();
    }
    return serialize<Product[]>(products);
  },
  ['storefront-products'],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS }
);

const cachedProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    await connectToDatabase();
    const product = await ProductModel.findOne({
      $or: [{ slug }, { id: slug }],
      is_active: { $ne: false },
    }).lean();
    return product ? serialize<Product>(product) : null;
  },
  ['storefront-product-by-slug'],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS }
);

const cachedRelatedProducts = unstable_cache(
  async (categorySlug: string, excludeSlug: string): Promise<Product[]> => {
    await connectToDatabase();
    const related = await ProductModel.find({
      category_slug: categorySlug,
      slug: { $ne: excludeSlug },
      is_active: { $ne: false },
    })
      .sort({ rating: -1, sold_count: -1 })
      .limit(5)
      .lean();
    return serialize<Product[]>(related);
  },
  ['storefront-related-products'],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS }
);

const cachedCategories = unstable_cache(
  async (): Promise<Category[]> => {
    await connectToDatabase();
    const categories = await CategoryModel.find({ isActive: { $ne: false } }).sort({ order: 1, name: 1 }).lean();
    return serialize<Category[]>(categories);
  },
  ['storefront-categories'],
  { tags: [CACHE_TAGS.categories], revalidate: REVALIDATE_SECONDS }
);

const cachedBrands = unstable_cache(
  async (): Promise<Brand[]> => {
    await connectToDatabase();
    const brands = await BrandModel.find({ isActive: { $ne: false } }).sort({ order: 1, name: 1 }).lean();
    return serialize<Brand[]>(brands);
  },
  ['storefront-brands'],
  { tags: [CACHE_TAGS.brands], revalidate: REVALIDATE_SECONDS }
);

const cachedBanners = unstable_cache(
  async (): Promise<BannerSection[]> => {
    await connectToDatabase();
    const banners = await BannerModel.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean();
    return serialize<BannerSection[]>(banners);
  },
  ['storefront-banners'],
  { tags: [CACHE_TAGS.banners], revalidate: REVALIDATE_SECONDS }
);

const cachedMenu = unstable_cache(
  async (): Promise<NavMenuItem[]> => {
    await connectToDatabase();
    const menu = await MegaMenuModel.find({ isActive: true }).sort({ position: 1 }).lean();
    return serialize<NavMenuItem[]>(menu);
  },
  ['storefront-menu'],
  { tags: [CACHE_TAGS.menu], revalidate: REVALIDATE_SECONDS }
);

export async function getServerProducts(): Promise<Product[]> {
  try {
    const products = await cachedAllProducts();
    if (products.length > 0) return products;
  } catch (err) {
    console.warn('DB getProducts fallback:', err);
  }
  return productsData as unknown as Product[];
}

export async function getServerProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await cachedProductBySlug(slug);
  } catch (err) {
    console.warn('DB getProductBySlug fallback:', err);
    const fallback = productsData as unknown as Product[];
    return fallback.find((p) => p.slug === slug || String(p.id) === slug) ?? null;
  }
}

export async function getServerRelatedProducts(product: Product): Promise<Product[]> {
  try {
    return await cachedRelatedProducts(product.category_slug, product.slug);
  } catch (err) {
    console.warn('DB getRelatedProducts fallback:', err);
    return (productsData as unknown as Product[])
      .filter((p) => p.category_slug === product.category_slug && p.slug !== product.slug)
      .slice(0, 5);
  }
}

export async function getServerCategories(): Promise<Category[]> {
  try {
    const categories = await cachedCategories();
    if (categories.length > 0) return categories;
  } catch (err) {
    console.warn('DB getCategories fallback:', err);
  }
  return categoriesData as unknown as Category[];
}

export async function getServerBrands(): Promise<Brand[]> {
  try {
    const brands = await cachedBrands();
    if (brands.length > 0) return brands;
  } catch (err) {
    console.warn('DB getBrands fallback:', err);
  }
  return brandsData as unknown as Brand[];
}

export async function getServerBanners(): Promise<BannerSection[]> {
  try {
    const banners = await cachedBanners();
    if (banners.length > 0) return banners;
  } catch (err) {
    console.warn('DB getBanners fallback:', err);
  }
  return bannersData as unknown as BannerSection[];
}

async function getServerMenu(): Promise<NavMenuItem[]> {
  try {
    return await cachedMenu();
  } catch (err) {
    console.warn('DB getMenu fallback:', err);
    return [];
  }
}

/**
 * Everything the storefront header/drawer needs, fetched once in the root
 * layout and passed down as props. Keeps catalog JSON out of the client bundle.
 */
export async function getNavData(): Promise<NavData> {
  const [menu, categories, brands] = await Promise.all([
    getServerMenu(),
    getServerCategories(),
    getServerBrands(),
  ]);

  // DB brands have no `id` field (only `_id`); the bundled JSON has `id`.
  const docId = (doc: { id?: string | number; _id?: string }) => String(doc.id ?? doc._id ?? '');

  return {
    menu,
    categories: categories.map((c) => ({ id: docId(c), name: c.name, slug: c.slug, image: c.image })),
    brands: brands.map((b) => ({ id: docId(b), name: b.name, slug: b.slug, logo: b.logo, is_top: b.is_top })),
  };
}
