# GO-2 Market Frontend

A modern, full-featured e-commerce web application built with React, TypeScript, and Vite. This application provides a complete shopping experience with role-based access control, product management, shopping cart, order processing, and comprehensive user management.

![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.2-646cff?logo=vite)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.11.0-764abc?logo=redux)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Available Scripts](#-available-scripts)
- [Architecture Overview](#-architecture-overview)
- [Authentication & Authorization](#-authentication--authorization)
- [Routing](#-routing)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [Development Guidelines](#-development-guidelines)
- [Contributing](#-contributing)

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with access and refresh tokens
- **Automatic Token Refresh** on expiry with axios interceptors
- **Role-Based Access Control (RBAC)** with 4 roles:
  - Admin - Full system access
  - Manager - Business operations management
  - Cashier - Point of sale operations
  - Customer - Shopping and order management
- **Secure Logout** with complete state cleanup
- **Password Management** (change password functionality)

### 👥 User Management
- **User Registration** with role-specific profile creation
- **User Profile Management** (view and edit)
- **Admin Dashboard** for user administration
- **Customer Management** (for managers/admins)
- **Employee Management** (for admins)
- **User Filtering** by role
- **Ban/Unban Users** (manager/admin)
- **Role Changes** (admin only)
- **Password Reset** (admin only)

### 🛍️ Product Management
- **Comprehensive Product Catalog** with pagination
- **Advanced Search & Filtering**:
  - Search by name, SKU, barcode, category, or slug
  - Category-based filtering
  - Stock status filtering
  - Featured products filtering
- **Product CRUD Operations** (Create, Read, Update, Delete)
- **Image Upload** with multipart form data
- **Product Details** view with full information
- **Stock Management**
- **Pricing & Discounts**
- **Product Categorization**

### 🗂️ Category Management
- **Hierarchical Categories** with parent-child relationships
- **Category CRUD Operations**
- **Subcategory Creation**
- **Category Tree Building**
- **Category-based Product Filtering**
- **Active/Inactive Categories**

### 🛒 Shopping Cart
- **Persistent Cart** using localStorage
- **Guest Cart** that syncs on login
- **Real-time Cart Validation**
- **Quantity Management**
- **Add/Remove Items**
- **Cart Clearing**
- **Price Calculation** (subtotal, tax, shipping)
- **Cart Item Count** display in navigation

### 📦 Order Processing
- **Complete Checkout Flow** with shipping address
- **Order Creation** from cart
- **Order History** for customers
- **Order Management** for staff:
  - View all orders (with date filtering for managers)
  - Update order status
  - Update payment status
  - Ship orders with tracking
  - Add internal notes
  - Process refunds (admin only)
- **Order Cancellation** (customers)
- **Order Details** view with items and customer info
- **Order Status Tracking**:
  - Pending
  - Confirmed
  - Processing
  - Shipped
  - Delivered
  - Cancelled
  - Refunded

### 🎨 UI/UX Features
- **Responsive Design**
- **Pagination** for all list views
- **Toast Notifications** (Notyf)
- **Loading States**
- **Error Handling**
- **Form Validation** (React Hook Form)
- **Navigation Menu** with role-based visibility
- **Product Cards** with images and pricing
- **Order Cards** with status badges

## 🛠️ Tech Stack

### Core
- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.2** - Build tool and dev server

### State Management
- **Redux Toolkit 2.11.0** - Global state management
- **React Router DOM 7.9.6** - Client-side routing

### HTTP & API
- **Axios 1.13.2** - HTTP client with interceptors
- **Custom Axios Configuration** - JWT token handling

### Forms & Validation
- **React Hook Form 7.66.1** - Form state management

### Notifications
- **Notyf 3.10.0** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **Vite Plugin React** - Fast refresh support

## 📁 Project Structure

```
go-2-market/
├── src/
│   ├── Components/
│   │   ├── AboutUs/
│   │   │   ├── AboutUs.tsx
│   │   │   └── AboutUs.css
│   │   ├── AuthArea/
│   │   │   ├── AuthMenu/          # User menu dropdown
│   │   │   ├── Login/             # Login form
│   │   │   └── Register/          # Registration form
│   │   ├── CartsArea/
│   │   │   ├── Cart/              # Shopping cart view
│   │   │   └── Checkout/          # Checkout process
│   │   ├── CategoriesArea/
│   │   │   ├── AddCategory/       # Add new category
│   │   │   ├── Categories/        # Category list
│   │   │   ├── CategoryCard/      # Category card component
│   │   │   ├── CategoryDetails/   # Category details view
│   │   │   └── EditCategory/      # Edit category
│   │   ├── CommonArea/
│   │   │   └── Pagination/        # Reusable pagination component
│   │   ├── HomeArea/
│   │   │   ├── Home/              # Homepage
│   │   │   ├── Recommendation/    # Product recommendations
│   │   │   └── Sale/              # Sale/featured products
│   │   ├── LayoutArea/
│   │   │   ├── Footer/            # Footer component
│   │   │   ├── Header/            # Header component
│   │   │   ├── Layout/            # Main layout wrapper
│   │   │   ├── NavBar/            # Navigation bar
│   │   │   └── Routing/           # Route definitions
│   │   ├── NotFound/              # 404 page
│   │   ├── OrdersArea/
│   │   │   ├── OrderCard/         # Order card component
│   │   │   ├── OrderDetails/      # Order details view
│   │   │   └── Orders/            # Orders list
│   │   ├── ProductsArea/
│   │   │   ├── AddProduct/        # Add new product
│   │   │   ├── EditProduct/       # Edit product
│   │   │   ├── ProductCard/       # Product card component
│   │   │   ├── ProductDetails/    # Product details view
│   │   │   └── Products/          # Products list
│   │   └── UsersArea/
│   │       ├── AddUser/           # Add new user (deprecated)
│   │       ├── AdminCreateUser/   # Admin user creation
│   │       ├── Customerprofiledisplay/  # Customer profile display
│   │       ├── Customers/         # Customers list
│   │       ├── EditUser/          # Edit user
│   │       ├── Employeeprofiledisplay/  # Employee profile display
│   │       ├── Employees/         # Employees list
│   │       ├── UserCard/          # User card component
│   │       ├── UserDetails/       # User details view
│   │       ├── UserProfile/       # User profile page
│   │       ├── Users/             # Users list
│   │       └── UserStatistics/    # User statistics dashboard
│   ├── Models/
│   │   ├── Cart.ts                # Cart & CartItem interfaces
│   │   ├── Category.ts            # Category interfaces
│   │   ├── CredentialsModel.ts    # Login credentials
│   │   ├── Customer.ts            # Customer profile interface
│   │   ├── Employee.ts            # Employee profile interface
│   │   ├── Enums.ts               # Shared enums and types
│   │   ├── FullProduct.ts         # Extended product model
│   │   ├── Order.ts               # Order & OrderItem interfaces
│   │   ├── Product.ts             # Product interfaces
│   │   ├── TokensModel.ts         # JWT tokens interface
│   │   └── User.ts                # User interfaces
│   ├── Redux/
│   │   ├── AuthSlice.ts           # Authentication state
│   │   ├── CartsSlice.ts          # Cart state
│   │   ├── UsersSlice.ts          # Users state
│   │   └── store.ts               # Redux store configuration
│   ├── Services/
│   │   ├── AuthService.ts         # Authentication API calls
│   │   ├── cartsService.ts        # Cart API calls
│   │   ├── CategoriesService.ts   # Categories API calls
│   │   ├── NotificationService.ts # Toast notifications
│   │   ├── OrdersService.ts       # Orders API calls
│   │   ├── ProductsService.ts     # Products API calls
│   │   └── UsersService.ts        # Users API calls
│   ├── Utils/
│   │   ├── axiosConfig.ts         # Axios interceptors setup
│   │   ├── Config.ts              # Environment configuration
│   │   ├── forceLoggedInHook.ts   # Auth guard hook
│   │   └── useHasRole.ts          # Role checking hook
│   ├── index.css                  # Global styles
│   └── main.tsx                   # Application entry point
├── index.html                     # HTML template
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript configuration
└── vite.config.ts                 # Vite configuration
```

## 🚀 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Backend API server running (default: http://localhost:5000)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd go-2-market
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update `src/Utils/Config.ts` with your backend API URL

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173` (default Vite port)

## ⚙️ Environment Configuration

The application uses different configurations for development and production environments. Configuration is located in `src/Utils/Config.ts`:

### Development Configuration
```typescript
BASE_URL = 'http://localhost:5000';
AUTH_API_URL = 'http://localhost:5000/api/auth';
USERS_API_URL = 'http://localhost:5000/api/users';
PRODUCTS_API_URL = 'http://localhost:5000/api/products';
CATEGORIES_API_URL = 'http://localhost:5000/api/categories';
CART_API_URL = 'http://localhost:5000/api/cart';
ORDERS_API_URL = 'http://localhost:5000/api/orders';
```

### Production Configuration
Update the `ProductionConfig` class in `Config.ts` with your production API URLs:
```typescript
BASE_URL = 'https://api.yourcompany.com';
AUTH_API_URL = 'https://api.yourcompany.com/api/auth';
// ... other URLs
```

The configuration automatically switches based on `process.env.NODE_ENV`.

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (TypeScript + Vite) |
| `npm run lint` | Run ESLint for code quality |
| `npm run preview` | Preview production build locally |

## 🏗️ Architecture Overview

### Component Architecture
The application follows a feature-based component organization:

- **Area-based Organization**: Components are grouped by feature area (Auth, Products, Users, etc.)
- **Separation of Concerns**: Each component has its own TypeScript and CSS files
- **Reusable Components**: Common components (Pagination) in CommonArea
- **Layout Components**: Shared layout structure (Header, Footer, NavBar)

### Service Layer
All API communication is centralized in service classes:

- **Single Responsibility**: Each service handles one domain (Auth, Products, etc.)
- **Error Handling**: Centralized error handling with NotificationService
- **Type Safety**: Full TypeScript interfaces for requests/responses
- **Axios Integration**: Uses configured axios instance with interceptors

### State Management Pattern
Redux Toolkit is used for global state with three main slices:

1. **AuthSlice**: User authentication state and tokens
2. **CartsSlice**: Shopping cart with localStorage persistence
3. **UsersSlice**: User list with caching and pagination

### Custom Hooks
- **useForceLoggedUser**: Route guard that checks authentication and roles
- **useHasRole**: Check if current user has required role(s)

## 🔐 Authentication & Authorization

### JWT Token Flow

1. **Login**: User submits credentials
2. **Token Storage**: Access and refresh tokens stored in Redux + localStorage
3. **Auto-Injection**: Axios request interceptor adds token to all requests
4. **Token Refresh**: 401 responses trigger automatic refresh token use
5. **Logout**: Clears all tokens and cart from Redux + localStorage

### Request Interceptor
```typescript
// Automatically adds Authorization header to all requests
axios.interceptors.request.use((config) => {
    const token = store.getState().authStore.access_token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### Response Interceptor
```typescript
// Handles 401 errors and automatic token refresh
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Attempt token refresh
            const newToken = await authService.refreshToken(refreshToken);
            // Retry original request with new token
            return axios(originalRequest);
        }
        return Promise.reject(error);
    }
);
```

### Role-Based Access
Components use the `useForceLoggedUser` hook for protection:

```typescript
// Require authentication
useForceLoggedUser();

// Require specific roles
useForceLoggedUser(
    "Please log in",
    [UserRole.ADMIN, UserRole.MANAGER],
    "Admin or Manager access required"
);
```

Conditional rendering with `useHasRole`:
```typescript
const isStaff = useHasRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]);

{isStaff && <StaffOnlyFeature />}
```

## 🛤️ Routing

### Public Routes
- `/` → Redirect to `/home`
- `/home` → Homepage
- `/about` → About Us page
- `/login` → Login page
- `/register` → Registration page
- `/products` → Products catalog
- `/products/details/:prodId` → Product details

### Protected Routes (Authenticated Users)
- `/cart` → Shopping cart
- `/checkout` → Checkout process
- `/orders` → Order history
- `/orders/:orderId` → Order details
- `/profile` → User profile

### Admin/Manager Routes
- `/categories` → Category management
- `/categories/add` → Add category
- `/categories/edit/:id` → Edit category
- `/products/add` → Add product
- `/products/edit/:prodId` → Edit product
- `/users` → User management (Admin only)
- `/users/create` → Create user (Admin only)
- `/users/:id` → User details (Admin only)
- `/customers` → Customer list (Manager/Admin)
- `/employees` → Employee list (Admin only)

### Route Protection
Routes are protected using the `useForceLoggedUser` hook within components:

```typescript
export function AdminOnlyPage() {
    useForceLoggedUser("Please log in", [UserRole.ADMIN]);
    // Component content
}
```

## 🗄️ State Management

### Redux Store Structure
```typescript
{
    authStore: {
        user: User | null,
        access_token: string | null,
        refresh_token: string | null
    },
    cartStore: {
        items: LocalCartItem[]
    },
    userStore: {
        users: User[],
        pagination: { total, pages, currentPage },
        loading: boolean,
        error: string | null,
        lastUpdated: number | null
    }
}
```

### Auth State Actions
- `loginAction(payload)` - Store tokens and user on login
- `logoutAction()` - Clear all auth state
- `updateUserAction(user)` - Update user info

### Cart State Actions
- `fillCartAction(items)` - Replace entire cart (on login)
- `addItemAction(item)` - Add or increment item
- `removeItemAction(productId)` - Remove item
- `clearCartAction()` - Clear cart

### Users State Actions
- `fillUsersAction(response)` - Load users with pagination
- `addNewUserAction(user)` - Add new user to state
- `deleteUserAction(id)` - Remove user from state
- `updateUserAction(user)` - Update existing user
- `setLoading(bool)` - Set loading state
- `setError(message)` - Set error message

### LocalStorage Persistence
Auth and cart states are automatically persisted to localStorage:

- Auth tokens: `access_token`, `refresh_token`, `user`
- Cart items: `cart_items`

This enables:
- Session persistence across page reloads
- Guest cart preservation during registration/login
- Seamless user experience

## 🌐 API Integration

### Service Classes

All API endpoints are abstracted into service classes:

#### AuthService
```typescript
- login(credentials)          // POST /api/auth/login
- register(data)              // POST /api/auth/register
- logout()                    // Local state cleanup
- changePassword(data)        // POST /api/auth/change-password
- getCurrentUser()            // GET /api/auth/me
- refreshToken(token)         // POST /api/auth/refresh
```

#### ProductsService
```typescript
- getAllProducts(page, perPage, filters)  // GET /api/products
- searchProducts(type, value)             // GET /api/products?search_type=...
- getOneProduct(id)                       // GET /api/products?search_type=id
- getProductBySku(sku)                    // GET /api/products?search_type=sku
- getProductBySlug(slug)                  // GET /api/products?search_type=slug
- uploadImage(file)                       // POST /api/products/upload-image
- addNewProduct(product)                  // POST /api/products/add
- updateProduct(id, product)              // PUT /api/products/:id
- deleteProduct(id)                       // DELETE /api/products/:id
```

#### CartService
```typescript
- getCart()                              // GET /api/cart
- validateCart()                         // GET /api/cart/validate
- addToCart(productId, quantity)         // POST /api/cart/items
- updateCartItem(productId, quantity)    // PUT /api/cart/items/:productId
- removeFromCart(productId)              // DELETE /api/cart/items/:productId
- clearCart()                            // POST /api/cart/clear
```

#### OrdersService
```typescript
// Customer endpoints
- createOrder(payload)                   // POST /api/orders
- getMyOrders(page, perPage)            // GET /api/orders
- getOrder(orderId)                     // GET /api/orders/:id
- cancelOrder(orderId)                  // POST /api/orders/:id/cancel

// Manager/Admin endpoints
- getAllOrders(page, perPage, status)   // GET /api/orders/admin
- updateStatus(orderId, status)         // PUT /api/orders/:id/status
- updatePaymentStatus(orderId, status)  // PUT /api/orders/:id/payment-status
- shipOrder(orderId, tracking)          // POST /api/orders/:id/ship
- addNotes(orderId, notes)              // POST /api/orders/:id/notes
- processRefund(orderId, reason)        // POST /api/orders/:id/refund
- deleteOrder(orderId)                  // DELETE /api/orders/:id
```

#### UsersService
```typescript
- getAllUsers(page, perPage, filters)    // GET /api/users
- getAllCustomers(page, perPage)         // GET /api/users/customers
- getUserById(id)                        // GET /api/users/:id
- getOwnProfile()                        // GET /api/users/profile
- updateOwnProfile(data)                 // PUT /api/users/profile
- updateUser(id, data)                   // PUT /api/users/:id
- deleteUser(id)                         // DELETE /api/users/:id
- banUser(id)                            // POST /api/users/:id/ban
- unbanUser(id)                          // POST /api/users/:id/unban
- changeUserRole(id, data)               // PUT /api/users/:id/role
- resetPassword(id, newPassword)         // POST /api/users/:id/password-reset
- getUserStatistics()                    // GET /api/users/statistics
```

#### CategoriesService
```typescript
- getAllCategories(parentOnly)           // GET /api/categories
- getCategoryById(id)                    // GET /api/categories/:id
- getCategoryBySlug(slug)                // GET /api/categories/slug/:slug
- createCategory(category)               // POST /api/categories
- createSubcategory(parentId, category)  // POST /api/categories/:id/subcategory
- updateCategory(id, category)           // PUT /api/categories/:id
- deleteCategory(id)                     // DELETE /api/categories/:id
- buildCategoryTree(categories)          // Client-side tree building
```

### Error Handling

All services use the `NotificationService` for consistent error handling:

```typescript
try {
    const data = await axios.get(url);
    notificationService.success("Success message");
    return data;
} catch (error) {
    notificationService.error(error); // Automatically formats and displays
    throw error;
}
```

The `NotificationService` handles:
- Axios errors with status-based messages
- Server error responses (extracts `error` or `message` field)
- Generic error objects
- String errors
- Unknown errors with logging

## 📝 Development Guidelines

### TypeScript Best Practices
- Use strict mode
- Define interfaces for all data models
- Avoid `any` type
- Use type guards where needed
- Export types from model files

### Component Structure
```typescript
// Import React and hooks
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Import services and models
import { productService } from "../../Services/ProductsService";
import type { Product } from "../../Models/Product";

// Import styles
import "./ComponentName.css";

// Component definition
export function ComponentName() {
    // Hooks
    const navigate = useNavigate();
    const [data, setData] = useState<Product[]>([]);
    
    // Effects
    useEffect(() => {
        // Fetch data
    }, []);
    
    // Handlers
    const handleClick = () => {
        // Handle event
    };
    
    // Render
    return (
        <div className="ComponentName">
            {/* JSX */}
        </div>
    );
}
```

### Service Class Pattern
```typescript
class ServiceName {
    async getResource(id: number): Promise<Resource> {
        try {
            const response = await axios.get(`${config.API_URL}/${id}`);
            return response.data;
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    }
}

export const serviceName = new ServiceName();
```

### State Management
- Use Redux for global state (auth, cart, cached data)
- Use local component state for UI state
- Use localStorage for persistence
- Implement caching where appropriate (see UsersService)

### Form Handling
- Use React Hook Form for forms
- Implement proper validation
- Handle loading and error states
- Show user feedback (notifications)

### Styling
- Use CSS modules or component-scoped CSS files
- Follow BEM naming convention where appropriate
- Use CSS variables for theming (defined in index.css)
- Keep styles close to components

### API Integration
- All API calls through service classes
- Handle errors consistently
- Show loading states
- Use TypeScript interfaces for responses
- Implement retry logic where needed (axios interceptor)

## 🤝 Contributing

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Convention
Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process or auxiliary tool changes

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with proper TypeScript types
3. Test thoroughly
4. Update documentation if needed
5. Submit PR to `develop` branch
6. Address review feedback
7. Merge after approval

## 📦 Building for Production

```bash
# Create production build
npm run build

# Output will be in /dist directory
```

### Build Optimization
- TypeScript compilation with strict checks
- Vite production optimizations
- Code splitting
- Tree shaking
- Minification

### Deployment
1. Build the application: `npm run build`
2. Deploy the `/dist` folder to your hosting service
3. Configure your web server to serve `index.html` for all routes (SPA)
4. Set up environment variables for production API URLs

### Example Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/go-2-market/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🐛 Troubleshooting

### Common Issues

**Issue: CORS errors**
- Solution: Ensure backend has proper CORS configuration
- Check that backend allows your frontend origin

**Issue: 401 Unauthorized errors**
- Solution: Check that axios interceptors are set up (in main.tsx)
- Verify tokens are being stored in localStorage
- Check token expiration times

**Issue: Cart not persisting**
- Solution: Check localStorage is enabled in browser
- Verify cart slice is saving to localStorage on each mutation

**Issue: Routes not working after refresh**
- Solution: Configure server to serve index.html for all routes
- Use `HashRouter` as fallback if server configuration is not possible

**Issue: TypeScript errors**
- Solution: Run `npm run build` to see detailed errors
- Ensure all imports have proper types
- Check tsconfig.json configuration

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Authors

Your team name or individual contributors

## 🙏 Acknowledgments

- React Team for the amazing library
- Vite Team for the blazing fast build tool
- Redux Toolkit Team for simplified state management
- All open-source contributors

---

**Happy Coding! 🚀**

For questions or support, please open an issue in the repository.
