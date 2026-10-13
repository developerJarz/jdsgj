export const ADMIN_SECTIONS = [
  { id: 'dashboard', name: 'Dashboard', group: 'Overview', href: '/admin', description: 'Sales overview, store metrics and quick actions.' },
  { id: 'activity', name: 'Store Activity', group: 'Overview', href: '/admin/activity', description: 'Live visitors, sessions and store events.' },
  { id: 'products', name: 'Products & Stock', group: 'Catalog & Inventory', href: '/admin/products', description: 'Product catalog, pricing and stock management.' },
  { id: 'categories', name: 'Categories', group: 'Catalog & Inventory', href: '/admin/categories', description: 'Product categories and catalog organization.' },
  { id: 'brands', name: 'Brands', group: 'Catalog & Inventory', href: '/admin/brands', description: 'Brand details, logos and catalog listings.' },
  { id: 'reviews', name: 'Reviews Moderation', group: 'Catalog & Inventory', href: '/admin/reviews', description: 'Customer ratings and review moderation.' },
  { id: 'orders', name: 'Orders Pipeline', group: 'Sales & Fulfillment', href: '/admin/orders', description: 'Customer orders, invoices and fulfillment.' },
  { id: 'returns', name: 'Returns & Refunds', group: 'Sales & Fulfillment', href: '/admin/returns', description: 'Return requests and refund processing.' },
  { id: 'coupons', name: 'Coupons & Vouchers', group: 'Sales & Fulfillment', href: '/admin/coupons', description: 'Discount codes, vouchers and usage limits.' },
  { id: 'promotions', name: 'Flash Sales & Deals', group: 'Sales & Fulfillment', href: '/admin/promotions', description: 'Promotions and limited time offers.' },
  { id: 'users', name: 'Customer Accounts', group: 'Customers', href: '/admin/users', description: 'Customer profiles and account management.' },
  { id: 'banners', name: 'Banners & Hero', group: 'Content & Layout', href: '/admin/banners', description: 'Storefront banners and hero carousels.' },
  { id: 'mega-menu', name: 'Mega Menu Builder', group: 'Content & Layout', href: '/admin/mega-menu', description: 'Store navigation and mega menu content.' },
  { id: 'page-sections', name: 'Page Layout Sections', group: 'Content & Layout', href: '/admin/page-sections', description: 'Storefront page sections and their order.' },
  { id: 'shipping', name: 'Shipping Zones', group: 'Logistics', href: '/admin/shipping', description: 'Delivery areas, fees and shipping rules.' },
  { id: 'staff', name: 'Staff & Moderators', group: 'Access & Team', href: '/admin/staff', description: 'Staff accounts and moderator permissions.' },
  { id: 'roles', name: 'Roles & Permissions', group: 'Access & Team', href: '/admin/roles', description: 'Staff role templates and permission sets.' },
  { id: 'audit-log', name: 'Audit Trail', group: 'Access & Team', href: '/admin/audit-log', description: 'History of administrative changes.' },
  { id: 'reports', name: 'Sales Reports', group: 'Analytics', href: '/admin/reports', description: 'Revenue reports and financial analytics.' },
] as const;

export type AdminSectionId = (typeof ADMIN_SECTIONS)[number]['id'];
export interface AdminAccess {
  role: 'admin' | 'superadmin';
  disabledSections: AdminSectionId[];
  canDeleteAuditLogs: boolean;
}

export function parseDisabledSections(value: unknown): AdminSectionId[] {
  if (!Array.isArray(value) || value.some((id) => !ADMIN_SECTIONS.some((section) => section.id === id))) {
    throw new Error('disabledSections must be an array of valid dashboard section IDs.');
  }
  return [...new Set(value)] as AdminSectionId[];
}

export function canAccessAdminPath(role: string, disabledSections: readonly string[], href: string): boolean {
  const pathname = href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  const section = ADMIN_SECTIONS.find((item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`)));
  return Boolean(section && (role === 'superadmin' || (role === 'admin' && !disabledSections.includes(section.id))));
}

// Read-only lookups another enabled section depends on. Staff assigns role
// templates, so listing roles stays available while Staff is visible even if
// the Roles section itself is hidden. Writes are still blocked.
export const ADMIN_SHARED_READS: Partial<Record<AdminSectionId, AdminSectionId[]>> = {
  roles: ['staff'],
};

export function isAdminApiBlocked(pathname: string, method: string, disabledSections: readonly string[]): boolean {
  return adminSectionsForApi(pathname).some((section) => disabledSections.includes(section)
    && !(method.toUpperCase() === 'GET' && ADMIN_SHARED_READS[section]?.some((consumer) => !disabledSections.includes(consumer))));
}

// Shared public storefront reads remain public; management operations pass
// through authorizeRole and use these section mappings regardless of UI URL.
export function adminSectionsForApi(pathname: string): AdminSectionId[] {
  const segment = pathname.split('/').filter(Boolean);
  if (segment[0] !== 'api') return [];
  if (segment[1] === 'products') return ['products'];
  if (segment[1] === 'orders') return ['orders'];
  if (segment[1] === 'seed') return ['products', 'categories', 'banners'];
  if (segment[1] !== 'admin') return [];
  const aliases: Record<string, AdminSectionId> = { stats: 'reports', 'shipping-zones': 'shipping' };
  const id = aliases[segment[2]] || segment[2];
  return ADMIN_SECTIONS.some((section) => section.id === id) ? [id as AdminSectionId] : [];
}
