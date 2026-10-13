// Storefront content managed from Admin → Page Layout Sections: the homepage
// section order/options, the top announcement bar and the footer. Shared by
// the admin editor, the API (validation) and the storefront (rendering), so it
// must stay free of server-only imports.

/** SiteSettings document that stores this content. */
export const SITE_CONTENT_ID = 'storefront';

export const HOME_SECTION_TYPES = {
  hero: { label: 'Hero slider', description: 'Main image carousel at the top (images from Banners & Hero → Hero Slider).', single: true },
  under_hero: { label: 'Banner under hero', description: 'Wide banner below the hero (image from Banners & Hero → Banner Under Hero).', single: true },
  banner_grid: { label: 'Banner grid', description: 'Promotional images from any banner group in Banners & Hero.', single: false },
  product_grid: { label: 'Product grid', description: 'Products picked automatically: bestsellers, sale, new, or a category/brand.', single: false },
  categories: { label: 'Shop by category', description: 'Category tiles from your catalog.', single: true },
  concerns: { label: 'Shop by concern', description: 'Concern tiles (images from Banners & Hero → Shop By Concerns).', single: true },
} as const;

export type HomeSectionType = keyof typeof HOME_SECTION_TYPES;
export type ProductSource = 'bestsellers' | 'on_sale' | 'new' | 'category' | 'brand';
export type SectionIcon = 'none' | 'flame' | 'zap' | 'sparkles';

export const PRODUCT_SOURCES: { value: ProductSource; label: string }[] = [
  { value: 'bestsellers', label: 'Bestsellers & top rated' },
  { value: 'on_sale', label: 'Products on sale' },
  { value: 'new', label: 'New arrivals' },
  { value: 'category', label: 'From a category' },
  { value: 'brand', label: 'From a brand' },
];

export const SECTION_ICONS: { value: SectionIcon; label: string }[] = [
  { value: 'none', label: 'No icon' },
  { value: 'flame', label: 'Flame' },
  { value: 'zap', label: 'Lightning' },
  { value: 'sparkles', label: 'Sparkles' },
];

export interface HomeSection {
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  title?: string;
  subtitle?: string;
  /** banner_grid: Banner `id` to show. */
  bannerId?: string;
  /** banner_grid: tiles per row on desktop. */
  columns?: number;
  /** banner_grid: square cards, or the wider "brands" card style. */
  style?: 'cards' | 'brands';
  /** product_grid */
  source?: ProductSource;
  sourceValue?: string;
  icon?: SectionIcon;
  viewAllHref?: string;
  /** product_grid / categories: how many to show. */
  limit?: number;
  /** hero: seconds per slide. */
  interval?: number;
}

export interface FooterLink { label: string; href: string }
export type FooterFeatureIcon = 'shield' | 'truck' | 'taka' | 'support' | 'gift' | 'star';
export const FOOTER_FEATURE_ICONS: { value: FooterFeatureIcon; label: string }[] = [
  { value: 'shield', label: 'Shield' },
  { value: 'truck', label: 'Delivery truck' },
  { value: 'taka', label: 'Taka sign' },
  { value: 'support', label: '24/7' },
  { value: 'gift', label: 'Gift' },
  { value: 'star', label: 'Star' },
];

