# Go2Market Frontend - React E-Commerce SPA

A modern single-page application built with React, TypeScript, and Vite for the Go2Market e-commerce platform. Features Redux state management, Axios HTTP client with JWT interceptors, and React Router for client-side navigation.

> For Docker setup and deployment instructions, see the [main project README](../README.md).
> For API documentation, see the [Backend README](../azakaim_backend/README.md).

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Components](#components)
- [Services (API Client)](#services-api-client)
- [State Management (Redux)](#state-management-redux)
- [Routing](#routing)
- [Building for Production](#building-for-production)
- [Docker](#docker)

---

## Tech Stack

- **UI Framework**: React 19.2.0
- **Language**: TypeScript ~5.9.3
- **Build Tool**: Vite 7.2.2
- **State Management**: Redux Toolkit 2.11.0
- **HTTP Client**: Axios 1.13.2
- **Routing**: React Router DOM 7.9.6
- **Forms**: React Hook Form 7.66.1
- **Notifications**: Notyf 3.10.0
- **Linting**: ESLint 9.39.1 + TypeScript ESLint

---

## Architecture

The frontend follows a feature-based component architecture with centralized state management:

```
main.tsx (Entry Point)
    |
LayoutArea/Layout          <- App shell (header, footer, routing)
    |
React Router               <- Client-side navigation
    |
Feature Components         <- UI components organized by domain
    |
Services (Axios)           <- API communication layer
    |
Redux Store                <- Centralized state (auth, cart, users)
```

**Key Patterns:**
- **Feature-based organization** - Components grouped by domain (Auth, Products, Cart, Orders)
- **Service layer** - All API calls go through dedicated service modules with Axios
- **Redux slices** - State divided into auth, cart, and user slices using Redux Toolkit
- **TypeScript models** - Shared interfaces for type safety across the app
- **Axios interceptors** - Automatic JWT token injection on every request

---

## Local Development Setup

### Prerequisites

- Node.js 18+ (20 recommended)
- npm

### 1. Install Dependencies

```bash
cd azakaim_frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and set the API URL:

```env
# Local development (backend running locally)
VITE_API_BASE_URL=http://localhost:5000

# Docker development
VITE_API_BASE_URL=http://localhost:5000

# Docker production
VITE_API_BASE_URL=http://localhost:5001
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Other Scripts

```bash
# Type-check and build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint
```

---

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000` |

All environment variables must be prefixed with `VITE_` to be accessible in the frontend code (Vite requirement).

### Vite Configuration

The Vite config ([vite.config.ts](vite.config.ts)) includes:
- React plugin for JSX/TSX support
- Dev server on port 5173 with host binding for Docker

---

## Project Structure

```
azakaim_frontend/
├── src/
│   ├── main.tsx                        # App entry point + Router + Redux Provider
│   ├── index.css                       # Global styles
│   │
│   ├── Components/                     # React components by feature
│   │   ├── AboutUs/                    # About page
│   │   ├── AuthArea/                   # Login & Registration
│   │   │   ├── Login/
│   │   │   └── Register/
│   │   ├── CartsArea/                  # Shopping cart UI
│   │   ├── CategoriesArea/             # Category browsing
│   │   ├── CommonArea/                 # Shared/reusable components
│   │   ├── HomeArea/                   # Home/landing page
│   │   ├── LayoutArea/                 # App layout (header, footer, sidebar)
│   │   ├── NotFound/                   # 404 page
│   │   ├── OrdersArea/                 # Order history & details
│   │   ├── ProductsArea/               # Product listing & details
│   │   └── UsersArea/                  # User profile management
│   │
│   ├── Services/                       # API client services (Axios)
│   │   ├── AuthService.ts             # Login, register, refresh
│   │   ├── UsersService.ts            # User profile CRUD
│   │   ├── ProductsService.ts         # Product catalog
│   │   ├── CategoriesService.ts       # Categories
│   │   ├── cartsService.ts            # Shopping cart operations
│   │   ├── OrdersService.ts           # Order management
│   │   └── NotificationService.ts     # Toast notifications (Notyf)
│   │
│   ├── Redux/                          # Redux Toolkit state
│   │   ├── store.ts                   # Store configuration
│   │   ├── AuthSlice.ts               # Auth state (user, tokens)
│   │   ├── CartsSlice.ts             # Cart state
│   │   └── UsersSlice.ts             # Users state
│   │
│   ├── Models/                         # TypeScript interfaces
│   │
│   ├── Utils/                          # Utility functions
│   │
│   └── assets/                         # Images, fonts, static assets
│
├── public/                             # Public static assets
├── dist/                               # Production build output
├── package.json                        # Dependencies & scripts
├── tsconfig.json                       # TypeScript configuration
├── vite.config.ts                      # Vite build configuration
├── eslint.config.js                    # ESLint configuration
├── nginx.conf                          # Nginx config (production Docker)
├── Dockerfile                          # Production image (multi-stage, Nginx)
├── Dockerfile.dev                      # Development image (Vite dev server)
├── .env                                # Environment variables
├── .env.example                        # Environment template
└── .dockerignore                       # Docker build exclusions
```

---

## Components

Components are organized by feature domain:

| Directory | Purpose |
|-----------|---------|
| `AuthArea/` | Login and registration forms |
| `ProductsArea/` | Product listing, details, and search |
| `CategoriesArea/` | Category browsing and filtering |
| `CartsArea/` | Shopping cart view and management |
| `OrdersArea/` | Order history and order details |
| `UsersArea/` | User profile view and editing |
| `HomeArea/` | Landing page / home screen |
| `LayoutArea/` | App shell - header, footer, navigation, layout wrapper |
| `CommonArea/` | Shared/reusable components used across features |
| `AboutUs/` | About page |
| `NotFound/` | 404 error page |

---

## Services (API Client)

All backend communication is handled through service modules in `src/Services/`. Each service uses Axios with automatic JWT token injection via interceptors.

| Service | Responsibility |
|---------|---------------|
| `AuthService.ts` | Login, register, token refresh, get current user |
| `UsersService.ts` | User profile CRUD operations |
| `ProductsService.ts` | Product listing, search, create, update, delete, image upload |
| `CategoriesService.ts` | Category listing and management |
| `cartsService.ts` | Add/remove/update cart items, get cart, clear cart |
| `OrdersService.ts` | Create order, list orders, order details, status updates |
| `NotificationService.ts` | Toast notifications using Notyf |

### How JWT Token Injection Works

Axios interceptors automatically attach the JWT access token to every outgoing request:

```
Request -> Axios Interceptor -> Adds "Authorization: Bearer <token>" header -> Backend API
```

If a token expires, the refresh token can be used to obtain a new access token via `AuthService`.

---

## State Management (Redux)

The app uses Redux Toolkit with the following slices:

| Slice | State | Purpose |
|-------|-------|---------|
| `AuthSlice` | User info, access token, refresh token, login status | Authentication state |
| `CartsSlice` | Cart items, totals | Shopping cart state |
| `UsersSlice` | User list, selected user | User management state |

The store is configured in `src/Redux/store.ts` and provided at the app root in `main.tsx`.

---

## Routing

Client-side routing is handled by React Router DOM. Routes are defined in the layout component and map to feature components:

| Route | Component | Access |
|-------|-----------|--------|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/products` | Product Listing | Public |
| `/products/add` | Add Product | Manager, Admin |
| `/products/edit/:id` | Edit Product | Manager, Admin |
| `/products/details/:id` | Product Details | Public |
| `/categories` | Category Listing | Public |
| `/categories/add` | Add Category | Manager, Admin (root categories admin-only on backend) |
| `/categories/edit/:id` | Edit Category | Manager, Admin |
| `/categories/details/:id` | Category Details | Public |
| `/cart` | Shopping Cart | Customer |
| `/orders` | Orders (role-specific views) | Logged in — Customer: own orders; Cashier: today's orders; Manager/Admin: all orders |
| `/orders/:id` | Order Details | Logged in (role-specific action panels) |
| `/customers` | Customer List | Manager, Admin |
| `/employees` | Employee List | Manager, Admin |
| `/users` | Admin Panel (User Management) | Admin |
| `/profile` | User Profile | Logged in |
| `/about` | About Us | Public |
| `*` | Not Found (404) | Public |

---

## Building for Production

### Local Build

```bash
# Type-check and build
npm run build

# Preview the build
npm run preview
```

The production build outputs to the `dist/` directory.

### Production Docker Image

The production Dockerfile uses a multi-stage build:

1. **Build stage** (`node:20-alpine`) - Installs dependencies and builds the Vite app
2. **Serve stage** (`nginx:alpine`) - Serves the built static files with Nginx

Nginx configuration ([nginx.conf](nginx.conf)) includes:
- Gzip compression for text assets
- Long-term caching for static assets (1 year for JS/CSS/images)
- React Router support via `try_files` (SPA fallback to `index.html`)
- Security headers

---

## Docker

### Development (Dockerfile.dev)

- Uses `node:20-alpine`
- Runs Vite dev server on port 5173
- Volume mounts enable hot reload

```bash
# Via docker-compose (recommended)
docker-compose -f docker-compose.dev.yml up -d --build

# Access at http://localhost:5173
```

### Production (Dockerfile)

- Multi-stage build (Node build + Nginx serve)
- Accepts `VITE_API_BASE_URL` as a build argument
- Serves on port 80 (mapped to 3001 in docker-compose)

```bash
# Via docker-compose (recommended)
docker-compose up -d --build

# Access at http://localhost:3001
```

See the [main project README](../README.md) for full Docker commands reference.
