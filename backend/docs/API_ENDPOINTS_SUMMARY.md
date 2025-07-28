# API Endpoints Summary

This document provides a comprehensive overview of all available API endpoints in the Birdnest Shop backend.

## 🔐 Authentication (`/v1/auth`)

### Public Endpoints
- `POST /auth/register` - Register a new user account
- `POST /auth/login` - Login with email and password
- `POST /auth/forgot-password` - Request password reset email
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/send-verification-email` - Send email verification
- `POST /auth/verify-email` - Verify email address
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### Protected Endpoints
- `POST /auth/logout` - Logout and invalidate tokens
- `POST /auth/refresh-tokens` - Refresh access token

## 🛍️ Products (`/v1/products`)

### Public Endpoints
- `GET /products` - Get all products with filtering and pagination
  - Query parameters: `page`, `limit`, `categoryId`, `search`, `minPrice`, `maxPrice`
- `GET /products/{id}` - Get a single product by ID
- `GET /categories` - Get all product categories

### Admin Endpoints (Require Admin Role)
- `POST /admin/products` - Create a new product
- `PUT /admin/products/{id}` - Update an existing product
- `DELETE /admin/products/{id}` - Delete a product
- `POST /admin/categories` - Create a new category

## 🛒 Cart (`/v1/cart`)

### Protected Endpoints (Require Authentication)
- `GET /cart` - Get user's cart items
- `POST /cart` - Add item to cart
- `PUT /cart/{id}` - Update cart item quantity
- `DELETE /cart/{id}` - Remove item from cart
- `DELETE /cart` - Clear all cart items

## 📦 Orders (`/v1/orders`)

### Protected Endpoints (Require Authentication)
- `GET /orders` - Get user's orders with pagination
  - Query parameters: `page`, `limit`, `status`
- `POST /orders` - Create a new order
- `GET /orders/{id}` - Get a specific order

### Admin Endpoints (Require Admin Role)
- `PUT /admin/orders/{id}/status` - Update order status
- `DELETE /admin/orders/{id}` - Delete an order
- `GET /admin/orders/stats` - Get order statistics
  - Query parameters: `period` (daily, weekly, monthly, yearly)

## ⭐ Reviews (`/v1/reviews`)

### Public Endpoints
- `GET /products/{id}/reviews` - Get reviews for a product
  - Query parameters: `page`, `limit`

### Protected Endpoints (Require Authentication)
- `POST /products/{id}/reviews` - Create a review for a product
- `GET /reviews` - Get user's reviews
- `PUT /reviews/{id}` - Update a review
- `DELETE /reviews/{id}` - Delete a review

## 👥 Users (`/v1/users`)

### Admin Endpoints (Require Admin Role)
- `GET /users` - Get all users with pagination
- `GET /users/{id}` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

## 📊 Dashboard (`/v1/dashboard`)

### Admin Endpoints (Require Admin Role)
- `GET /dashboard/metrics` - Get dashboard metrics
- `GET /dashboard/revenue-chart` - Get revenue chart data

## 🏥 Health Check (`/v1/health-check`)

### Public Endpoints
- `GET /health-check` - Check API health status

## 🔑 Authentication & Authorization

### JWT Token Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Public**: No authentication required
- **User**: Valid JWT token required
- **Admin**: Valid JWT token with admin role required

### Error Responses
All endpoints return consistent error responses:
```json
{
  "code": 400,
  "status": "error",
  "message": "Error description"
}
```

### Success Responses
All endpoints return consistent success responses:
```json
{
  "code": 200,
  "status": "success",
  "message": "Success description",
  "data": { ... }
}
```

## 📋 Request/Response Examples

### Product Listing
```bash
GET /v1/products?page=1&limit=10&categoryId=1&search=bird&minPrice=100&maxPrice=500
```

### Create Order
```bash
POST /v1/orders
{
  "items": [
    {
      "productId": "product-123",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Main St, City, Country",
  "paymentMethod": "stripe"
}
```

### Add to Cart
```bash
POST /v1/cart
{
  "productId": "product-123",
  "quantity": 1
}
```

## 🚀 Testing the API

### Using Swagger UI
1. Open http://localhost:8080/docs
2. Click on any endpoint
3. Click "Try it out"
4. Fill in the required parameters
5. Click "Execute"

### Using curl
```bash
# Get products
curl -X GET "http://localhost:8080/v1/products?page=1&limit=10"

# Login
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get user profile (with token)
curl -X GET http://localhost:8080/v1/users/profile \
  -H "Authorization: Bearer <your-token>"
```

## 📚 Documentation

- **Swagger UI**: http://localhost:8080/docs
- **Alternative URL**: http://localhost:8080/swagger
- **JSON Schema**: http://localhost:8080/docs/swagger.json
- **YAML Schema**: http://localhost:8080/docs/swagger.yaml

## 🔄 Regenerating Documentation

To update the API documentation after making changes:

```bash
# From the backend directory
make swagger
```

This will regenerate the Swagger documentation from the code annotations. 