export interface SiteContent {
  announcement: {
    enabled: boolean;
    showOnMobile: boolean;
    text: string;
    link: string;
    background: string;
    color: string;
  };
  footer: {
    enabled: boolean;
    showFeatures: boolean;
    features: { icon: FooterFeatureIcon; title: string; text: string }[];
    about: string;
    address: string;
    email: string;
    phone: string;
    columns: { title: string; links: FooterLink[] }[];
    newsletter: { enabled: boolean; title: string; text: string };
    showPayments: boolean;
    paymentMethods: string[];
    copyright: string;
    credit: { enabled: boolean; text: string; label: string; url: string };
  };
  homeSections: HomeSection[];
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  announcement: {
    enabled: true,
    showOnMobile: false,
    text: '100% Authentic Beauty Products • Nationwide Delivery in Bangladesh • Hotline: 09613-222333',
    link: '',
    background: '#1f1f1f',
    color: '#ffffff',
  },
  footer: {
    enabled: true,
    showFeatures: true,
    features: [
      { icon: 'shield', title: '100% Authentic', text: 'Sourced directly from certified brand principals.' },
      { icon: 'truck', title: 'Fast Delivery', text: 'Nationwide delivery within 24-72 hours across BD.' },
      { icon: 'taka', title: 'Best Price Online', text: 'Top offers, BOGO deals & reward points on every order.' },
      { icon: 'support', title: 'Customer Support', text: 'Hotline: 09613-222333 • 9 AM - 10 PM daily.' },
    ],
    about: "Shajgoj.bd is Bangladesh's leading omnichannel beauty destination offering 100% authentic makeup, skincare, and haircare from over 450+ renowned international and local brands.",
    address: 'House # 12, Road # 10, Dhanmondi, Dhaka-1205',
    email: 'support@shajgoj.bd',
    phone: '',
    columns: [
      {
        title: 'Popular Categories',
        links: [
          { label: 'Skin Care & Serums', href: '/shop?category=skin' },
          { label: 'Hair Care & Shampoos', href: '/shop?category=hair' },
          { label: 'Makeup & Foundation', href: '/shop?category=makeup' },
          { label: 'Korean Beauty (K-Beauty)', href: '/shop?category=k-beauty' },
          { label: 'Fragrance & Perfumes', href: '/shop?category=fragrance' },
          { label: 'Mom & Baby Care', href: '/shop?category=mom-and-baby' },
        ],
      },
      {
        title: 'Help & Policies',
        links: [
          { label: 'About Shajgoj.bd', href: '/about-us' },
          { label: '100% Authenticity Guarantee', href: '/authenticity' },
          { label: 'Frequently Asked Questions', href: '/faqs' },
          { label: 'Refund & Return Policy', href: '/refund-and-return-policy' },
          { label: 'Shipping & Delivery Info', href: '/shipping-delivery' },
          { label: 'Terms & Conditions', href: '/terms-conditions' },
          { label: 'Privacy Policy', href: '/privacy-policy' },
        ],
      },
    ],
    newsletter: { enabled: true, title: 'Stay in the Glow', text: 'Subscribe to get special discounts, beauty secrets, and flash sale notifications.' },
    showPayments: true,
    paymentMethods: ['bKash', 'Nagad', 'Rocket', 'Visa / MC', 'COD'],
    copyright: '© {year} Shajgoj.bd Limited. All Rights Reserved.',
    credit: { enabled: true, text: 'Designed & Developed by', label: 'JarzDigital.com', url: 'https://jarzdigital.com' },
  },
  // Matches the homepage as it was before the layout became editable.
  homeSections: [
    { id: 'hero', type: 'hero', enabled: true, interval: 4.5 },
    { id: 'under-hero', type: 'under_hero', enabled: true },
    { id: 'deals', type: 'banner_grid', enabled: true, title: 'Deals You Cannot Miss', bannerId: 'deals-cannot-miss', columns: 4, style: 'cards' },
    { id: 'limited-offers', type: 'banner_grid', enabled: true, title: 'Limited Time Offers & Combos', bannerId: 'limited-time-offers', columns: 4, style: 'cards' },
    { id: 'bestsellers', type: 'product_grid', enabled: true, title: 'Bestsellers & Top Rated', subtitle: 'Customer favorites backed by 100% authenticity guarantee', source: 'bestsellers', sourceValue: '', icon: 'flame', viewAllHref: '/shop', limit: 10 },
    { id: 'top-brands', type: 'banner_grid', enabled: true, title: 'Top Brands & Offers', bannerId: 'top-brands-offers', columns: 3, style: 'brands' },
    { id: 'special-deals', type: 'product_grid', enabled: true, title: 'Special Deals & Discounts', subtitle: 'Exclusive discounted beauty essentials for you', source: 'on_sale', sourceValue: '', icon: 'zap', viewAllHref: '/shop?offer=special', limit: 10 },
    { id: 'categories', type: 'categories', enabled: true, title: 'Shop by Category', limit: 8 },
    { id: 'concerns', type: 'concerns', enabled: true, title: 'Shop by Concern' },
    { id: 'new-arrivals', type: 'product_grid', enabled: true, title: 'New Arrivals', subtitle: 'Just launched genuine skincare and cosmetics', source: 'new', sourceValue: '', icon: 'sparkles', viewAllHref: '/shop?sort=newest', limit: 10 },
  ],
};

