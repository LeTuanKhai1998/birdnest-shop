# Birdnest Shop Backend API

A NestJS-based REST API for the Birdnest Shop e-commerce platform, providing comprehensive functionality for product management, order processing, user authentication, and admin operations.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: CRUD operations for products with image upload support
- **Order Processing**: Complete order lifecycle management
- **User Management**: Customer profiles and admin user management
- **Address Management**: Multi-address support for customers
- **Notifications**: Real-time notification system
- **Reviews & Ratings**: Product review system
- **Settings Management**: Configurable store settings
- **Performance Monitoring**: Request tracking and performance metrics
- **Structured Logging**: Comprehensive logging with user event tracking

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd birdnest-shop/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/birdnest_shop"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   
   # App
   APP_PORT=8080
   NODE_ENV=development
   
   # CORS
   ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
   
   # UploadThing (for image uploads)
   UPLOADTHING_SECRET="your-uploadthing-secret"
   UPLOADTHING_APP_ID="your-uploadthing-app-id"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed database (optional)
   npx prisma db seed
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run start:dev
```
The API will be available at `http://localhost:8080`

### Production Mode
```bash
npm run build
npm run start:prod
```

### Docker (Alternative)
```bash
# Using docker-compose
docker-compose up -d

# Or build and run manually
docker build -t birdnest-backend .
docker run -p 8080:8080 birdnest-backend
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Test with watch mode
npm run test:watch
```

## 📚 API Documentation

### Swagger UI
Once the application is running, visit:
- **Swagger Documentation**: `http://localhost:8080/swagger`
- **API Base URL**: `http://localhost:8080/api`

### Main Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

#### Products
- `GET /api/products` - List products (with filtering/pagination)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

#### Orders
- `GET /api/orders` - List orders (user's orders or all for admin)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status (Admin only)
- `POST /api/orders/guest` - Create guest order

#### Users
- `GET /api/users` - List users (Admin only)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin only)

#### Addresses
- `GET /api/addresses` - List user addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

#### Notifications
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

#### Settings
- `GET /api/settings` - Get store settings
- `PUT /api/settings` - Update store settings (Admin only)

## 🔐 Authentication

The API uses JWT-based authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **USER**: Regular customer with access to products, orders, profile
- **ADMIN**: Full access to all endpoints including user management

## 📊 Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

- **User**: Customer and admin users
- **Product**: Product catalog with images and categories
- **Order**: Order management with items and status tracking
- **Address**: User shipping addresses
- **Notification**: User notifications
- **Review**: Product reviews and ratings
- **Setting**: Store configuration

## 🚨 Error Handling

The API uses standardized error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": ["Field 'email' is required"]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Logging

The application includes comprehensive logging:

- **Structured Logging**: JSON-formatted logs with context
- **User Event Tracking**: Track user actions and business events
- **Performance Monitoring**: Request timing and performance metrics
- **Error Logging**: Detailed error tracking with stack traces

### Log Levels
- `error` - Application errors
- `warn` - Warning messages
- `info` - General information
- `debug` - Debug information
- `verbose` - Detailed debugging

## 🔧 Development

### Project Structure
```
src/
├── common/           # Shared utilities, filters, interceptors
├── auth/            # Authentication and authorization
├── products/        # Product management
├── orders/          # Order processing
├── users/           # User management
├── addresses/       # Address management
├── notifications/   # Notification system
├── reviews/         # Review system
├── settings/        # Store settings
└── main.ts          # Application entry point
```

### Adding New Features

1. **Create Module**: Generate new module with NestJS CLI
   ```bash
   nest generate module feature-name
   ```

2. **Create Controller**: Handle HTTP requests
   ```bash
   nest generate controller feature-name
   ```

3. **Create Service**: Business logic
   ```bash
   nest generate service feature-name
   ```

4. **Add DTOs**: Data transfer objects for validation
5. **Update Prisma Schema**: Add database models if needed
6. **Add Tests**: Unit and E2E tests
7. **Update Documentation**: Add Swagger decorators

### Code Style
- Follow NestJS conventions
- Use TypeScript strict mode
- Implement proper error handling
- Add comprehensive tests
- Document with Swagger decorators

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="strong-production-secret"
ALLOWED_ORIGINS="https://yourdomain.com"
```

### Health Check
The API includes a health check endpoint:
- `GET /api/health` - Returns application status

### Performance Considerations
- Database connection pooling
- Request rate limiting
- Response caching
- Image optimization
- CDN integration for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [API Documentation](http://localhost:8080/swagger)
- Review the [Frontend Repository](../frontend/README.md)
- Open an issue on GitHub
