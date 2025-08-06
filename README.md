# Birdnest Shop - Full-Stack E-commerce Platform

A modern, full-stack e-commerce platform built with Next.js 15 frontend and NestJS backend, featuring comprehensive product management, user authentication, admin dashboard, and real-time notifications.

## 🏗️ Project Architecture

This is a monorepo structure with separate frontend and backend applications:

```
birdnest-shop/
├── birdnest-frontend/     # Next.js 15 Frontend Application
├── birdnest-backend/      # NestJS Backend API
├── docker-compose.yml     # Docker development setup
├── nginx/                 # Nginx configuration
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd birdnest-shop
```

### 2. Backend Setup

```bash
cd birdnest-backend
npm install
cp env.example .env
# Configure your environment variables
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### 3. Frontend Setup

```bash
cd birdnest-frontend
npm install
cp env.example .env.local
# Configure your environment variables
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger
- **Health Check**: http://localhost:8080/api/health

## 🎯 Features

### Customer Features
- **Product Browsing**: Advanced catalog with filtering and search
- **Shopping Cart**: Persistent cart with real-time updates
- **User Authentication**: Secure login with multiple providers
- **Order Management**: Complete order lifecycle
- **Guest Checkout**: Purchase without registration
- **Order Tracking**: Real-time order status updates
- **Wishlist**: Save favorite products
- **Reviews & Ratings**: Product review system
- **Notifications**: Real-time notification system
- **Address Management**: Multiple shipping addresses

### Admin Features
- **Dashboard Analytics**: Comprehensive sales metrics
- **Product Management**: CRUD operations with image upload
- **Order Processing**: Manage and update orders
- **User Management**: Customer and admin user management
- **Settings Management**: Store configuration
- **Inventory Management**: Stock tracking and alerts
- **Performance Monitoring**: Request tracking and metrics

### Technical Features
- **Responsive Design**: Mobile-first approach
- **Performance Optimized**: Lazy loading and code splitting
- **SEO Optimized**: Meta tags and structured data
- **Security**: JWT authentication and role-based access
- **Real-time Updates**: WebSocket notifications
- **Image Upload**: Secure file upload with optimization
- **API Documentation**: Swagger/OpenAPI integration

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **File Upload**: UploadThing
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **File Upload**: UploadThing

### DevOps
- **Containerization**: Docker
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (Frontend), Railway (Backend)

## 📁 Project Structure

```
birdnest-shop/
├── birdnest-frontend/          # Next.js Frontend
│   ├── app/                   # App Router pages
│   ├── components/            # React components
│   ├── lib/                  # Utilities and API client
│   ├── hooks/                # Custom React hooks
│   └── public/               # Static assets
├── birdnest-backend/          # NestJS Backend
│   ├── src/                  # Source code
│   │   ├── auth/            # Authentication
│   │   ├── products/        # Product management
│   │   ├── orders/          # Order processing
│   │   ├── users/           # User management
│   │   ├── notifications/   # Notification system
│   │   └── common/          # Shared utilities
│   ├── prisma/              # Database schema
│   └── test/                # E2E tests
├── docker-compose.yml        # Development environment
├── nginx/                   # Production nginx config
└── scripts/                 # Deployment scripts
```

## 🔧 Development

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/birdnest_shop"
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
PORT=8080
NODE_ENV=development
```

#### Frontend (.env.local)
```env
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:8080"
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

### Development Commands

#### Backend
```bash
cd birdnest-backend
npm run start:dev    # Start development server
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run build        # Build for production
```

#### Frontend
```bash
cd birdnest-frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Lint code
npm run test         # Run tests
```

### Database Management

```bash
cd birdnest-backend
npx prisma generate   # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma db seed    # Seed database
npx prisma studio     # Open database GUI
```

## 🚀 Deployment

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

#### Frontend (Vercel)
```bash
cd birdnest-frontend
vercel --prod
```

#### Backend (Railway/Render)
```bash
cd birdnest-backend
# Deploy to Railway or Render
```

### Environment Setup

1. **Database**: Set up PostgreSQL instance
2. **Environment Variables**: Configure all required variables
3. **Domain**: Set up custom domain and SSL
4. **Monitoring**: Set up error tracking and analytics

## 🧪 Testing

### Backend Testing
- **Unit Tests**: Service and controller testing
- **E2E Tests**: API endpoint testing
- **Integration Tests**: Database integration testing

### Frontend Testing
- **Unit Tests**: Component testing
- **Integration Tests**: Page and feature testing
- **E2E Tests**: User flow testing

### Test Coverage
- Aim for >80% code coverage
- Critical business logic coverage
- Error handling coverage

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: Frontend performance metrics
- **API Response Times**: Backend performance tracking
- **Error Tracking**: Application error monitoring
- **User Analytics**: User behavior tracking

### Health Checks
- **Frontend**: Built-in Next.js health checks
- **Backend**: `/api/health` endpoint
- **Database**: Connection status monitoring

## 🔐 Security

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Admin and user role management
- **OAuth Integration**: Google, GitHub authentication
- **Session Management**: Secure session handling

### Data Protection
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: Cross-site request forgery prevention

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the coding standards
4. **Add tests**: Ensure all new features are tested
5. **Update documentation**: Keep docs up to date
6. **Submit a pull request**: Describe your changes clearly

### Development Guidelines

- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write comprehensive tests
- Update API documentation
- Follow conventional commits
- Implement proper error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Frontend Documentation](birdnest-frontend/README.md)
- [Backend Documentation](birdnest-backend/README.md)
- [API Documentation](http://localhost:8080/swagger)

### Getting Help
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Email**: Contact the development team

## 🔄 Recent Updates

### Latest Improvements
- ✅ **Code Quality**: Removed unused imports and variables
- ✅ **Error Handling**: Improved exception handling
- ✅ **Performance**: Optimized loading and caching
- ✅ **Security**: Enhanced authentication and validation
- ✅ **Documentation**: Comprehensive README updates
- ✅ **Testing**: Enhanced test coverage and structure

## 🎉 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **NestJS Team**: For the robust Node.js framework
- **Shadcn UI**: For the beautiful component library
- **Prisma Team**: For the excellent ORM
- **Vercel**: For the seamless deployment platform

---

**Built with ❤️ by the Birdnest Shop Team** 