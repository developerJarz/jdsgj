import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { Banner } from '@/models/Banner';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import bannersData from '@/data/banners.json';
import { UNDER_HERO_BANNER } from '@/lib/homepageBanners';

export async function ensureDatabaseSeeded(force: boolean = false) {
  await connectToDatabase();

  const productCount = await Product.countDocuments();
  if (productCount === 0 || force) {
    if (force) await Product.deleteMany({});
    console.log('🌱 Seeding products into MongoDB Atlas...');
    await Product.insertMany(productsData);
    console.log(`✅ Seeded ${productsData.length} products`);
  }

  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0 || force) {
    if (force) await Category.deleteMany({});
    console.log('🌱 Seeding categories into MongoDB Atlas...');
    await Category.insertMany(categoriesData);
    console.log(`✅ Seeded ${categoriesData.length} categories`);
  }

  const bannerCount = await Banner.countDocuments();
  if (bannerCount === 0 || force) {
    if (force) await Banner.deleteMany({});
    console.log('🌱 Seeding banners into MongoDB Atlas...');
    await Banner.insertMany(bannersData);
    console.log(`✅ Seeded ${bannersData.length} banner sections`);
  }
}

/** Creates the under-hero banner slot once, so admins can edit it. Returns true if it was just created. */
export async function ensureUnderHeroBanner(): Promise<boolean> {
  await connectToDatabase();
  const result = await Banner.updateOne(
    { $or: [{ id: UNDER_HERO_BANNER.id }, { widget_name: UNDER_HERO_BANNER.widget_name }] },
    { $setOnInsert: UNDER_HERO_BANNER },
    { upsert: true },
  );
  return result.upsertedCount > 0;
}
