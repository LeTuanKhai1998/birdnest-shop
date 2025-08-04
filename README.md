# Birdnest Shop - Full-Stack E-commerce Platform

A modern, full-stack e-commerce platform for bird's nest products built with Next.js 15, NestJS, and PostgreSQL.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse and search bird's nest products with filtering
- **Shopping Cart**: Add/remove items with persistent storage
- **User Authentication**: Secure login/signup with NextAuth.js
- **Order Management**: Complete checkout process with Stripe payments
- **User Dashboard**: Order history, profile management, wishlist
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Admin Features
- **Dashboard Analytics**: Revenue, orders, customer insights
- **Product Management**: CRUD operations with image upload
- **Order Management**: Process orders and update status
- **User Management**: Customer list and admin privileges
- **Real-time Updates**: Live notifications and stock alerts

### Technical Features
- **Full-Stack Architecture**: Next.js frontend + NestJS backend
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + NextAuth.js with OAuth support
- **Payments**: Stripe integration (extensible to Momo/VNPAY)
- **File Upload**: Uploadthing for product images
- **Testing**: Comprehensive unit and e2e tests
- **Code Quality**: ESLint, Prettier, TypeScript

## 📁 Project Structure

```
birdnest-shop/
├── frontend/          # Next.js 15 frontend application
│   ├── app/          # App Router pages and API routes
│   ├── components/   # Reusable UI components
│   ├── lib/          # Utilities and configurations
│   └── prisma/       # Database schema and migrations
├── backend/          # NestJS API server
│   ├── src/          # Source code
│   │   ├── auth/     # Authentication module
│   │   ├── products/ # Products API
│   │   ├── orders/   # Orders API
│   │   └── users/    # Users API
│   └── test/         # E2E tests
├── package.json      # Root package.json for monorepo
└── README.md        # This file
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+
- PostgreSQL database

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd birdnest-shop
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**:
   
   Create `.env.local` in `frontend/`:
   ```env
   DATABASE_URL=your_postgresql_url
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id
   ```
   
   Create `.env` in `backend/`:
   ```env
   DATABASE_URL=your_postgresql_url
   JWT_SECRET=your_jwt_secret
   APP_PORT=8080
   ```

4. **Set up the database**:
   ```bash
   cd birdnest-frontend
   npx prisma migrate dev
   npx prisma generate
   npm run db:seed
   ```

5. **Start the development servers**:
   ```bash
   # Terminal 1: Start backend
   cd birdnest-backend
   npm run start:dev
   
   # Terminal 2: Start frontend
   cd birdnest-frontend
   npm run dev
   ```

6. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger

## 🧪 Testing

### Backend Tests
```bash
cd birdnest-backend
npm test              # Unit tests
npm run test:e2e      # E2E tests
```

### Frontend Tests
```bash
cd birdnest-frontend
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Test Results**: 30 total tests (20 backend unit + 10 e2e tests) with 100% pass rate

## 📚 API Documentation

The backend API is documented with Swagger/OpenAPI and available at:
- **Development**: http://localhost:8080/swagger
- **Production**: https://your-domain.com/swagger

### Key Endpoints

#### Products API
- `GET /api/products` - List products with filtering
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

#### Orders API
- `GET /api/orders` - List orders with filtering
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (admin)

#### Auth API
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

## 🔧 Development

### Available Scripts

#### Root (Monorepo)
```bash
npm run install:all    # Install all dependencies
npm run dev           # Start both frontend and backend
npm run build         # Build both applications
npm run lint          # Lint all code
npm run format        # Format all code
```

#### Frontend
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run format        # Run Prettier
npm test              # Run tests
npm run db:seed       # Seed database
```

#### Backend
```bash
npm run start:dev     # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run format        # Run Prettier
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests
```

### Code Quality

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for pre-commit hooks (optional)

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## 🏃‍♂️ Easy Run with Makefile

You can use the provided `Makefile` for quick project commands:

```bash
make backend   # Start backend server (NestJS)
make frontend  # Start frontend (Next.js)
make run       # Start both backend and frontend in parallel
make test      # Run all backend and frontend tests
make stop      # Stop all running dev servers
```

- By default, backend runs on http://localhost:8080 and frontend on http://localhost:3000
- Make sure your `.env` files are set up as described above.

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend Deployment

#### Railway
1. Connect your repository to Railway
2. Set environment variables
3. Deploy automatically

#### Docker
```bash
# Build image
docker build -t birdnest-backend ./backend

# Run container
docker run -p 8080:8080 birdnest-backend
```

### Environment Variables for Production

#### Frontend (.env.production)
```env
DATABASE_URL=your_production_db_url
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

#### Backend (.env.production)
```env
DATABASE_URL=your_production_db_url
JWT_SECRET=your_production_jwt_secret
APP_PORT=8080
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@birdnestshop.com or create an issue in the repository.

---

**Built with ❤️ using Next.js, NestJS, and PostgreSQL** 