const LIMITS = { short: 120, text: 400, long: 1000, links: 20, columns: 4, features: 6, payments: 12, sections: 30 };

/** Links may be site paths, web URLs, or tel:/mailto: — never javascript: and friends. */
export function isSafeHref(value: string): boolean {
  if (value === '') return true;
  if (/^\/(?!\/)/.test(value) || value === '/') return true;
  return /^(https?:\/\/|mailto:|tel:)[^\s]+$/i.test(value);
}

const isHexColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

/**
 * Turns untrusted input into a complete SiteContent, filling anything missing
 * from the defaults. Problems that can't be fixed silently (unsafe links, bad
 * colors) are reported so the API can refuse the save with a clear message.
 */
export function normalizeSiteContent(input: unknown): { content: SiteContent; errors: string[] } {
  const errors: string[] = [];
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, any>;
  const d = DEFAULT_SITE_CONTENT;

  const str = (value: unknown, fallback: string, max: number) =>
    typeof value === 'string' ? value.trim().slice(0, max) : fallback;
  const bool = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);
  const int = (value: unknown, fallback: number, min: number, max: number) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
  };
  const href = (value: unknown, fallback: string, where: string) => {
    const v = str(value, fallback, 500);
    if (!isSafeHref(v)) { errors.push(`${where}: "${v}" is not a valid link. Use a path like /shop or a full https:// address.`); return fallback; }
    return v;
  };
  const color = (value: unknown, fallback: string, where: string) => {
    const v = str(value, fallback, 7);
    if (!isHexColor(v)) { errors.push(`${where} must be a color like #1a1a1a.`); return fallback; }
    return v;
  };
  const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T) =>
    (allowed as readonly unknown[]).includes(value) ? (value as T) : fallback;

  const a = raw.announcement ?? {};
  const announcement: SiteContent['announcement'] = {
    enabled: bool(a.enabled, d.announcement.enabled),
    showOnMobile: bool(a.showOnMobile, d.announcement.showOnMobile),
    text: str(a.text, d.announcement.text, LIMITS.text),
    link: href(a.link, d.announcement.link, 'Announcement link'),
    background: color(a.background, d.announcement.background, 'Announcement background'),
    color: color(a.color, d.announcement.color, 'Announcement text color'),
  };

  const f = raw.footer ?? {};
  const featureIcons = FOOTER_FEATURE_ICONS.map((i) => i.value);
  const footer: SiteContent['footer'] = {
    enabled: bool(f.enabled, d.footer.enabled),
    showFeatures: bool(f.showFeatures, d.footer.showFeatures),
    features: Array.isArray(f.features)
      ? f.features.slice(0, LIMITS.features).map((item: any) => ({
          icon: oneOf(item?.icon, featureIcons, 'shield'),
          title: str(item?.title, '', LIMITS.short),
          text: str(item?.text, '', LIMITS.text),
        })).filter((item: { title: string; text: string }) => item.title || item.text)
      : d.footer.features,
    about: str(f.about, d.footer.about, LIMITS.long),
    address: str(f.address, d.footer.address, LIMITS.text),
    email: str(f.email, d.footer.email, LIMITS.short),
    phone: str(f.phone, d.footer.phone, LIMITS.short),
    columns: Array.isArray(f.columns)
      ? f.columns.slice(0, LIMITS.columns).map((column: any, ci: number) => ({
          title: str(column?.title, '', LIMITS.short),
          links: Array.isArray(column?.links)
            ? column.links.slice(0, LIMITS.links)
                .map((link: any, li: number) => ({
                  label: str(link?.label, '', LIMITS.short),
                  href: href(link?.href, '/', `Footer column ${ci + 1}, link ${li + 1}`),
                }))
                .filter((link: FooterLink) => link.label)
            : [],
        }))
      : d.footer.columns,
    newsletter: {
      enabled: bool(f.newsletter?.enabled, d.footer.newsletter.enabled),
      title: str(f.newsletter?.title, d.footer.newsletter.title, LIMITS.short),
      text: str(f.newsletter?.text, d.footer.newsletter.text, LIMITS.text),
    },
    showPayments: bool(f.showPayments, d.footer.showPayments),
    paymentMethods: Array.isArray(f.paymentMethods)
      ? f.paymentMethods.slice(0, LIMITS.payments).map((m: unknown) => str(m, '', 40)).filter(Boolean)
      : d.footer.paymentMethods,
    copyright: str(f.copyright, d.footer.copyright, LIMITS.text),
    credit: {
      enabled: bool(f.credit?.enabled, d.footer.credit.enabled),
      text: str(f.credit?.text, d.footer.credit.text, LIMITS.short),
      label: str(f.credit?.label, d.footer.credit.label, LIMITS.short),
      url: href(f.credit?.url, d.footer.credit.url, 'Footer credit link'),
    },
  };

  const types = Object.keys(HOME_SECTION_TYPES) as HomeSectionType[];
  const seenIds = new Set<string>();
  const seenSingles = new Set<HomeSectionType>();
  const homeSections: HomeSection[] = [];
  for (const [index, item] of (Array.isArray(raw.homeSections) ? raw.homeSections : d.homeSections).slice(0, LIMITS.sections).entries()) {
    const type = oneOf(item?.type, types, 'product_grid');
    if (!types.includes(item?.type)) { errors.push(`Homepage section ${index + 1} has an unknown type.`); continue; }
    if (HOME_SECTION_TYPES[type].single && seenSingles.has(type)) continue;
    seenSingles.add(type);
    let id = str(item?.id, '', 60).replace(/[^a-z0-9-]/gi, '') || `${type}-${index + 1}`;
    while (seenIds.has(id)) id = `${id}-${index + 1}`;
    seenIds.add(id);
    const where = `Section "${str(item?.title, HOME_SECTION_TYPES[type].label, LIMITS.short)}"`;
    const section: HomeSection = { id, type, enabled: bool(item?.enabled, true) };
    if (type === 'hero') section.interval = Math.min(15, Math.max(2, Number(item?.interval) || 4.5));
    if (type === 'banner_grid') {
      section.title = str(item?.title, '', LIMITS.short);
      section.bannerId = str(item?.bannerId, '', 80);
      section.columns = int(item?.columns, 4, 1, 4);
      section.style = oneOf(item?.style, ['cards', 'brands'] as const, 'cards');
      if (!section.bannerId) errors.push(`${where}: choose which banner group to show.`);
    }
    if (type === 'product_grid') {
      section.title = str(item?.title, '', LIMITS.short);
      section.subtitle = str(item?.subtitle, '', LIMITS.text);
      section.source = oneOf(item?.source, PRODUCT_SOURCES.map((s) => s.value), 'bestsellers');
      section.sourceValue = str(item?.sourceValue, '', 120);
      section.icon = oneOf(item?.icon, SECTION_ICONS.map((i) => i.value), 'none');
      section.viewAllHref = href(item?.viewAllHref, '', `${where} "View all" link`);
      section.limit = int(item?.limit, 10, 1, 40);
      if ((section.source === 'category' || section.source === 'brand') && !section.sourceValue) {
        errors.push(`${where}: choose which ${section.source} to show products from.`);
      }
    }
    if (type === 'categories') {
      section.title = str(item?.title, 'Shop by Category', LIMITS.short);
      section.limit = int(item?.limit, 8, 1, 24);
    }
    if (type === 'concerns') section.title = str(item?.title, 'Shop by Concern', LIMITS.short);
    homeSections.push(section);
  }

  return { content: { announcement, footer, homeSections }, errors };
}

/** Footer copyright supports a {year} placeholder. */
export function formatCopyright(text: string, now = new Date()): string {
  return text.replace(/\{year\}/g, String(now.getFullYear()));
}
