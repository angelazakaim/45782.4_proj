# Go2Market Backend - Flask E-Commerce REST API

A full-featured e-commerce REST API built with Flask, featuring JWT authentication, role-based access control, shopping cart, and order management.

> For Docker setup and deployment instructions, see the [main project README](../README.md).

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Products](#products)
- [Categories](#categories)
- [Cart](#cart)
- [Orders](#orders)
- [Users](#users)
- [Role-Based Access Control](#role-based-access-control)
- [Testing with Postman](#testing-with-postman)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## Tech Stack

- **Framework**: Flask 3.0.0
- **ORM**: Flask-SQLAlchemy 3.1.1
- **Migrations**: Flask-Migrate 4.0.5 (Alembic)
- **Authentication**: Flask-JWT-Extended 4.5.3
- **Validation**: Marshmallow 3.20.1
- **Image Processing**: Pillow 12.1.0
- **CORS**: Flask-CORS 4.0.0
- **Rate Limiting**: Flask-Limiter 3.5.0
- **Production Server**: Gunicorn 21.2.0
- **Database**: SQLite (dev) / PostgreSQL (cloud) / SQL Server (enterprise Docker)

---

## Architecture

The backend follows a layered architecture pattern:

```
Routes (Flask Blueprints)     <- HTTP request handling
       |
Services (Business Logic)    <- Core business rules
       |
Repositories (Data Access)   <- Database queries
       |
Models (SQLAlchemy ORM)      <- Entity definitions
       |
Database                     <- SQLite / PostgreSQL / SQL Server
```

### Project Structure

```
azakaim_backend/
├── app/
│   ├── __init__.py             # App factory (create_app)
│   ├── extensions.py           # Flask extensions initialization
│   ├── enums.py                # UserRole, OrderStatus, PaymentStatus, PaymentMethod
│   ├── logging_config.py       # Logging configuration
│   ├── schemas.py              # Marshmallow validation schemas
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── user.py             # User (base auth entity)
│   │   ├── customer.py         # Customer profile
│   │   ├── employee.py         # Employee profile
│   │   ├── product.py          # Product catalog item
│   │   ├── category.py         # Product category
│   │   ├── cart.py              # Shopping cart
│   │   ├── cart_item.py        # Cart line item
│   │   ├── order.py            # Purchase order
│   │   └── order_item.py       # Order line item
│   ├── routes/                 # API endpoints (Flask Blueprints)
│   │   ├── auth_routes.py      # /api/auth/*
│   │   ├── user_routes.py      # /api/users/*
│   │   ├── product_routes.py   # /api/products/*
│   │   ├── category_routes.py  # /api/categories/*
│   │   ├── cart_routes.py      # /api/cart/*
│   │   └── order_routes.py     # /api/orders/*
│   ├── services/               # Business logic layer
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── product_service.py
│   │   ├── category_service.py
│   │   ├── cart_service.py
│   │   └── order_service.py
│   ├── repositories/           # Data access layer
│   │   ├── user_repository.py
│   │   ├── product_repository.py
│   │   ├── category_repository.py
│   │   ├── cart_repository.py
│   │   ├── customer_repository.py
│   │   ├── employee_repository.py
│   │   └── order_repository.py
│   ├── utils/                  # Utility modules
│   │   ├── decorators.py       # Auth & role decorators
│   │   ├── middleware.py
│   │   ├── logger.py
│   │   └── validators.py
│   └── static/
│       └── uploads/            # Uploaded product images
├── migrations/                 # Auto-generated Alembic migrations
├── instance/                   # SQLite database file (dev)
├── config.py                   # Configuration classes (Dev/Prod/Test)
├── run.py                      # Development entry point
├── wsgi.py                     # Production WSGI entry point
├── seed_data_go2market.py      # Database seeder
├── Dockerfile                  # Production Docker image
├── requirements.txt            # Production dependencies
├── requirements-local.txt      # Local dev dependencies (no pyodbc)
├── .env                        # Environment variables
├── .env.example                # Environment template
└── .env.production             # Production environment template
```

---

## Local Development Setup

### Prerequisites

- Python 3.8+
- pip

### 1. Create Virtual Environment

```bash
cd azakaim_backend

# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
# For local development (SQLite, no SQL Server driver)
pip install -r requirements-local.txt

# For full installation (includes PostgreSQL and SQL Server drivers)
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and adjust values:

```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=sqlite:///instance/ecommerce_dev.db
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Initialize Database

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Seed with test data
python seed_data_go2market.py
```

### 5. Run the Application

```bash
python run.py
```

The API will be available at `http://localhost:5000`.

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Environment (development/production/testing) | development |
| `SECRET_KEY` | Flask secret key | (required) |
| `DATABASE_URL` | Database connection string | sqlite:///instance/ecommerce_dev.db |
| `JWT_SECRET_KEY` | JWT signing key | (required) |
| `JWT_ACCESS_TOKEN_EXPIRES` | Access token TTL (seconds) | 3600 |
| `JWT_REFRESH_TOKEN_EXPIRES` | Refresh token TTL (seconds) | 2592000 |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | * |
| `DEFAULT_PAGE_SIZE` | Default pagination size | 20 |
| `MAX_PAGE_SIZE` | Maximum pagination size | 100 |
| `PORT` | Server port | 5000 |

### Database URL Formats

```bash
# SQLite (Development)
DATABASE_URL=sqlite:////app/instance/ecommerce_dev.db  # Docker (absolute path)
DATABASE_URL=sqlite:///instance/ecommerce_dev.db       # Local (relative path)

# PostgreSQL (Production - Render/Heroku)
DATABASE_URL=postgresql://user:password@host:5432/database

# SQL Server (Enterprise / Docker Production)
DATABASE_URL=mssql+pyodbc://user:password@host:1433/database?driver=ODBC+Driver+18+for+SQL+Server
```

---

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Response Format

All responses follow this structure:

**Success:**
```json
{
  "message": "Success message",
  "data": { ... }
}
```

**Error:**
```json
{
  "error": "Error message",
  "details": { ... }
}
```

### Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error occurred |

---

## Authentication

### Register User

**POST** `/api/auth/register`

```json
{
  "email": "customer@example.com",
  "username": "customer1",
  "password": "password123",
  "role": "customer",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address_line1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "username": "customer1",
    "role": "customer"
  },
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
  }
}
```

### Login

**POST** `/api/auth/login`

```json
{
  "email_or_username": "customer@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "role": "customer"
  }
}
```

### Refresh Token

**POST** `/api/auth/refresh`

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Get Current User

**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "username": "customer1",
    "role": "customer"
  },
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
  }
}
```

---

## Products

### Get All Products

**GET** `/api/products`

**Query Parameters:**
- `page` (int, default: 1)
- `per_page` (int, default: 20, max: 100)
- `category_id` (int, optional)
- `featured` (boolean, optional)

**Example:**
```
GET /api/products?page=1&per_page=20&category_id=1
```

**Response (200):**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "slug": "product-name",
      "description": "Product description",
      "price": 99.99,
      "compare_price": 129.99,
      "discount_percentage": 23.08,
      "sku": "SKU-001",
      "stock_quantity": 50,
      "is_in_stock": true,
      "category_id": 1,
      "image_url": "/static/uploads/products/image.jpg",
      "is_featured": true
    }
  ],
  "total": 100,
  "pages": 5,
  "current_page": 1,
  "per_page": 20
}
```

### Search Products

**GET** `/api/products?search_type=<type>&search_value=<value>`

**Search Types:** `id`, `sku`, `slug`, `barcode`, `name`

**Examples:**
```
GET /api/products?search_type=sku&search_value=SKU-001
GET /api/products?search_type=name&search_value=laptop
GET /api/products?search_type=slug&search_value=gaming-laptop
```

### Upload Product Image

**POST** `/api/products/upload-image`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` - Image file (png, jpg, jpeg, gif, webp, max 5MB)

**Response (201):**
```json
{
  "url": "/static/uploads/products/abc123.jpg"
}
```

### Create Product

**POST** `/api/products/add` _(Manager+ required)_

```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "compare_price": 129.99,
  "sku": "SKU-NEW-001",
  "barcode": "1234567890",
  "stock_quantity": 100,
  "category_id": 1,
  "weight": 1.5,
  "dimensions": "10x20x30 cm",
  "image_url": "/static/uploads/products/image.jpg",
  "is_active": true,
  "is_featured": false
}
```

---

## Categories

### Get All Categories

**GET** `/api/categories`

### Get Category by ID

**GET** `/api/categories/<id>`

### Create Category

**POST** `/api/categories` _(Manager+ for subcategories, Admin for top-level)_

### Update Category

**PUT** `/api/categories/<id>` _(Manager+ required)_

### Delete Category

**DELETE** `/api/categories/<id>` _(Admin required)_

---

## Cart

### Get User's Cart

**GET** `/api/cart` _(Auth required)_

### Add Item to Cart

**POST** `/api/cart/add` _(Auth required)_

### Update Cart Item Quantity

**PUT** `/api/cart/update` _(Auth required)_

### Remove Item from Cart

**DELETE** `/api/cart/remove/<item_id>` _(Auth required)_

### Clear Entire Cart

**DELETE** `/api/cart/clear` _(Auth required)_

---

## Orders

### List User's Orders

**GET** `/api/orders` _(Auth required)_

### Get Order Details

**GET** `/api/orders/<id>` _(Auth required)_

### Create Order from Cart

**POST** `/api/orders` _(Auth required)_

### Update Order Status

**PUT** `/api/orders/<id>` _(Staff required)_

### Get Order Items

**GET** `/api/orders/<id>/items` _(Auth required)_

---

## Users

### Get User Profile

**GET** `/api/users/profile` _(Auth required)_

### Update User Profile

**PUT** `/api/users/profile` _(Auth required)_

### List All Users

**GET** `/api/users` _(Admin required)_

### Get User by ID

**GET** `/api/users/<id>` _(Admin required)_

### Delete User

**DELETE** `/api/users/<id>` _(Admin required)_

---

## Role-Based Access Control

### Roles Hierarchy

```
Admin (Full Access)
  |
Manager (Manage operations, view reports)
  |
Cashier (Process orders, view today's data)
  |
Customer (Shopping, cart, own orders)
```

### Permission Matrix

| Endpoint | Customer | Cashier | Manager | Admin |
|----------|----------|---------|---------|-------|
| **Products** |
| View Products | Y | Y | Y | Y |
| Create Product | - | - | Y | Y |
| Update Product | - | - | Y | Y |
| Delete Product | - | - | - | Y |
| **Categories** |
| View Categories | Y | Y | Y | Y |
| Create Top Category | - | - | - | Y |
| Create Subcategory | - | - | Y | Y |
| Update Category | - | - | Y | Y |
| Delete Category | - | - | - | Y |
| **Cart** |
| Manage Own Cart | Y | Y | Y | Y |
| **Orders** |
| Create Order | Y | Y | Y | Y |
| View Own Orders | Y | - | - | - |
| Cancel Own Order | Y | - | - | - |
| View Today's Orders | - | Y | Y | Y |
| Update Order Status | - | Y | Y | Y |
| View All Orders | - | - | Y* | Y |
| Process Refund | - | - | - | Y |
| Delete Order | - | - | - | Y |
| **Users** |
| View Own Profile | Y | Y | Y | Y |
| Update Own Profile | Y | Y | Y | Y |
| View Customers | - | - | Y | Y |
| View Employees | - | - | Y | Y |
| Manage Users | - | - | - | Y |
| Change Roles | - | - | - | Y |

*Manager can view last 30 days only

---

## Testing with Postman

### 1. Import Collection

1. Download `Flask_Ecommerce_API.postman_collection.json`
2. Open Postman
3. Click **Import** and select the file

### 2. Set Up Environment

The collection includes these variables:
- `base_url` - API base URL (default: http://localhost:5000)
- `access_token` - JWT access token (auto-set on login)
- `refresh_token` - JWT refresh token (auto-set on login)

### 3. Quick Start

1. **Register** - `POST /api/auth/register` - Create accounts for different roles
2. **Login** - `POST /api/auth/login` - Tokens are auto-saved
3. **Test** - All subsequent requests use the saved access token

### 4. Test Different Roles

1. Login as customer - Test shopping endpoints
2. Login as cashier - Test staff endpoints
3. Login as manager - Test management endpoints
4. Login as admin - Test admin endpoints

### Quick Curl Tests

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "testuser", "password": "Test123!", "role": "customer", "first_name": "Test", "last_name": "User", "phone": "555-1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email_or_username": "admin@ecommerce.com", "password": "Admin123!"}'

# Access protected endpoint
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"

# Get products (public)
curl "http://localhost:5000/api/products?page=1&per_page=10"

# Get categories (public)
curl http://localhost:5000/api/categories

# Get orders (auth required)
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## Troubleshooting

### "unable to open database file"

**Cause:** Incorrect DATABASE_URL path

**Fix:** Use absolute path with 4 slashes in Docker:
```yaml
DATABASE_URL=sqlite:////app/instance/ecommerce_dev.db
```

### "Directory migrations already exists"

**Cause:** Running `flask db init` when migrations folder exists

**Fix:**
```bash
# Skip init, run migrate directly
flask db migrate -m "your_message"
flask db upgrade

# Or delete and start fresh
rm -rf migrations/
flask db init
```

### Container won't start

```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs backend

# Verify environment
docker exec -it ecommerce-backend-dev printenv DATABASE_URL
```

### Database Connection Error (PostgreSQL)

1. Check PostgreSQL is running: `sudo service postgresql status`
2. Verify database credentials in `.env`
3. Ensure database exists: `psql -U postgres -c "\l"`

### JWT Token Expired

Use the refresh token endpoint:
```
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

### Image Upload Fails (413)

Check `MAX_CONTENT_LENGTH` in `.env` (default: 5MB).

### Permission Denied (403)

- Verify you're logged in with the correct role
- Check the permission matrix above
- Admin account may be required for the operation

### Changes not reflecting in container

```bash
# Restart (volume mounts should auto-sync)
docker-compose -f docker-compose.dev.yml restart backend

# Or rebuild
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## Security Best Practices

1. **Environment Variables** - Never commit `.env` to version control
2. **JWT Secrets** - Use strong, random secrets in production
3. **Password Policy** - Enforce minimum 8 characters
4. **HTTPS** - Always use HTTPS in production
5. **CORS** - Configure allowed origins properly
6. **Rate Limiting** - Implement rate limiting on sensitive endpoints
7. **Input Validation** - All inputs validated using Marshmallow schemas
8. **SQL Injection** - Protected by SQLAlchemy ORM
9. **Image Upload** - Files validated for type and size (5MB max)
