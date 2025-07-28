# Birdnest Shop - Monorepo

This is a monorepo containing the frontend and backend for the Birdnest Shop application.

## Project Structure

```
birdnest-shop/
├── frontend/          # Next.js 15 frontend application
├── backend/           # Backend API (future implementation)
├── package.json       # Root package.json for monorepo
└── README.md         # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+

### Installation

1. Install all dependencies:
   ```bash
   npm run install:all
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Start production server:
   ```bash
   npm run start
   ```

## Frontend

The frontend is a Next.js 15 application located in the `frontend/` directory.

### Features

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- NextAuth.js for authentication
- Prisma ORM with PostgreSQL
- Stripe payment integration
- Responsive design
- Admin dashboard

### Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Backend

The backend directory is reserved for future backend API implementation.

## Development

### Working with the Frontend

```bash
cd frontend
npm run dev
```

### Working with the Backend

```bash
cd backend
# Backend setup instructions will be added here
```

## Deployment

### Frontend Deployment

The frontend can be deployed to Vercel, Netlify, or any other Next.js-compatible platform.

### Environment Variables for Production

Make sure to set the following environment variables in your deployment platform:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_API_URL`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary. 

## Scratchpad

### 1. Project Setup and Configuration [X]

- [X] Initialize Next.js 15 project with TypeScript
- [X] Set up project structure and folders
- [X] Configure ESLint and Prettier
- [X] Install and configure dependencies:
  - Shadcn UI components
  - Lucide icons
  - Zod for validation
  - Zustand for state management
  - Recharts for analytics
  - Resend for emails
  - Uploadthing for file uploads
  - Prisma ORM
  - PostgreSQL database
  - NextAuth.js beta for authentication
  - Stripe for payments

### 2. Database and Authentication [X]

- [X] Set up PostgreSQL database
- [X] Configure Prisma schema:
  - User model
  - Product model
  - Category model
  - Order model
  - Review model
  - Cart model
- [X] Implement NextAuth.js authentication:
  - Email/Password
  - OAuth providers (Google, GitHub)
  - JWT handling
  - Protected routes
- [X] Fix authentication integration between frontend and backend:
  - [X] Resolve @hookform/resolvers/zod compatibility issue (downgraded to v4.1.3)
  - [X] Update NextAuth.js to authenticate with backend API
  - [X] Store backend JWT tokens in NextAuth session
  - [X] Update API client to include authentication headers
  - [X] Fix all API calls to include session tokens
  - [X] Test backend authentication endpoints
  - [X] Seed database with test users (admin@birdnest.com/admin123, customer1@example.com/password123)

### 3. Core Features - Customer Side [X]

- [X] Home Layout:
  - Create `(home)` folder in the `app` directory  
  - Header with logo, search bar, and navigation (Home, Products, About, Contact)  
  - Footer with links (Purchase Policy, Delivery, Return & Exchange) and social media (Facebook, Zalo, Instagram)

- [X] Homepage:
  - Banner carousel (images of bird's nest, gift combos, promotions)  
  - Latest bird's nest products  
  - Premium bird's nest combos

- [X] Products Catalog:
  - Sidebar with categories and filters:  
    - Nest type: Refined Nest, Raw Nest, Feather-removed Nest  
    - Origin: Kien Giang  
    - Weight: 50g, 100g, 200g  
    - Price range  
  - Search results  
  - Product grid  
  - Pagination

- [X] Product pages:
  - Create product detail page layout  
  - Implement image gallery with thumbnails  
  - Add product information section:  
    - Product name, price, full description  
    - Stock status (in stock / out of stock)  
    - Add to cart button  
  - Reviews and ratings section:  
    - Display existing reviews  
    - Add review form for authenticated users  
    - Star rating component  
  - Related products section:  
    - Show products from the same category  
    - Product card carousel

- [X] Shopping cart:
  - Add/remove items  
  - Update quantities  
  - Cart persistence (via localStorage or Zustand)

- [X] Checkout process:
  - Shipping information (Full name, phone number, delivery address)  
  - Payment integration (Stripe — international, extendable to Momo/VNPAY later)  
  - Order confirmation page with order ID

- [X] User dashboard:
  - Order history (with status tracking)  
  - Profile management (personal info, password change)  
  - Saved addresses  
  - Wishlist (favorite products)


### 4. Admin Dashboard [X]

- [X] Admin authentication and authorization (Implemented: /admin route, only accessible by isAdmin users, unauthorized users redirected)
- [X] Dashboard overview:
  - [X] Layout and Structure:
    - Create admin dashboard layout with sidebar navigation
    - Implement responsive grid for dashboard widgets
    - Add loading states and error boundaries
  - [X] Key Metrics Cards:
    - Total revenue widget with real data
    - Total orders widget with real data
    - Total customers widget with real data
    - Average order value widget with real data
  - [X] Sales Analytics:
    - [X] Revenue Chart:
      - Implement line chart using Recharts
      - Add daily/weekly/monthly/yearly filters
      - Show revenue trends over time
      - Add tooltip with detailed information
    - [X] Order Statistics:
      - Bar chart for order volume
      - Order status distribution
      - Peak ordering times
  - [X] Recent Orders Table:
    - [X] Implement data table with columns:
      - Order ID
      - Customer name
      - Order total
      - Status
      - Date
    - [X] Add sorting and filtering
    - [X] Quick actions (view, process, update status)
  - [X] Low Stock Alerts:
    - Products with stock below threshold
    - Quick restock actions
    - Stock level indicators
  - [X] Top Products:
    - Best-selling products list
    - Revenue by product
    - Stock status
  - [X] Customer Insights:
    - New vs returning customers
    - Customer acquisition chart
    - Top customers by revenue
  - [X] Real-time Updates:
    - Implement WebSocket connection
    - Live order notifications
    - Stock level updates
  - [X] Export and Reports:
    - CSV/PDF export functionality
    - Custom date range selection
    - Report generation
- [X] Product management:
  - CRUD operations
  - Bulk actions
  - Image upload (Uploadthing)
- [X] Order management:
  - Order processing
  - Status updates
  - Refund handling
- [X] User management:
  - Customer list
  - Admin privileges
  - User actions

### 5. Backend - Golang API Server [X]

#### Setup and Architecture
- [X] Create new backend using the Go Fiber boilerplate:
  - [X] Clone https://github.com/indrayyana/go-fiber-boilerplate into `/backend`
  - [X] Initialize Go module; copy `.env.example` to `.env`
  - [X] Configure PostgreSQL connection with Neon database
  - [X] Update database connection to use SSL mode
  - [X] Set backend to run on port 8080
  - [X] Set up DB migrations using `golang-migrate` and configure PostgreSQL
  - [X] Create database schema migration files
  - [X] Create Go models matching Prisma schema
  - [X] Fix service layer to work with new models
  - [X] Fix middleware to work with new models
  - [X] Implement JWT auth for login/register
  - [X] Add endpoints to replace current mock APIs:
    - [X] `/api/products` (GET, POST, PUT, DELETE)
    - [X] `/api/orders` (create, read, update status)
    - [X] `/api/users` (list customers, admin privileges)
    - [X] `/api/cart`, `/api/reviews`
- [X] Ensure CORS is enabled for frontend origin
- [X] Generate Swagger docs accessible at `/swagger`
- [X] Create comprehensive database seeder with sample data
- [X] Provide startup commands via `Makefile` or `Taskfile`
- [X] Make sure backend runs independently on port `8080` and frontend uses this base URL

#### Auth and Middleware
- [X] Implement JWT authentication and middleware
- [X] Middleware for:
  - Auth guard (admin / customer)
  - Logging
  - CORS
  - Rate limiting

#### Features to Implement (Mirror Frontend Needs)
- [X] Auth API:
  - Sign in, Sign up
  - OAuth login handler (Google/Github if needed)
  - Password reset (stub for now)
- [X] Products API:
  - CRUD for admin
  - Public product listing, filter, search
- [X] Orders API:
  - Create order
  - Update order status
  - Get order history (user & admin)
- [X] Cart API:
  - Add/remove/update cart items
- [X] Dashboard metrics API:
  - Total revenue, customers, AOV
  - Order stats (daily/weekly)
- [X] Reviews API:
  - Add review (user)
  - List reviews per product

#### Migration Tasks
- [X] Identify mock or real API logic currently implemented in frontend `/app/api/**`
- [X] Migrate each handler into Go Fiber equivalents in `/backend/handlers`
  - Convert TypeScript/Next.js handlers to Go
  - Use DTOs and request validation via `fiber` or `go-playground/validator`
- [X] Reuse Prisma schema models where applicable by mapping them to GORM or SQL structs
- [X] Replace direct DB logic with services following clean architecture

#### Frontend Integration
- [X] Remove mock data in frontend (e.g., `/lib/mock`, hardcoded arrays)
- [X] Replace all API calls to use new backend endpoints
  - Use `fetch` or `axios` pointing to `http://localhost:8080/v1`
- [X] Ensure frontend dynamic pages (Products, Orders, User Management) render using real backend data
- [X] Update frontend loading states, error handling if necessary

#### Data Seeding and Testing [X]
- [X] Create comprehensive database seeder (`backend/src/database/seeder/seeder.go`)
- [X] Seed categories: Refined Nest, Raw Nest, Feather-removed Nest, Combo
- [X] Seed products: 7 bird's nest products with images and descriptions
- [X] Seed users: Admin user and 2 customer users with hashed passwords
- [X] Seed orders: Sample orders for customers with order items
- [X] Seed reviews: Customer reviews for all products
- [X] Add seeder command to Makefile (`make seed`)
- [X] Verify backend API endpoints are working with real data
- [X] Confirm both backend (port 8080) and frontend (port 3001) are running

#### Best Practices
- [X] Follow clean architecture principles
- [X] Handle errors via structured error types
- [X] Use DTOs / request binding with validation
- [X] Implement pagination, sorting, filtering
- [X] Write unit tests for services
  - [X] Created unit test structure for user, order, and service patterns
  - [X] Implemented table-driven tests with proper test cases
  - [X] Added test documentation and best practices
  - [X] Set up test dependencies (testify, gorm, fiber)
- [X] Swagger / OpenAPI for documentation (via `swag` or `go-fiber/swagger`)
  - [X] Installed and configured swag command-line tool
  - [X] Generated comprehensive API documentation with Swagger annotations
  - [X] Set up Swagger UI accessible at `/docs` and `/swagger`
  - [X] Created API documentation guide and best practices
  - [X] Added `make swagger` command for easy documentation regeneration
  - [X] Created test script to verify Swagger functionality
- [ ] Prepare Makefile or Taskfile for dev tools


### 6. Advanced Features [ ]

- [ ] Real-time notifications
- [ ] Email system (Resend):
  - Order confirmations
  - Shipping updates
  - Password reset
- [ ] Search optimization
- [ ] Performance optimization:
  - Image optimization
  - Caching strategies
  - API optimization
- [ ] Analytics and reporting

### 7. Testing and Deployment [ ]

- [ ] Unit testing
- [ ] Integration testing
- [ ] E2E testing
- [ ] Security audit
- [ ] Production deployment:
  - Environment setup
  - CI/CD pipeline
  - Monitoring
  - Backup strategy

### 8. Documentation [ ]

- [ ] API documentation
- [ ] User guide
- [ ] Admin documentation
- [ ] Deployment guide 