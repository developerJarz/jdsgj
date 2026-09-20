import { connectToDatabase } from '@/lib/db';
import { Product as ProductModel } from '@/models/Product';
import { Category as CategoryModel } from '@/models/Category';
import { Banner as BannerModel } from '@/models/Banner';
import { Brand as BrandModel } from '@/models/Brand';
import { ensureDatabaseSeeded } from '@/lib/seed';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import brandsData from '@/data/brands.json';
import bannersData from '@/data/banners.json';
import { Product, Category, Brand, BannerSection, FilterState } from '@/types';

/**
 * Server-side data provider with direct MongoDB Atlas live querying.
 * Only imported in Server Components / API Routes (Node.js runtime).
 */
export async function getServerProducts(filter?: FilterState): Promise<Product[]> {
  try {
    await connectToDatabase();
    await ensureDatabaseSeeded();

    const query: any = { is_active: { $ne: false } };

    if (filter?.category) {
      query.$or = [
        { category_slug: new RegExp(`^${filter.category}$`, 'i') },
        { category: new RegExp(filter.category, 'i') },
      ];
    }

    if (filter?.brand) {
      query.brand_slug = new RegExp(`^${filter.brand}$`, 'i');
    }

    if (filter?.searchQuery) {
      query.$or = [
        { name: new RegExp(filter.searchQuery, 'i') },
        { brand: new RegExp(filter.searchQuery, 'i') },
        { category: new RegExp(filter.searchQuery, 'i') },
      ];
    }

    if (filter?.minPrice !== undefined || filter?.maxPrice !== undefined) {
      query.sale_price = {};
      if (filter?.minPrice !== undefined) query.sale_price.$gte = Number(filter.minPrice);
      if (filter?.maxPrice !== undefined) query.sale_price.$lte = Number(filter.maxPrice);
    }

    let mongoQuery = ProductModel.find(query);

    if (filter?.sortBy) {
      switch (filter.sortBy) {
        case 'price-low':
          mongoQuery = mongoQuery.sort({ sale_price: 1 });
          break;
        case 'price-high':
          mongoQuery = mongoQuery.sort({ sale_price: -1 });
          break;
        case 'rating':
          mongoQuery = mongoQuery.sort({ rating: -1 });
          break;
        case 'newest':
          mongoQuery = mongoQuery.sort({ createdAt: -1 });
          break;
        default:
          mongoQuery = mongoQuery.sort({ rating: -1, stock: -1 });
      }
    }

    const products = await mongoQuery.lean();
    if (products && products.length > 0) {
      return JSON.parse(JSON.stringify(products)) as Product[];
    }
  } catch (err) {
    console.warn('DB getProducts fallback:', err);
  }

  return productsData as unknown as Product[];
}

export async function getServerCategories(): Promise<Category[]> {
  try {
    await connectToDatabase();
    await ensureDatabaseSeeded();
    const categories = await CategoryModel.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean();
    if (categories && categories.length > 0) {
      return JSON.parse(JSON.stringify(categories)) as Category[];
    }
  } catch (err) {
    console.warn('DB getCategories fallback:', err);
  }

  return categoriesData as unknown as Category[];
}

export async function getServerBrands(): Promise<Brand[]> {
  try {
    await connectToDatabase();
    const brands = await BrandModel.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean();
    if (brands && brands.length > 0) {
      return JSON.parse(JSON.stringify(brands)) as Brand[];
    }
  } catch (err) {
    console.warn('DB getBrands fallback:', err);
  }

  return brandsData as unknown as Brand[];
}

export async function getServerBanners(): Promise<BannerSection[]> {
  try {
    await connectToDatabase();
    await ensureDatabaseSeeded();
    const banners = await BannerModel.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean();
    if (banners && banners.length > 0) {
      return JSON.parse(JSON.stringify(banners)) as BannerSection[];
    }
  } catch (err) {
    console.warn('DB getBanners fallback:', err);
  }

  return bannersData as unknown as BannerSection[];
}
