# Project Status - Chandrabati

## Overview
A full-stack e-commerce platform for Sarees, Lehengas, and Pakistani Dresses built with React/Vite frontend and Express.js backend, using MongoDB Atlas as the primary database.

## Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Primary DB**: MongoDB Atlas (via Mongoose)
- **Secondary DB**: PostgreSQL (via Drizzle ORM) - legacy, best-effort sync
- **Routing**: wouter (frontend), express (backend)
- **State**: TanStack Query v5

## Key Features
- Product browsing by categories (Sarees, Lehengas, Pakistani Dresses)
- Shopping cart (guest via sessionId, authenticated via userId)
- Checkout with Cash on Delivery
- Admin dashboard (password: hardcoded) with product & order management
- **Multi-image products**: 1 primary + up to 3 secondary images
- **Product reviews**: Anyone can submit reviews with name, rating (1-5), and comment
- **User authentication**: Session-based auth with bcrypt password hashing
- Responsive UI with mobile bottom navigation

## Authentication
- Session-based auth using `express-session`
- Passwords hashed with `bcryptjs`
- Endpoints: POST /api/register, POST /api/login, GET /api/auth/user, POST /api/logout
- Sessions stored in-memory (server restart clears sessions)

## Product Images
- Uploaded via multer to `public/images/`
- Served statically at `/images/filename`
- Products support `imageUrl` (primary) and `secondaryImages` (array, up to 3)
- Admin panel has drag-drop upload for both primary and secondary images

## Key Files
- `shared/schema.ts` - Drizzle schema + Zod types
- `shared/routes.ts` - API contract definitions
- `server/routes.ts` - Express route handlers
- `server/storage.ts` - Data access layer (MongoDB primary)
- `server/lib/mongodb.ts` - Mongoose schemas & connection
- `client/src/pages/Admin.tsx` - Admin dashboard
- `client/src/pages/ProductDetail.tsx` - Product detail with gallery & reviews
- `client/src/pages/Login.tsx` - Login/Signup forms
- `client/src/hooks/use-auth.ts` - Authentication hook

## Connectivity
- **Database**: MongoDB Atlas (Chandrabati cluster)
- **Environment**: MONGODB_URI in .env

## Dependencies Added
- `bcryptjs` + `@types/bcryptjs` - Password hashing
- `express-session` + `@types/express-session` - Session management
