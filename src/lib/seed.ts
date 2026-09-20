import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { Banner } from '@/models/Banner';
import { User } from '@/models/User';
import { hashPassword } from '@/lib/auth';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import bannersData from '@/data/banners.json';

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

  // Create default Admin if not exists
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    console.log('🌱 Creating default administrator account...');
    const hashed = await hashPassword('admin123456');
    await User.create({
      name: 'Shajgoj.bd Administrator',
      phone: '01700000000',
      email: 'admin@shajgoj.com',
      password: hashed,
      role: 'admin',
      rewardPoints: 1000,
    });
    console.log('✅ Admin created: admin@shajgoj.com / admin123456 (Phone: 01700000000)');
  }
}
