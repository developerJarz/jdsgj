export interface Product {
  id: number | string;
  name: string;
  slug: string;
  price: number;
  regular_price: number;
  sale_price: number;
  has_sale: boolean;
  discount_percentage: number;
  stock: number;
  rating: number;
  reviews_count?: number;
  brand: string;
  brand_slug: string;
  category: string;
  category_slug: string;
  thumbnail: string;
  images: string[];
  short_description?: string;
  description?: string;
  how_to_use?: string;
  ingredients?: string;
  sku?: string;
  reward_points?: number;
  is_new?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  product_count?: number;
  subcategories?: { name: string; slug: string }[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  is_top?: boolean;
}

export interface BannerItem {
  id: string | number;
  title?: string;
  image: string;
  url: string;
  alt?: string;
  label?: string;
}

export interface BannerSection {
  id: string | number;
  title?: string;
  subtitle?: string;
  widget_name: string;
  columns: number;
  items: BannerItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface FilterState {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
}
