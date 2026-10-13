# Graph Report - shajgoj-ecommerce  (2026-10-04)

## Corpus Check
- 180 files · ~188,526 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .ico 1)

## Summary
- 807 nodes · 2418 edges · 55 communities (48 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0056f96e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- connectToDatabase
- app/page.tsx
- react
- package.json
- Icons.tsx
- useAuth
- next
- Header.tsx
- authenticateRequest
- index.ts
- Product.ts
- Order.ts
- compilerOptions
- Shajgoj E-Commerce Platform
- track/route.ts
- OtpToken.ts
- app/layout.tsx
- ShieldIcon
- ShieldCheckIcon
- Shajgoj.bd Wordmark Logo (v2)
- invalidateStorefront
- Favicon (Shajgoj Brand Mark)
- SHAJGOJ.bd Main Logo (wordmark)
- Shajgoj.bd Favicon (Final)
- Next.js Wordmark Logo (next.svg)
- Shajgoj Footer Logo Mark (split pink/gold ring)
- admin/products/page.tsx
- mongoose
- storage.ts
- postcss.config.mjs
- Hamburger Menu Icon (Black)
- File Icon (file.svg)
- Globe Icon (globe.svg)
- Vercel Logo (vercel.svg)
- Next.js Starter Template Asset
- products/route.ts
- seed.ts
- dashboard/route.ts
- categories/[id]/route.ts
- serverData.ts
- activity/page.tsx
- RichText.tsx
- devDependencies
- dependencies
- shop/page.tsx
- api/orders/route.ts
- Brand.ts
- [slug]/page.tsx
- logAuditEvent
- Cart.ts
- send-otp/route.ts
- MegaMenu.ts
- scripts
- eslint.config.mjs

## God Nodes (most connected - your core abstractions)
1. `connectToDatabase()` - 163 edges
2. `next` - 99 edges
3. `authorizeRole()` - 93 edges
4. `react` - 73 edges
5. `logAuditEvent()` - 61 edges
6. `mongoose` - 40 edges
7. `invalidateStorefront()` - 35 edges
8. `authenticateRequest()` - 33 edges
9. `AdminLayout()` - 26 edges
10. `Modal()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `connectToDatabase()`  [EXTRACTED]
  src/app/api/orders/[id]/route.ts → src/lib/db.ts
- `POST()` --calls--> `connectToDatabase()`  [EXTRACTED]
  src/app/api/auth/verify-otp/route.ts → src/lib/db.ts
- `MobileBottomNav()` --indirect_call--> `HeartIcon()`  [INFERRED]
  src/components/common/MobileBottomNav.tsx → src/components/common/Icons.tsx
- `GET()` --calls--> `connectToDatabase()`  [EXTRACTED]
  src/app/api/admin/brands/route.ts → src/lib/db.ts
- `GET()` --calls--> `connectToDatabase()`  [EXTRACTED]
  src/app/api/admin/categories/route.ts → src/lib/db.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Shajgoj Tech Stack** — readme_nextjs_app_router, readme_typescript, readme_tailwind_css, readme_mongodb_mongoose, readme_jwt_authentication, readme_brevo_smtp [EXTRACTED 1.00]
- **OTP Email Authentication Flow** — readme_otp_verification, readme_brevo_smtp, readme_brevo_api_key, readme_brevo_smtp_user, readme_brevo_from_email, readme_jwt_authentication [INFERRED 0.85]

## Communities (55 total, 7 thin omitted)

### Community 0 - "connectToDatabase"
Cohesion: 0.12
Nodes (33): GET(), GET(), POST(), GET(), POST(), PUT(), DELETE(), GET() (+25 more)

### Community 1 - "app/page.tsx"
Cohesion: 0.15
Nodes (17): HomePage(), revalidate, BrandsSection(), BrandsSectionProps, CategoriesSection(), CategoriesSectionProps, ConcernSection(), ConcernSectionProps (+9 more)

### Community 2 - "react"
Cohesion: 0.08
Nodes (32): react, CustomerAddressesPage(), CustomerCouponsPage(), CustomerOrderDetailPage(), CustomerOrdersPage(), CustomerRewardsPage(), AdminAuditLogPage(), AdminBrandsPage() (+24 more)

### Community 3 - "package.json"
Cohesion: 0.12
Nodes (16): name, private, version, bcryptjs, @getbrevo/brevo, jsonwebtoken, react-dom, tailwindcss (+8 more)

### Community 4 - "Icons.tsx"
Cohesion: 0.12
Nodes (35): AdminLayout(), AdminDashboardPage(), PIPELINE, RANGES, taka(), trendProps(), ModeratorLayout(), ModeratorDashboardPage() (+27 more)

### Community 5 - "useAuth"
Cohesion: 0.14
Nodes (23): AccountLayout(), AccountDashboardPage(), AVATAR_PRESETS, CustomerProfilePage(), HAIR_CONCERNS, HAIR_TYPES, POPULAR_BRANDS, SKIN_CONCERNS (+15 more)

### Community 6 - "next"
Cohesion: 0.14
Nodes (13): nextConfig, next, GET(), PUT(), RouteContext, ASSIGNABLE_ROLES, POST(), POST() (+5 more)

### Community 7 - "Header.tsx"
Cohesion: 0.13
Nodes (24): ActivityTracker(), AppShell(), ALPHABET, brandInitial(), BrandsFlyout(), Header(), MegaColumns(), useProductSearch() (+16 more)

### Community 8 - "authenticateRequest"
Cohesion: 0.15
Nodes (18): DELETE(), GET(), POST(), PUT(), GET(), GET(), DELETE(), GET() (+10 more)

### Community 9 - "index.ts"
Cohesion: 0.12
Nodes (27): WishlistPage(), GiftIcon(), HeartIcon(), ProductCard(), ProductCardProps, ProductDetailClientProps, ProductGrid(), ProductGridProps (+19 more)

### Community 10 - "Product.ts"
Cohesion: 0.14
Nodes (13): GET(), POST(), RouteContext, GET(), POST(), INotification, NotificationSchema, IProduct (+5 more)

### Community 11 - "Order.ts"
Cohesion: 0.16
Nodes (10): POST(), RouteContext, GET(), IOrder, IOrderItem, IStatusHistoryEntry, Order, OrderSchema (+2 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "Shajgoj E-Commerce Platform"
Cohesion: 0.17
Nodes (16): BREVO_API_KEY, BREVO_FROM_EMAIL, Brevo SMTP, BREVO_SMTP_USER, Environment Configuration (.env.local from .env.example), JarzDigital.com, JWT Authentication, JWT_SECRET (+8 more)

### Community 14 - "track/route.ts"
Cohesion: 0.21
Nodes (13): GET(), rangeStart(), CLIENT_EVENT_TYPES, clip(), POST(), detectDevice(), isLikelyBot(), ServerActivity (+5 more)

### Community 15 - "OtpToken.ts"
Cohesion: 0.40
Nodes (4): POST(), IOtpToken, OtpToken, OtpTokenSchema

### Community 16 - "app/layout.tsx"
Cohesion: 0.29
Nodes (9): src_app_globals, jakarta, metadata, playfair, RootLayout(), AuthProvider(), CartProvider(), WishlistProvider() (+1 more)

### Community 17 - "ShieldIcon"
Cohesion: 0.27
Nodes (9): AdminOrdersPage(), ALL_STATUSES, COURIER_PRESETS, STAGE_STEPS, ModeratorOrdersPage(), ArrowRightIcon(), PhoneIcon(), SearchIcon() (+1 more)

### Community 18 - "ShieldCheckIcon"
Cohesion: 0.30
Nodes (11): CustomerWishlistPage(), CartPage(), CartDrawer(), Footer(), MailIcon(), MapPinIcon(), ShajgojBagIcon(), ShieldCheckIcon() (+3 more)

### Community 19 - "Shajgoj.bd Wordmark Logo (v2)"
Cohesion: 0.67
Nodes (4): .bd Domain Suffix (Bangladesh), Shajgoj.bd Wordmark Logo (v2), Rose-to-Mauve Gradient Brand Palette, Shajgoj Brand

### Community 20 - "invalidateStorefront"
Cohesion: 0.11
Nodes (24): ref_fs, ref_path, byAnyId(), DELETE(), PUT(), POST(), PUT(), DELETE() (+16 more)

### Community 21 - "Favicon (Shajgoj Brand Mark)"
Cohesion: 1.00
Nodes (3): Favicon (Shajgoj Brand Mark), Pink-Gold Brand Gradient Palette, Stylized S Monogram Logo

### Community 22 - "SHAJGOJ.bd Main Logo (wordmark)"
Cohesion: 1.00
Nodes (3): SHAJGOJ.bd Main Logo (wordmark), Rose-to-Dusty-Pink Gradient Brand Palette, Shajgoj.bd Brand Identity

### Community 23 - "Shajgoj.bd Favicon (Final)"
Cohesion: 1.00
Nodes (3): Shajgoj.bd Favicon (Final), Pink-Gold Brand Gradient Palette, Stylized S Ring Monogram

### Community 24 - "Next.js Wordmark Logo (next.svg)"
Cohesion: 0.67
Nodes (3): create-next-app Default Boilerplate Asset, Next.js Wordmark Logo (next.svg), Next.js Framework

### Community 25 - "Shajgoj Footer Logo Mark (split pink/gold ring)"
Cohesion: 0.67
Nodes (3): Shajgoj Footer Logo Mark (split pink/gold ring), Pink-to-Gold Brand Gradient Palette, Site Footer Branding

### Community 26 - "admin/products/page.tsx"
Cohesion: 0.12
Nodes (23): AdminProducts(), AdminProductsPage(), productKey(), StatusFilter, StockFilter, Toast, ModeratorProductsPage(), Drawer() (+15 more)

### Community 27 - "mongoose"
Cohesion: 0.11
Nodes (13): mongoose, AuditLogSchema, IAuditLog, CouponSchema, ICoupon, IPageSection, PageSectionSchema, IRewardHistory (+5 more)

### Community 28 - "storage.ts"
Cohesion: 0.14
Nodes (18): ref_crypto, ref_server_only, GET(), POST(), GET(), activeStorageProvider(), ALLOWED_IMAGE_TYPES, cloudinaryConfig() (+10 more)

### Community 35 - "products/route.ts"
Cohesion: 0.19
Nodes (19): byAnyId(), DELETE(), GET(), PUT(), RouteParams, GET(), POST(), src_data_products (+11 more)

### Community 36 - "seed.ts"
Cohesion: 0.14
Nodes (18): GET(), GET(), POST(), dynamic, GET(), dynamic, GET(), GET() (+10 more)

### Community 37 - "dashboard/route.ts"
Cohesion: 0.53
Nodes (5): GET(), NON_REVENUE_STATUSES, pctChange(), periodTotals(), rangeWindow()

### Community 38 - "categories/[id]/route.ts"
Cohesion: 0.83
Nodes (3): byAnyId(), DELETE(), PUT()

### Community 39 - "serverData.ts"
Cohesion: 0.23
Nodes (15): ProductDetailPage(), CACHE_TAGS, cachedAllProducts, cachedBanners, cachedBrands, cachedCategories, cachedMenu, cachedProductBySlug (+7 more)

### Community 40 - "activity/page.tsx"
Cohesion: 0.29
Nodes (9): AdminActivityPage(), Kpi(), Panel(), RANGES, ACTIVITY_LABELS, ActivityFeed(), ActivityFeedEvent, describe() (+1 more)

### Community 41 - "RichText.tsx"
Cohesion: 0.27
Nodes (11): Block, decodeEntities(), ENTITIES, Inline, parseHtml(), parsePlain(), parseRichText(), renderInline() (+3 more)

### Community 42 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/bcryptjs, @types/jsonwebtoken, @types/node (+3 more)

### Community 43 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, bcryptjs, @getbrevo/brevo, jsonwebtoken, mongoose, next, nodemailer, react (+2 more)

### Community 44 - "shop/page.tsx"
Cohesion: 0.36
Nodes (6): ShopLoading(), metadata, revalidate, ShopPage(), ProductGridSkeleton(), ShopClient()

### Community 45 - "api/orders/route.ts"
Cohesion: 0.35
Nodes (9): POST(), GET(), POST(), POST(), recordServerActivity(), comparePassword(), getTokenFromRequest(), signToken() (+1 more)

### Community 46 - "Brand.ts"
Cohesion: 0.29
Nodes (6): dynamic, GET(), src_data_brands, Brand, BrandSchema, IBrand

### Community 47 - "[slug]/page.tsx"
Cohesion: 0.38
Nodes (6): generateMetadata(), generateStaticParams(), PageProps, revalidate, richTextToPlain(), getServerProducts()

### Community 48 - "logAuditEvent"
Cohesion: 0.15
Nodes (13): DELETE(), PUT(), RouteContext, DELETE(), PUT(), RouteContext, DELETE(), PUT() (+5 more)

### Community 49 - "Cart.ts"
Cohesion: 0.50
Nodes (3): CartSchema, ICart, ICartItem

### Community 50 - "send-otp/route.ts"
Cohesion: 0.53
Nodes (4): nodemailer, POST(), getTransporter(), sendOtpEmail()

### Community 51 - "MegaMenu.ts"
Cohesion: 0.40
Nodes (4): IMegaMenu, IMegaMenuChild, IMegaMenuItem, MegaMenuSchema

### Community 52 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 53 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

## Knowledge Gaps
- **204 isolated node(s):** `jakarta`, `playfair`, `metadata`, `RouteContext`, `AllowedRole` (+199 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 233 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `connectToDatabase`, `app/page.tsx`, `react`, `package.json`, `Icons.tsx`, `useAuth`, `Header.tsx`, `authenticateRequest`, `index.ts`, `Product.ts`, `Order.ts`, `track/route.ts`, `OtpToken.ts`, `app/layout.tsx`, `ShieldCheckIcon`, `invalidateStorefront`, `admin/products/page.tsx`, `storage.ts`, `products/route.ts`, `seed.ts`, `dashboard/route.ts`, `categories/[id]/route.ts`, `serverData.ts`, `activity/page.tsx`, `shop/page.tsx`, `api/orders/route.ts`, `Brand.ts`, `[slug]/page.tsx`, `logAuditEvent`, `send-otp/route.ts`?**
  _High betweenness centrality (0.371) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `app/page.tsx`, `package.json`, `Icons.tsx`, `useAuth`, `Header.tsx`, `activity/page.tsx`, `index.ts`, `RichText.tsx`, `shop/page.tsx`, `[slug]/page.tsx`, `ShieldIcon`, `ShieldCheckIcon`, `admin/products/page.tsx`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Why does `connectToDatabase()` connect `connectToDatabase` to `products/route.ts`, `seed.ts`, `dashboard/route.ts`, `next`, `categories/[id]/route.ts`, `authenticateRequest`, `serverData.ts`, `Product.ts`, `Order.ts`, `api/orders/route.ts`, `track/route.ts`, `OtpToken.ts`, `logAuditEvent`, `Brand.ts`, `send-otp/route.ts`, `invalidateStorefront`, `storage.ts`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `jakarta`, `playfair`, `metadata` to the rest of the system?**
  _204 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `connectToDatabase` be split into smaller, more focused modules?**
  _Cohesion score 0.12403100775193798 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.07596153846153846 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._