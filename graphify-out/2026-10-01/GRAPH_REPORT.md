# Graph Report - shajgoj-ecommerce  (2026-10-01)

## Corpus Check
- 167 files · ~174,516 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .example 1, (none) 1, .ico 1)

## Summary
- 645 nodes · 1892 edges · 35 communities (26 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.86)
- Token cost: 532,428 input · 0 output

## Community Hubs (Navigation)
- Admin Catalog CRUD APIs
- Banners & Category APIs
- Customer Account Pages
- Package Dependencies & Lint
- Admin & Moderator Dashboards
- Profile & Order Management UI
- User Profile & Auth APIs
- App Shell & Cart UI
- Protected Account APIs
- Product Display Components
- Reviews, Returns & Notifications
- Order Model & Order APIs
- TypeScript Config
- README Stack & Env Setup
- JWT Auth Core
- OTP Email Verification
- Root Layout & Context Providers
- Account Dashboard Layout
- Mobile Bottom Navigation
- Logo v2 Branding
- Cart Data Model
- Favicon Brand Mark
- Main Wordmark Logo
- Final Favicon Mark
- Next.js Wordmark Asset
- Footer Logo Mark
- Page Section Model
- Shipping Zone Model
- Staff Role Model
- PostCSS Config
- Hamburger Menu Icon
- Starter File Icon
- Starter Globe Icon
- Vercel Logo Asset
- Starter Window Icon

