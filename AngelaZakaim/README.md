# Go2Market - Full-Stack E-Commerce Application

A full-featured e-commerce web application with a Flask REST API backend and a React frontend, featuring JWT authentication, role-based access control, shopping cart, and order management.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start with Docker (Development)](#quick-start-with-docker-development)
- [Production Deployment with Docker](#production-deployment-with-docker)
- [Docker Commands Reference](#docker-commands-reference)
- [Running Dev and Prod Together](#running-dev-and-prod-together)
- [Testing Your Deployment](#testing-your-deployment)
- [Local Development (Without Docker)](#local-development-without-docker)
- [Test Accounts](#test-accounts)
- [License](#license)

---

## Overview

Go2Market is a complete e-commerce platform consisting of:

- **Backend** (`azakaim_backend/`) - Flask REST API with JWT authentication, role-based access control (Admin, Manager, Cashier, Customer), product catalog, shopping cart, and order management. See the [Backend README](azakaim_backend/README.md) for API documentation and backend-specific details.

- **Frontend** (`azakaim_frontend/`) - React SPA with Redux state management, Axios HTTP client, and React Router. See the [Frontend README](azakaim_frontend/README.md) for component architecture and frontend-specific details.

### Key Features

- User registration and authentication with JWT tokens
- Role-based access control (Admin, Manager, Cashier, Customer)
- Product catalog with categories, search, and filtering
- Shopping cart with automatic total calculations
- Order creation and tracking with status management
- Product image uploads (5MB max)
- Pagination support across all list endpoints

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Redux Toolkit, Axios, React Router |
| **Backend** | Flask 3.0, SQLAlchemy, Flask-JWT-Extended, Marshmallow, Gunicorn |
| **Database** | SQLite (dev) / SQL Server (Docker prod) / PostgreSQL (cloud prod) |
| **Containerization** | Docker, Docker Compose |
| **Web Server** | Nginx (frontend prod), Gunicorn (backend prod) |

---

## Project Structure

```
AngelaZakaim/
├── README.md                       # This file - project overview
├── docker-compose.yml              # Production Docker Compose (SQL Server)
├── docker-compose.dev.yml          # Development Docker Compose (SQLite)
│
├── azakaim_backend/                # Flask REST API
│   ├── README.md                   # Backend documentation & API reference
│   ├── app/
│   │   ├── __init__.py             # App factory (create_app)
│   │   ├── extensions.py           # Flask extensions init
│   │   ├── enums.py                # UserRole, OrderStatus, PaymentStatus
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── routes/                 # API endpoints (blueprints)
│   │   ├── services/               # Business logic layer
│   │   ├── repositories/           # Data access layer
│   │   ├── schemas.py              # Marshmallow validation schemas
│   │   ├── utils/                  # Decorators, middleware, validators
│   │   └── static/                 # Uploaded images
│   ├── migrations/                 # Flask-Migrate (Alembic) migrations
│   ├── config.py                   # Configuration classes
│   ├── run.py                      # Dev entry point
│   ├── wsgi.py                     # Production WSGI entry point
│   ├── seed_data_go2market.py      # Database seeder script
│   ├── Dockerfile                  # Production Docker image
│   ├── requirements.txt            # Production Python dependencies
│   └── requirements-local.txt      # Local dev dependencies (no SQL Server)
│
└── azakaim_frontend/               # React SPA
    ├── README.md                   # Frontend documentation
    ├── src/
    │   ├── main.tsx                # App entry point
    │   ├── Components/             # React components by feature
    │   ├── Services/               # API client services (Axios)
    │   ├── Redux/                  # Redux Toolkit slices & store
    │   ├── Models/                 # TypeScript interfaces
    │   └── Utils/                  # Utility functions
    ├── Dockerfile                  # Production Docker image (Nginx)
    ├── Dockerfile.dev              # Development Docker image (Vite)
    ├── nginx.conf                  # Nginx config for production
    ├── vite.config.ts              # Vite build configuration
    └── package.json                # NPM dependencies
```

---

## Quick Start with Docker (Development)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd AngelaZakaim
```

### Step 2: Clean Up Previous Docker Data (Optional)

If you've run this project before and want a fresh start:

```bash
# Stop and remove all project containers, volumes, and images
docker-compose -f docker-compose.dev.yml down -v --rmi local

# Or for a complete Docker cleanup (removes ALL unused Docker data)
docker system prune -a --volumes -f
```

### Step 3: Verify docker-compose.dev.yml

Make sure the `DATABASE_URL` has the correct path (4 slashes for absolute path):

```yaml
environment:
  - DATABASE_URL=sqlite:////app/instance/ecommerce_dev.db
```

### Step 4: Build and Start Containers

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

### Step 5: Verify Containers are Running

```bash
docker ps

# You should see:
# - ecommerce-backend-dev (port 5000)
# - ecommerce-frontend-dev (port 5173)
```

### Step 6: Initialize the Database

```bash
# Initialize Flask-Migrate
docker exec -it ecommerce-backend-dev flask db init

# Create migration files
docker exec -it ecommerce-backend-dev flask db migrate -m "initial_setup"

# Apply migrations to create tables
docker exec -it ecommerce-backend-dev flask db upgrade
```

### Step 7: Seed the Database (Optional but Recommended)

```bash
docker exec -it ecommerce-backend-dev python seed_data_go2market.py
```

This creates:
- 53 users (1 admin, 1 manager, 1 cashier, 50 customers)
- 150 products across 13 categories
- 100 sample orders

### Step 8: Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Health Check | http://localhost:5000/health |

---

## Production Deployment with Docker

Production uses **SQL Server** as the database and runs on different ports so it can run alongside development.

### Prerequisites

- Docker Desktop with at least **4GB RAM** allocated (SQL Server requirement)
- Migrations folder must exist locally (created in dev environment first)

### Production URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:5001 |
| SQL Server | localhost:1433 |

### First Time Setup

```bash
# 1. Make sure migrations folder exists (if not, run dev setup first)
dir azakaim_backend\migrations

# 2. Make sure .dockerignore does NOT exclude migrations/
# Edit azakaim_backend\.dockerignore and remove the line: migrations/

# 3. Start production stack
docker-compose up -d --build

# 4. Check all containers are running
docker ps

# 5. Check logs (wait for "Starting Gunicorn...")
docker-compose logs -f backend
# Press Ctrl+C to exit logs

# 6. Seed database with test data
docker exec -it ecommerce-backend python seed_data_go2market.py
```

### Environment Files

| File | Purpose |
|------|---------|
| `azakaim_backend/.env` | Development settings (SQLite) |
| `azakaim_backend/.env.production` | Production settings (SQL Server) |

Update `.env.production` with secure values before deploying:

```env
SECRET_KEY=your-secure-random-key
JWT_SECRET_KEY=your-secure-random-key
SA_PASSWORD=YourStrongPassword123!
```

---

## Docker Commands Reference

### Development Commands

```bash
# Start containers
docker-compose -f docker-compose.dev.yml up -d

# Start and rebuild
docker-compose -f docker-compose.dev.yml up -d --build

# Stop containers (keeps data)
docker-compose -f docker-compose.dev.yml down

# Stop containers and remove volumes (deletes database)
docker-compose -f docker-compose.dev.yml down -v

# Restart containers
docker-compose -f docker-compose.dev.yml restart

# Force rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Production Commands

```bash
# Start production
docker-compose up -d --build

# Stop production
docker-compose down

# Stop and delete database
docker-compose down -v

# Restart services
docker-compose restart
```

### Viewing Logs

```bash
# Development - all logs
docker-compose -f docker-compose.dev.yml logs

# Development - backend only, follow
docker-compose -f docker-compose.dev.yml logs -f backend

# Production - all logs
docker-compose logs

# Production - backend only, follow
docker-compose logs -f backend
```

### Executing Commands in Containers

```bash
# Development
docker exec -it ecommerce-backend-dev bash
docker exec -it ecommerce-backend-dev flask shell
docker exec -it ecommerce-backend-dev python your_script.py
docker exec -it ecommerce-backend-dev printenv DATABASE_URL

# Production
docker exec -it ecommerce-backend bash
docker exec -it ecommerce-backend flask shell
docker exec -it ecommerce-backend python seed_data_go2market.py
```

### Database Management (Docker)

```bash
# Create new migration after model changes
docker exec -it ecommerce-backend-dev flask db migrate -m "description of changes"

# Apply migrations
docker exec -it ecommerce-backend-dev flask db upgrade

# Rollback last migration
docker exec -it ecommerce-backend-dev flask db downgrade

# View migration history
docker exec -it ecommerce-backend-dev flask db history
```

### Complete Reset (Fresh Start)

```bash
# Stop and remove everything
docker-compose -f docker-compose.dev.yml down -v

# Remove migrations folder locally
rmdir /s /q azakaim_backend\migrations   # Windows
# rm -rf azakaim_backend/migrations      # Linux/Mac

# Start fresh
docker-compose -f docker-compose.dev.yml up -d --build

# Verify DATABASE_URL
docker exec -it ecommerce-backend-dev printenv DATABASE_URL
# Should show: sqlite:////app/instance/ecommerce_dev.db

# Initialize database
docker exec -it ecommerce-backend-dev flask db init
docker exec -it ecommerce-backend-dev flask db migrate -m "initial_setup"
docker exec -it ecommerce-backend-dev flask db upgrade

# Seed database with test data (150 products, 100 orders, 53 users)
docker exec -it ecommerce-backend-dev python seed_data_go2market.py
```

---

## Running Dev and Prod Together

Both environments can run simultaneously on different ports:

| Service | Development | Production |
|---------|-------------|------------|
| Frontend | http://localhost:5173 | http://localhost:3001 |
| Backend | http://localhost:5000 | http://localhost:5001 |

```bash
# Start dev
docker-compose -f docker-compose.dev.yml up -d --build

# Start prod (in separate terminal or after dev is running)
docker-compose up -d --build

# Stop dev only
docker-compose -f docker-compose.dev.yml down

# Stop prod only
docker-compose down
```

---

## Testing Your Deployment

### Step 1: Check Containers are Running

```bash
docker ps
```

**Development** - You should see:
- `ecommerce-backend-dev` (port 5000)
- `ecommerce-frontend-dev` (port 5173)

**Production** - You should see:
- `ecommerce-sqlserver` (port 1433)
- `ecommerce-backend` (port 5001)
- `ecommerce-frontend` (port 3001)

### Step 2: Check Database URL

```bash
# Development
docker exec -it ecommerce-backend-dev printenv DATABASE_URL
# Should show: sqlite:////app/instance/ecommerce_dev.db

# Production
docker exec -it ecommerce-backend printenv DATABASE_URL
# Should show: mssql+pyodbc://sa:...@sqlserver:1433/ecommerce...
```

### Step 3: Test API Health

```bash
# Development
curl http://localhost:5000/

# Production
curl http://localhost:5001/
```

### Step 4: Test Login (After Seeding)

```bash
# Development
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email_or_username\": \"admin@ecommerce.com\", \"password\": \"Admin123!\"}"

# Production
curl -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d "{\"email_or_username\": \"admin@ecommerce.com\", \"password\": \"Admin123!\"}"
```

### Step 5: Test Products Endpoint

```bash
# Development
curl "http://localhost:5000/api/products?page=1&per_page=5"

# Production
curl "http://localhost:5001/api/products?page=1&per_page=5"
```

### Step 6: Check Frontend

- **Development**: http://localhost:5173
- **Production**: http://localhost:3001

### If Tests Fail

If you get empty results or errors, the database might not be set up yet:

```bash
# Development
docker exec -it ecommerce-backend-dev flask db upgrade
docker exec -it ecommerce-backend-dev python seed_data_go2market.py

# Production
docker exec -it ecommerce-backend python seed_data_go2market.py
```

### Quick Summary Table

| Test | Development | Production |
|------|-------------|------------|
| Containers | `ecommerce-backend-dev`, `ecommerce-frontend-dev` | `ecommerce-sqlserver`, `ecommerce-backend`, `ecommerce-frontend` |
| Backend API | http://localhost:5000/api/products | http://localhost:5001/api/products |
| Frontend | http://localhost:5173 | http://localhost:3001 |
| Health Check | http://localhost:5000/health | http://localhost:5001/health |
| API Docs | http://localhost:5000/api | http://localhost:5001/api |

---

## Local Development (Without Docker)

### Backend

```bash
cd azakaim_backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

# Install dependencies
pip install -r requirements-local.txt

# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
python seed_data_go2market.py

# Run
python run.py
# API available at http://localhost:5000
```

### Frontend

```bash
cd azakaim_frontend

# Install dependencies
npm install

# Configure API URL
# Edit .env and set VITE_API_BASE_URL=http://localhost:5000

# Run
npm run dev
# App available at http://localhost:5173
```

See the [Backend README](azakaim_backend/README.md) and [Frontend README](azakaim_frontend/README.md) for detailed setup instructions.

---

## Test Accounts

After seeding the database, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | Admin123! |
| Manager | manager@ecommerce.com | Manager123! |
| Cashier | cashier@ecommerce.com | Cashier123! |
| Customer | customer1@email.com | Customer123! |
| Customer | customer2@email.com | Customer123! |
| ... | customer3-50@email.com | Customer123! |

---

## License

[Your License Here]

---

## Contributors

Angela Zakaim
