# ELEGANCE Sarees - E-Commerce Platform

## Overview

This is a full-stack e-commerce web application for "ELEGANCE Sarees" (based on Purnima Saree BD), selling traditional South Asian ethnic wear including sarees, lehengas, Pakistani dresses, and party dresses. The app provides product browsing, shopping cart functionality, checkout with guest and authenticated user support, product reviews, and order management. It follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project is organized into three main directories:
- **`client/`** — React frontend (SPA)
- **`server/`** — Express.js backend (API server)
- **`shared/`** — Shared types, schemas, and route definitions used by both client and server

### Frontend Architecture
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side router)
- **State/Data Fetching:** TanStack React Query for server state management
- **UI Components:** shadcn/ui (New York style) built on Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables for theming, custom color palette with premium design tokens
- **Animations:** Framer Motion for page transitions and UI animations
- **Forms:** React Hook Form with Zod resolvers for validation
- **Fonts:** Fahkwang (headings) and Montserrat (body text)
- **Build Tool:** Vite with HMR support

Key pages: Home, Shop, Category pages (Sarees, Lehengas, Pakistani Dresses), Product Detail, Cart, Checkout, Order Success, 404

### Backend Architecture
- **Framework:** Express.js with TypeScript
- **Runtime:** tsx for development, esbuild for production bundling
- **API Pattern:** RESTful JSON API under `/api/` prefix
- **Route Definitions:** Centralized in `shared/routes.ts` with Zod schemas for input validation and response typing — shared between client and server
- **Session Management:** express-session with connect-pg-simple (PostgreSQL-backed sessions)
- **Authentication:** Replit Auth (OpenID Connect) via Passport.js, implemented in `server/replit_integrations/auth/`
- **Development:** Vite dev server middleware for HMR; production serves static files from `dist/public`

### Data Storage
- **Database:** PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM:** Drizzle ORM with drizzle-zod for schema-to-validation integration
- **Schema Location:** `shared/schema.ts` (main tables) and `shared/models/auth.ts` (auth tables)
- **Migrations:** Drizzle Kit with `db:push` command for schema syncing

### Database Tables
1. **`users`** — Auth user profiles (id, email, name, profile image). Mandatory for Replit Auth.
2. **`sessions`** — Server-side session storage. Mandatory for Replit Auth.
3. **`products`** — Product catalog (name, description, price, originalPrice, imageUrl, category, stock, isNewArrival)
4. **`reviews`** — Product reviews (rating 1-5, comment, optional image)
5. **`cart_items`** — Shopping cart (supports both authenticated userId and guest sessionId)
6. **`orders`** — Order records with guest checkout support (guestName, guestEmail, guestPhone, address)
7. **`order_items`** — Individual items within orders

### API Endpoints
All defined in `shared/routes.ts`:
- `GET /api/products` — List products (optional category/search filters)
- `GET /api/products/:id` — Get single product
- `GET /api/products/:id/reviews` — List reviews for a product
- `POST /api/products/:id/reviews` — Create a review
- `GET /api/cart` — Get cart items
- `POST /api/cart` — Add item to cart
- `PATCH /api/cart/:id` — Update cart item quantity
- `DELETE /api/cart/:id` — Remove cart item
- `POST /api/orders` — Create an order
- `GET /api/auth/user` — Get current authenticated user

### Authentication
- Uses Replit Auth (OpenID Connect) — not username/password
- Auth tables (`users`, `sessions`) are mandatory and should not be dropped
- Login flow redirects to `/api/login`, logout to `/api/logout`
- `isAuthenticated` middleware protects auth-required routes
- Cart works for both authenticated users (via userId) and guests (via sessionId)

### Storage Layer
- `server/storage.ts` defines the `IStorage` interface and `DatabaseStorage` class
- Extends `IAuthStorage` from the Replit Auth integration
- All database operations go through this storage layer

### Build System
- **Development:** `npm run dev` runs tsx with Vite middleware for HMR
- **Production Build:** `npm run build` runs a custom script (`script/build.ts`) that builds the Vite frontend and bundles the server with esbuild
- **Production Start:** `npm start` runs the bundled server from `dist/index.cjs`
- **Schema Push:** `npm run db:push` syncs Drizzle schema to PostgreSQL

## External Dependencies

### Required Services
- **PostgreSQL Database** — Required. Connection via `DATABASE_URL` environment variable. Used for all data storage including sessions.
- **Replit Auth (OIDC)** — Authentication provider. Requires `ISSUER_URL` (defaults to `https://replit.com/oidc`), `REPL_ID`, and `SESSION_SECRET` environment variables.

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit** — Database ORM and migration tooling
- **@tanstack/react-query** — Server state management
- **shadcn/ui** ecosystem (Radix UI primitives, class-variance-authority, tailwind-merge, clsx)
- **wouter** — Client-side routing
- **framer-motion** — Animations
- **react-hook-form** + **@hookform/resolvers** — Form management
- **zod** + **drizzle-zod** — Schema validation (shared between client and server)
- **passport** + **openid-client** — Authentication
- **connect-pg-simple** — PostgreSQL session store
- **express-session** — Session middleware

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Secret for session encryption
- `REPL_ID` — Replit environment identifier (auto-set in Replit)
- `ISSUER_URL` — OIDC issuer URL (optional, defaults to Replit's OIDC endpoint)