## God Nodes (most connected - your core abstractions)
1. `connectToDatabase()` - 150 edges
2. `next` - 88 edges
3. `react` - 65 edges
4. `authorizeRole()` - 54 edges
5. `authenticateRequest()` - 33 edges
6. `mongoose` - 32 edges
7. `logAuditEvent()` - 32 edges
8. `AdminLayout()` - 26 edges
9. `ensureDatabaseSeeded()` - 25 edges
10. `Modal()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `DELETE()` --calls--> `connectToDatabase()`  [EXTRACTED]
  src/app/api/admin/banners/[id]/route.ts → src/lib/db.ts
- `GET()` --calls--> `connectToDatabase()`  [EXTRACTED]
  src/app/api/admin/categories/route.ts → src/lib/db.ts
- `POST()` --calls--> `connectToDatabase()`  [EXTRACTED]
  src/app/api/admin/categories/route.ts → src/lib/db.ts
- `GET()` --calls--> `connectToDatabase()`  [EXTRACTED]
  src/app/api/admin/users/route.ts → src/lib/db.ts
- `PUT()` --calls--> `connectToDatabase()`  [EXTRACTED]
  src/app/api/admin/users/route.ts → src/lib/db.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Shajgoj Tech Stack** — readme_nextjs_app_router, readme_typescript, readme_tailwind_css, readme_mongodb_mongoose, readme_jwt_authentication, readme_brevo_smtp [EXTRACTED 1.00]
- **OTP Email Authentication Flow** — readme_otp_verification, readme_brevo_smtp, readme_brevo_api_key, readme_brevo_smtp_user, readme_brevo_from_email, readme_jwt_authentication [INFERRED 0.85]

## Communities (35 total, 9 thin omitted)

### Community 0 - "Admin Catalog CRUD APIs"
Cohesion: 0.05
Nodes (80): ref_fs, ref_path, GET(), GET(), DELETE(), PUT(), RouteContext, GET() (+72 more)

### Community 1 - "Banners & Category APIs"
Cohesion: 0.05
Nodes (59): DELETE(), PUT(), GET(), POST(), PUT(), GET(), POST(), GET() (+51 more)

### Community 2 - "Customer Account Pages"
Cohesion: 0.07
Nodes (36): react, CustomerAddressesPage(), CustomerCouponsPage(), CustomerOrderDetailPage(), CustomerOrdersPage(), CustomerRewardsPage(), AdminAuditLogPage(), AdminBrandsPage() (+28 more)

### Community 3 - "Package Dependencies & Lint"
Cohesion: 0.04
Nodes (45): eslintConfig, dependencies, bcryptjs, @getbrevo/brevo, jsonwebtoken, mongoose, next, nodemailer (+37 more)

### Community 4 - "Admin & Moderator Dashboards"
Cohesion: 0.16
Nodes (27): AdminLayout(), AdminDashboardPage(), ModeratorLayout(), ModeratorDashboardPage(), StatsCard(), StatsCardProps, AlertTriangleIcon(), BarChartIcon() (+19 more)

### Community 5 - "Profile & Order Management UI"
Cohesion: 0.11
Nodes (27): AVATAR_PRESETS, CustomerProfilePage(), HAIR_CONCERNS, HAIR_TYPES, POPULAR_BRANDS, SKIN_CONCERNS, SKIN_TYPES, AdminOrdersPage() (+19 more)

### Community 6 - "User Profile & Auth APIs"
Cohesion: 0.14
Nodes (14): nextConfig, ref_crypto, next, GET(), PUT(), GET(), PUT(), POST() (+6 more)

### Community 7 - "App Shell & Cart UI"
Cohesion: 0.24
Nodes (16): CustomerWishlistPage(), CartPage(), AppShell(), CartDrawer(), Footer(), Header(), ChevronDownIcon(), CloseIcon() (+8 more)

### Community 8 - "Protected Account APIs"
Cohesion: 0.15
Nodes (18): DELETE(), GET(), POST(), PUT(), GET(), GET(), DELETE(), GET() (+10 more)

### Community 9 - "Product Display Components"
Cohesion: 0.24
Nodes (15): PageProps, ProductDetailPage(), WishlistPage(), GiftIcon(), HeartIcon(), ProductCard(), ProductCardProps, ProductDetailClient() (+7 more)

### Community 10 - "Reviews, Returns & Notifications"
Cohesion: 0.13
Nodes (14): mongoose, POST(), RouteContext, GET(), POST(), INotification, NotificationSchema, IReturnRequest (+6 more)

### Community 11 - "Order Model & Order APIs"
Cohesion: 0.17
Nodes (13): GET(), POST(), RouteContext, GET(), RouteParams, IOrder, IOrderItem, IStatusHistoryEntry (+5 more)

### Community 12 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "README Stack & Env Setup"
Cohesion: 0.17
Nodes (16): BREVO_API_KEY, BREVO_FROM_EMAIL, Brevo SMTP, BREVO_SMTP_USER, Environment Configuration (.env.local from .env.example), JarzDigital.com, JWT Authentication, JWT_SECRET (+8 more)

### Community 14 - "JWT Auth Core"
Cohesion: 0.29
Nodes (9): POST(), GET(), PUT(), GET(), POST(), comparePassword(), getTokenFromRequest(), signToken() (+1 more)

### Community 15 - "OTP Email Verification"
Cohesion: 0.24
Nodes (8): nodemailer, POST(), POST(), getTransporter(), sendOtpEmail(), IOtpToken, OtpToken, OtpTokenSchema

### Community 16 - "Root Layout & Context Providers"
Cohesion: 0.27
Nodes (9): src_app_globals, metadata, RootLayout(), AuthProvider(), CartContext, CartContextType, CartProvider(), WishlistProvider() (+1 more)

### Community 17 - "Account Dashboard Layout"
Cohesion: 0.38
Nodes (7): AccountLayout(), AccountDashboardPage(), CrownIcon(), MapPinIcon(), SettingsIcon(), SparklesIcon(), TicketIcon()

### Community 18 - "Mobile Bottom Navigation"
Cohesion: 0.60
Nodes (5): GridIcon(), HomeIcon(), TagIcon(), UserIcon(), MobileBottomNav()

### Community 19 - "Logo v2 Branding"
Cohesion: 0.67
Nodes (4): .bd Domain Suffix (Bangladesh), Shajgoj.bd Wordmark Logo (v2), Rose-to-Mauve Gradient Brand Palette, Shajgoj Brand

### Community 20 - "Cart Data Model"
Cohesion: 0.50
Nodes (3): CartSchema, ICart, ICartItem

### Community 21 - "Favicon Brand Mark"
Cohesion: 1.00
Nodes (3): Favicon (Shajgoj Brand Mark), Pink-Gold Brand Gradient Palette, Stylized S Monogram Logo

### Community 22 - "Main Wordmark Logo"
Cohesion: 1.00
Nodes (3): SHAJGOJ.bd Main Logo (wordmark), Rose-to-Dusty-Pink Gradient Brand Palette, Shajgoj.bd Brand Identity

### Community 23 - "Final Favicon Mark"
Cohesion: 1.00
Nodes (3): Shajgoj.bd Favicon (Final), Pink-Gold Brand Gradient Palette, Stylized S Ring Monogram

### Community 24 - "Next.js Wordmark Asset"
Cohesion: 0.67
Nodes (3): create-next-app Default Boilerplate Asset, Next.js Wordmark Logo (next.svg), Next.js Framework

### Community 25 - "Footer Logo Mark"
Cohesion: 0.67
Nodes (3): Shajgoj Footer Logo Mark (split pink/gold ring), Pink-to-Gold Brand Gradient Palette, Site Footer Branding

## Knowledge Gaps
- **169 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 194 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `User Profile & Auth APIs` to `Admin Catalog CRUD APIs`, `Banners & Category APIs`, `Customer Account Pages`, `Package Dependencies & Lint`, `Admin & Moderator Dashboards`, `Profile & Order Management UI`, `App Shell & Cart UI`, `Protected Account APIs`, `Product Display Components`, `Reviews, Returns & Notifications`, `Order Model & Order APIs`, `JWT Auth Core`, `OTP Email Verification`, `Root Layout & Context Providers`, `Account Dashboard Layout`, `Mobile Bottom Navigation`?**
  _High betweenness centrality (0.350) - this node is a cross-community bridge._
- **Why does `react` connect `Customer Account Pages` to `Banners & Category APIs`, `Package Dependencies & Lint`, `Admin & Moderator Dashboards`, `Profile & Order Management UI`, `App Shell & Cart UI`, `Product Display Components`, `Root Layout & Context Providers`, `Account Dashboard Layout`, `Mobile Bottom Navigation`?**
  _High betweenness centrality (0.165) - this node is a cross-community bridge._
- **Why does `connectToDatabase()` connect `Admin Catalog CRUD APIs` to `Banners & Category APIs`, `User Profile & Auth APIs`, `Protected Account APIs`, `Reviews, Returns & Notifications`, `Order Model & Order APIs`, `JWT Auth Core`, `OTP Email Verification`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Catalog CRUD APIs` be split into smaller, more focused modules?**
  _Cohesion score 0.050628610261637785 - nodes in this community are weakly interconnected._
- **Should `Banners & Category APIs` be split into smaller, more focused modules?**
  _Cohesion score 0.054527750730282376 - nodes in this community are weakly interconnected._
- **Should `Customer Account Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.06621004566210045 - nodes in this community are weakly interconnected._