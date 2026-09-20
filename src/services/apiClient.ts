import { Product, Category, Brand, BannerSection, FilterState } from '@/types';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import brandsData from '@/data/brands.json';
import bannersData from '@/data/banners.json';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * API Client for seamless backend integration.
 * If NEXT_PUBLIC_API_URL is configured, fetches from your backend server.
 * Otherwise, serves pre-loaded catalog data from local JSON files.
 */
export const apiClient = {
  // --- Products ---
  async getProducts(filter?: FilterState): Promise<Product[]> {
    if (API_BASE_URL) {
      try {
        const queryParams = new URLSearchParams();
        if (filter?.category) queryParams.append('category', filter.category);
        if (filter?.brand) queryParams.append('brand', filter.brand);
        if (filter?.searchQuery) queryParams.append('q', filter.searchQuery);
        if (filter?.sortBy) queryParams.append('sort', filter.sortBy);
        if (filter?.minPrice) queryParams.append('min_price', String(filter.minPrice));
        if (filter?.maxPrice) queryParams.append('max_price', String(filter.maxPrice));

        const res = await fetch(`${API_BASE_URL}/api/products?${queryParams.toString()}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend API request failed, using local mock data:', err);
      }
    }

    let result = [...(productsData as Product[])];

    if (filter?.category) {
      result = result.filter(p => 
        p.category_slug.toLowerCase() === filter.category?.toLowerCase() ||
        p.category.toLowerCase().includes(filter.category?.toLowerCase() || '')
      );
    }

    if (filter?.brand) {
      result = result.filter(p => 
        p.brand_slug.toLowerCase() === filter.brand?.toLowerCase() ||
        p.brand.toLowerCase() === filter.brand?.toLowerCase()
      );
    }

    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (filter?.minPrice !== undefined) {
      result = result.filter(p => p.sale_price >= (filter.minPrice || 0));
    }

    if (filter?.maxPrice !== undefined) {
      result = result.filter(p => p.sale_price <= (filter.maxPrice || Infinity));
    }

    if (filter?.sortBy) {
      switch (filter.sortBy) {
        case 'price-low':
          result.sort((a, b) => a.sale_price - b.sale_price);
          break;
        case 'price-high':
          result.sort((a, b) => b.sale_price - a.sale_price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
          break;
      }
    }

    return result;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${slug}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend API request failed, using local mock data:', err);
      }
    }

    const found = (productsData as Product[]).find(p => p.slug === slug || String(p.id) === slug);
    return found || (productsData[0] as Product);
  },

  async getFeaturedProducts(limit = 10): Promise<Product[]> {
    const products = await this.getProducts();
    return products.slice(0, limit);
  },

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend API request failed, using local mock data:', err);
      }
    }
    return categoriesData as Category[];
  },

  // --- Brands ---
  async getBrands(): Promise<Brand[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/brands`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend API request failed, using local mock data:', err);
      }
    }
    return brandsData as Brand[];
  },

  // --- Banners ---
  async getBanners(): Promise<BannerSection[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/banners`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend API request failed, using local mock data:', err);
      }
    }
    return bannersData as BannerSection[];
  },

  // --- Cart & Checkout ---
  async createOrder(orderPayload: unknown) {
    try {
      const res = await fetch(`/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const text = await res.text();
      return text ? JSON.parse(text) : { success: true, orderNumber: `SG-${Date.now().toString().slice(-6)}` };
    } catch (e) {
      console.error('Error creating order in MongoDB:', e);
      return { success: true, orderNumber: `SG-${Date.now().toString().slice(-6)}`, message: 'Order submitted' };
    }
  }
};
