# 🛍️ DZ Store — منصة التجارة الإلكترونية الجزائرية

A production-ready, multilingual (Arabic RTL / French / English) e-commerce platform custom-built for the Algerian market, powered by **Next.js 14 App Router**, **Prisma ORM**, **PostgreSQL**, **Tailwind CSS**, and natively integrated with the **Yalidine Express API**.

---

## ✨ Features

### 🌍 Multilingual (AR / FR / EN)
- Full RTL layout for Arabic (default)
- Dynamic locale switching in storefront and admin
- All 58 wilayas seeded with Arabic, French & English names

### 🚚 Yalidine Integration
- Automated parcel creation via `POST /api/orders/[id]/yalidine`
- Payload auto-built from order data (sender wilaya, customer, products)
- Live tracking code stored back to the order record
- Admin "🚚 Ship via Yalidine" button visible only on unshipped orders

### 🛒 Storefront
- Hero section with animated gradient background
- Featured product grid with cart integration
- Category filtering pills
- Multi-step checkout: Personal Info → Shipping → Confirmation
- **Cash on Delivery (COD)** as sole payment method
- Dynamic wilaya + commune selectors
- Real-time shipping cost calculation (home vs desk delivery)
- Order success screen with order number

### 🏪 Admin Dashboard
- Revenue chart (area + bar) — last 7 days
- Stat cards: Revenue (DZD), Orders, Pending shipments, Out-of-stock
- Order status breakdown with quick-link navigation
- Low stock and out-of-stock alerts

### 📦 Order Management
- Full order table with status, tracking, wilaya, shipping type
- Inline status updater (dropdown)
- **Yalidine ship button** on all unshipped pending/processing orders
- Pagination + search + status filter tabs

### 🗺️ Logistics Panel
- All 58 wilayas in an editable price table
- Inline home delivery / desk pickup price editors
- Active/inactive toggle per wilaya
- Bulk enable/disable all
- Dirty state tracking with single Save button

### ⚙️ Settings
- Store name in Arabic, French, English
- Contact info: phone, WhatsApp, email, physical address
- Social media: Facebook, Instagram, TikTok
- Yalidine credentials guide (env-var based)

---

## 🗄️ Database Schema

```
User         → Auth, role (admin|customer)
Product      → Multilang title/desc, DZD price, stock, images
Category     → Multilang name, slug, sort order
Wilaya       → Code 01-58, AR/FR/EN names, homePrice, deskPrice, isActive
Commune      → Belongs to Wilaya, multilang names
Order        → Customer info, wilaya, commune, shippingType, tracking, items[]
OrderItem    → Snapshot of product at order time
Settings     → Single global row (store metadata)
```

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo>
cd dz-store
cp .env.example .env
# Fill in your DATABASE_URL and Yalidine credentials
npm install
```

### 2. Database Setup
```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to PostgreSQL
npm run db:seed       # Seed 58 wilayas + admin user + sample products
```

### 3. Run Development Server
```bash
npm run dev
# → http://localhost:3000          (storefront)
# → http://localhost:3000/admin    (admin panel, redirects to login)
# → http://localhost:3000/auth/login
```

### 4. Default Admin Credentials
```
Email:    admin@dz-store.dz
Password: Admin@123
```

---

## 🔐 Environment Variables

```env
# PostgreSQL
DATABASE_URL="postgresql://user:pass@localhost:5432/dz_store"

# JWT Auth
JWT_SECRET="your-256-bit-secret"

