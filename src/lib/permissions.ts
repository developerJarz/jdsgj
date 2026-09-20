export const PERMISSIONS = {
  // Products
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',

  // Categories & Brands
  CATEGORIES_MANAGE: 'categories.manage',
  BRANDS_MANAGE: 'brands.manage',

  // Orders
  ORDERS_VIEW: 'orders.view',
  ORDERS_UPDATE_STATUS: 'orders.update_status',
  ORDERS_CANCEL: 'orders.cancel',
  ORDERS_EXPORT: 'orders.export',

  // Returns & Refunds
  RETURNS_VIEW: 'returns.view',
  RETURNS_PROCESS: 'returns.process',

  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_EDIT: 'customers.edit',
  CUSTOMERS_REWARDS: 'customers.rewards',

  // Reviews
  REVIEWS_VIEW: 'reviews.view',
  REVIEWS_MODERATE: 'reviews.moderate',

  // Inventory
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_UPDATE: 'inventory.update',

  // Marketing & Sales
  COUPONS_MANAGE: 'coupons.manage',
  PROMOTIONS_MANAGE: 'promotions.manage',
  BANNERS_MANAGE: 'banners.manage',
  PAGES_MANAGE: 'pages.manage',

  // System & Settings
  SHIPPING_MANAGE: 'shipping.manage',
  REPORTS_VIEW: 'reports.view',
  STAFF_MANAGE: 'staff.manage',
  ROLES_MANAGE: 'roles.manage',
  AUDIT_VIEW: 'audit.view',
  SETTINGS_MANAGE: 'settings.manage',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[PermissionKey];

export interface PermissionGroup {
  name: string;
  permissions: { key: PermissionValue; label: string; description: string }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'Products & Catalog',
    permissions: [
      { key: PERMISSIONS.PRODUCTS_VIEW, label: 'View Products', description: 'Browse and search product catalog' },
      { key: PERMISSIONS.PRODUCTS_CREATE, label: 'Create Products', description: 'Add new items to the catalog' },
      { key: PERMISSIONS.PRODUCTS_EDIT, label: 'Edit Products', description: 'Modify pricing, descriptions, images' },
      { key: PERMISSIONS.PRODUCTS_DELETE, label: 'Delete Products', description: 'Remove products from store' },
      { key: PERMISSIONS.CATEGORIES_MANAGE, label: 'Manage Categories', description: 'Create and organize categories' },
      { key: PERMISSIONS.BRANDS_MANAGE, label: 'Manage Brands', description: 'Create and edit brand entities' },
    ],
  },
  {
    name: 'Orders & Fulfillment',
    permissions: [
      { key: PERMISSIONS.ORDERS_VIEW, label: 'View Orders', description: 'See all customer orders and invoices' },
      { key: PERMISSIONS.ORDERS_UPDATE_STATUS, label: 'Update Status', description: 'Advance order stages & history' },
      { key: PERMISSIONS.ORDERS_CANCEL, label: 'Cancel Orders', description: 'Cancel pending orders' },
      { key: PERMISSIONS.ORDERS_EXPORT, label: 'Export Orders', description: 'Download CSV reports of orders' },
      { key: PERMISSIONS.RETURNS_VIEW, label: 'View Returns', description: 'Inspect return requests' },
      { key: PERMISSIONS.RETURNS_PROCESS, label: 'Process Returns', description: 'Approve or decline returns/refunds' },
    ],
  },
  {
    name: 'Customers & Community',
    permissions: [
      { key: PERMISSIONS.CUSTOMERS_VIEW, label: 'View Customers', description: 'View client profiles & metrics' },
      { key: PERMISSIONS.CUSTOMERS_EDIT, label: 'Edit Customers', description: 'Manage accounts and statuses' },
      { key: PERMISSIONS.CUSTOMERS_REWARDS, label: 'Adjust Rewards', description: 'Add or deduct reward points' },
      { key: PERMISSIONS.REVIEWS_VIEW, label: 'View Reviews', description: 'Browse user ratings & reviews' },
      { key: PERMISSIONS.REVIEWS_MODERATE, label: 'Moderate Reviews', description: 'Approve, hide or reply to reviews' },
    ],
  },
  {
    name: 'Inventory & Operations',
    permissions: [
      { key: PERMISSIONS.INVENTORY_VIEW, label: 'View Inventory', description: 'Check stock levels and thresholds' },
      { key: PERMISSIONS.INVENTORY_UPDATE, label: 'Update Stock', description: 'Quick stock adjustments' },
      { key: PERMISSIONS.SHIPPING_MANAGE, label: 'Manage Shipping', description: 'Configure zones and rates' },
    ],
  },
  {
    name: 'Marketing & Content',
    permissions: [
      { key: PERMISSIONS.COUPONS_MANAGE, label: 'Manage Coupons', description: 'Create and track discount codes' },
      { key: PERMISSIONS.PROMOTIONS_MANAGE, label: 'Promotions', description: 'Run flash sales and banners' },
      { key: PERMISSIONS.BANNERS_MANAGE, label: 'Banners & Hero', description: 'Edit storefront hero carousels' },
      { key: PERMISSIONS.PAGES_MANAGE, label: 'Page Layouts', description: 'Customize dynamic home sections' },
    ],
  },
  {
    name: 'Analytics & Administration',
    permissions: [
      { key: PERMISSIONS.REPORTS_VIEW, label: 'View Reports', description: 'Revenue and sales performance analytics' },
      { key: PERMISSIONS.AUDIT_VIEW, label: 'Audit Trail', description: 'Inspect staff logs and system activity' },
      { key: PERMISSIONS.STAFF_MANAGE, label: 'Manage Staff', description: 'Superadmin: Invite and manage moderators' },
      { key: PERMISSIONS.ROLES_MANAGE, label: 'Manage Roles', description: 'Superadmin: Build custom permission roles' },
      { key: PERMISSIONS.SETTINGS_MANAGE, label: 'Store Settings', description: 'Superadmin: Global site configuration' },
    ],
  },
];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
