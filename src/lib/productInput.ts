import { Brand } from '@/models/Brand';
import { Category } from '@/models/Category';

export const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Escape user input before using it inside a RegExp (prevents regex injection / ReDoS). */
export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export type ProductInput = Record<string, unknown>;

export interface PricingFields {
  sale_price?: number;
  regular_price?: number;
  price?: number;
  discount_percentage?: number;
  has_sale?: boolean;
  reward_points?: number;
}

export interface ProductFields extends PricingFields {
  name?: string;
  short_description?: string;
  description?: string;
  how_to_use?: string;
  ingredients?: string;
  sku?: string;
  seo_title?: string;
  seo_description?: string;
  is_new?: boolean;
  is_active?: boolean;
  featured?: boolean;
  bestseller?: boolean;
  stock?: number;
  low_stock_threshold?: number;
  cost_price?: number;
  tags?: string[];
  images?: string[];
  thumbnail?: string;
  brand?: string;
  brand_slug?: string;
  category?: string;
  category_slug?: string;
  categories?: string[];
}

const TEXT_FIELDS = ['short_description', 'description', 'how_to_use', 'ingredients', 'sku', 'seo_title', 'seo_description'] as const;
const FLAG_FIELDS = ['is_new', 'is_active', 'featured', 'bestseller'] as const;

const toNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const toStringList = (value: unknown) =>
  Array.isArray(value)
    ? value.map(v => String(v).trim()).filter(Boolean)
    : typeof value === 'string'
      ? value.split(',').map(v => v.trim()).filter(Boolean)
      : undefined;

/**
 * Normalises an admin product form payload into Product model fields.
 * Brand and category are resolved against MongoDB so the product always links
 * to a real brand/category record (keeps shop filters and menus in sync).
 * Only fields present in the payload are returned, so it works for partial PUTs.
 */
export async function buildProductFields(body: ProductInput): Promise<ProductFields> {
  const fields: ProductFields = {};

  if (typeof body.name === 'string') fields.name = body.name.trim();
  for (const key of TEXT_FIELDS) {
    const value = body[key];
    if (typeof value === 'string') fields[key] = value.trim();
  }
  for (const key of FLAG_FIELDS) {
    const value = body[key];
    if (typeof value === 'boolean') fields[key] = value;
  }

  const stock = toNumber(body.stock);
  if (stock !== undefined) fields.stock = Math.max(0, Math.round(stock));
  const threshold = toNumber(body.low_stock_threshold);
  if (threshold !== undefined) fields.low_stock_threshold = Math.max(0, Math.round(threshold));
  const cost = toNumber(body.cost_price);
  if (cost !== undefined) fields.cost_price = Math.max(0, cost);

  const tags = toStringList(body.tags);
  if (tags) fields.tags = tags;

  const images = toStringList(body.images);
  if (images) {
    fields.images = images;
    if (!body.thumbnail && images[0]) fields.thumbnail = images[0];
  }
  if (typeof body.thumbnail === 'string' && body.thumbnail.trim()) fields.thumbnail = body.thumbnail.trim();

  // Brand: accept a Brand _id, a slug, or a free-text name
  if (body.brand_id || body.brand) {
    const key = String(body.brand_id || body.brand);
    const brand = /^[a-f0-9]{24}$/i.test(key)
      ? await Brand.findById(key).lean()
      : await Brand.findOne({ $or: [{ slug: slugify(key) }, { name: new RegExp(`^${escapeRegex(key)}$`, 'i') }] }).lean();
    fields.brand = brand?.name ?? key;
    fields.brand_slug = brand?.slug ?? slugify(key);
  }

  // Category: accept a Category _id, its `id`, a slug, or a name
  if (body.category_id || body.category) {
    const key = String(body.category_id || body.category);
    const category = await Category.findOne({
      $or: [
        ...(/^[a-f0-9]{24}$/i.test(key) ? [{ _id: key }] : []),
        { id: key },
        { slug: slugify(key) },
        { name: new RegExp(`^${escapeRegex(key)}$`, 'i') },
      ],
    }).lean();
    fields.category = category?.name ?? key;
    fields.category_slug = category?.slug ?? slugify(key);
    fields.categories = [fields.category_slug];
  }

  return fields;
}

/** Applies submitted prices to `target` and recomputes the derived price fields. */
export function applyPricing(target: PricingFields, body: ProductInput) {
  const sale = toNumber(body.sale_price);
  const regular = toNumber(body.regular_price);
  if (sale !== undefined) target.sale_price = Math.max(0, sale);
  if (regular !== undefined) target.regular_price = Math.max(0, regular);

  if (target.sale_price !== undefined) {
    if (!target.regular_price || target.regular_price < target.sale_price) {
      target.regular_price = target.sale_price;
    }
    target.price = target.sale_price;
    target.discount_percentage = target.regular_price > target.sale_price
      ? Math.round(((target.regular_price - target.sale_price) / target.regular_price) * 100)
      : 0;
    target.has_sale = target.discount_percentage > 0;
    target.reward_points = Math.floor(target.sale_price / 10);
  }
}