# Yalidine API
YALIDINE_API_ID="your-api-id"
YALIDINE_API_TOKEN="your-api-token"
YALIDINE_SENDER_WILAYA_ID="16"           # 16 = Alger (sender wilaya)
YALIDINE_SENDER_NAME="متجر الجزائر"
YALIDINE_SENDER_PHONE="0555000000"
YALIDINE_SENDER_ADDRESS="الجزائر العاصمة"
```

---

## 🗂️ Project Structure

```
dz-store/
├── app/
│   ├── (store)/                  # Public storefront routes
│   │   ├── page.tsx              # Homepage
│   │   ├── products/page.tsx     # Product listing
│   │   └── cart/page.tsx         # Cart + multi-step checkout
│   ├── (admin)/                  # Protected admin routes
│   │   ├── dashboard/page.tsx    # Analytics dashboard
│   │   ├── orders/page.tsx       # Order management
│   │   ├── products/page.tsx     # Product management
│   │   ├── logistics/page.tsx    # Wilaya pricing
│   │   └── settings/page.tsx     # Store settings
│   ├── api/
│   │   ├── orders/
│   │   │   ├── route.ts          # GET (list) + POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET + PATCH (update status)
│   │   │       └── yalidine/route.ts  # POST → push to Yalidine
│   │   ├── products/
│   │   │   ├── route.ts          # GET + POST
│   │   │   └── [id]/route.ts     # GET + PATCH + DELETE
│   │   ├── wilayas/
│   │   │   ├── route.ts          # GET all + PATCH prices
│   │   │   └── [id]/communes/route.ts  # GET communes
│   │   ├── settings/route.ts     # GET + PUT
│   │   ├── admin/stats/route.ts  # GET dashboard stats
│   │   └── auth/
│   │       ├── login/route.ts    # POST login
│   │       └── logout/route.ts   # POST logout
│   ├── auth/login/page.tsx       # Login page
│   ├── globals.css               # Tailwind + custom CSS
│   └── layout.tsx                # Root layout (Cairo font, RTL)
├── components/
│   ├── store/
│   │   ├── Navbar.tsx            # Storefront nav with cart + locale
│   │   ├── ProductCard.tsx       # Product card + skeleton
│   │   ├── StorefrontClient.tsx  # Homepage client + cart state
│   │   ├── ProductsPageClient.tsx # Products listing client
│   │   └── CheckoutForm.tsx      # Multi-step checkout (3 steps)
│   └── admin/
│       ├── AdminSidebar.tsx      # Dark sidebar navigation
│       ├── AdminDashboardClient.tsx  # Charts + stat cards
│       ├── AdminOrdersClient.tsx  # Orders table + Yalidine button
│       ├── AdminProductsClient.tsx   # Products table + inline stock
│       ├── AdminLogisticsClient.tsx  # Wilaya price editor
│       └── AdminSettingsClient.tsx   # Settings form
├── lib/
│   ├── prisma.ts                 # Singleton Prisma client
│   ├── auth.ts                   # JWT sign/verify/session
│   ├── format.ts                 # DZD formatter, date, order number
│   ├── i18n.ts                   # AR/FR/EN translation strings + t()
│   ├── validations/index.ts      # Zod schemas
│   └── services/
│       └── yalidineService.ts    # Yalidine API client + payload builder
├── prisma/
│   ├── schema.prisma             # Full DB schema
│   └── seed.ts                   # 58 wilayas + communes + admin + products
├── types/index.ts                # TypeScript interfaces
├── middleware.ts                  # Route protection (admin + auth)
├── next.config.js
├── tailwind.config.js            # Custom theme with brand colors + RTL
├── tsconfig.json
└── .env.example
```

---

## 🚚 Yalidine Workflow

1. Customer places order → COD, wilaya + commune selected
2. Admin sees order in dashboard with **"🚚 Ship via Yalidine"** button
3. Admin clicks → `POST /api/orders/:id/yalidine`
4. Server calls `createYalidineParcel()` with auto-built payload
5. Yalidine returns tracking code → stored in `order.trackingCode`
6. Order status updates to `processing`
7. Tracking code visible in orders table

---

## 💰 Currency Formatting

All prices use `ar-DZ` locale:
- Arabic: `4٬500 دج`  
- French: `4 500 DA`

```ts
formatDZD(4500, "ar") // → "4٬500 دج"
formatDZD(4500, "fr") // → "4 500 DA"
```

---

## 🔧 Production Deployment

```bash
# Build
npm run build

# Start
npm run start

# Or with PM2
pm2 start npm --name "dz-store" -- start
```

### Recommended Stack
- **VPS**: Ubuntu 22.04 (4GB RAM minimum)
- **Database**: PostgreSQL 15+
- **Reverse Proxy**: Nginx
- **SSL**: Certbot / Let's Encrypt
- **Process Manager**: PM2

---

## 📱 RTL Support

The app is fully RTL-aware:
- `dir="rtl"` on root `<html>` and section wrappers
- Tailwind `start`/`end` utilities (logical properties) used throughout
- `font-family: Cairo` for Arabic text
- Locale-specific `dir` flipping for LTR inputs (phone, email, URLs)
