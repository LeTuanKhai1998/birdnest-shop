# API Documentation with Swagger/OpenAPI

This document describes the Swagger/OpenAPI documentation setup for the Birdnest Shop API.

## Overview

The API documentation is automatically generated using [swaggo/swag](https://github.com/swaggo/swag) and served using [gofiber/swagger](https://github.com/gofiber/swagger).

## Accessing the Documentation

### Development Environment
- **Swagger UI**: http://localhost:8080/docs
- **Alternative URL**: http://localhost:8080/swagger
- **JSON Schema**: http://localhost:8080/docs/swagger.json
- **YAML Schema**: http://localhost:8080/docs/swagger.yaml

### Production Environment
Documentation is only available in non-production environments for security reasons.

## API Endpoints Documentation

### Authentication (`/v1/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `POST /auth/logout` - Logout and invalidate tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/send-verification-email` - Send email verification
- `POST /auth/verify-email` - Verify email address
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### Users (`/v1/users`)
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user (admin only)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (admin only)

### Products (`/v1/products`)
- `GET /products` - Get all products with filtering
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

### Orders (`/v1/orders`)
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status (admin only)

### Cart (`/v1/cart`)
- `GET /cart` - Get user's cart
- `POST /cart` - Add item to cart
- `PUT /cart/:id` - Update cart item
- `DELETE /cart/:id` - Remove item from cart

### Reviews (`/v1/reviews`)
- `GET /products/:id/reviews` - Get product reviews
- `POST /products/:id/reviews` - Add product review
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

### Dashboard (`/v1/dashboard`)
- `GET /dashboard/metrics` - Get dashboard metrics (admin only)
- `GET /dashboard/charts` - Get chart data (admin only)

## Regenerating Documentation

### Prerequisites
Install the swag command-line tool:
```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

### Generate Documentation
```bash
# From the backend directory
export PATH=$PATH:~/go/bin
swag init -g src/main.go -o src/docs
```

### Using Makefile
```bash
make docs
```

## Swagger Annotations

### Main API Information
```go
// @title BirdNest Shop API
// @version 1.0.0
// @description BirdNest Shop REST API for e-commerce platform
// @termsOfService http://swagger.io/terms/
// @contact.name API Support
// @contact.email support@birdnest.vn
// @license.name MIT
// @license.url https://github.com/indrayyana/go-fiber-boilerplate/blob/main/LICENSE
// @host localhost:8080
// @BasePath /v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Example Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Endpoint Documentation
```go
// @Tags         Auth
// @Summary      Register as user
// @Accept       json
// @Produce      json
// @Param        request  body  validation.Register  true  "Request body"
// @Router       /auth/register [post]
// @Success      201  {object}  example.RegisterResponse
// @Failure      409  {object}  example.DuplicateEmail  "Email already taken"
func (a *AuthController) Register(c *fiber.Ctx) error {
    // Implementation
}
```

## Request/Response Models

### Authentication Models
- `validation.Register` - User registration request
- `validation.Login` - User login request
- `validation.Logout` - User logout request
- `validation.ForgotPassword` - Password reset request
- `validation.UpdatePassOrVerify` - Password update request

### Response Models
- `example.RegisterResponse` - Registration success response
- `example.LoginResponse` - Login success response
- `example.FailedLogin` - Login failure response
- `example.DuplicateEmail` - Email already exists error
- `example.NotFound` - Resource not found error
- `example.Unauthorized` - Authentication error

## Security

### Authentication
The API uses JWT (JSON Web Tokens) for authentication:

1. **Login**: POST `/auth/login` with email/password
2. **Token**: Receive access and refresh tokens
3. **Authorization**: Include `Authorization: Bearer <token>` header
4. **Refresh**: POST `/auth/refresh` to get new tokens

### Authorization
- **Public endpoints**: No authentication required
- **User endpoints**: Valid JWT token required
- **Admin endpoints**: Valid JWT token with admin role required

## Error Handling

### Standard Error Responses
```json
{
  "code": 400,
  "status": "error",
  "message": "Invalid request body"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Testing the API

### Using Swagger UI
1. Open http://localhost:8080/docs
2. Click on any endpoint
3. Click "Try it out"
4. Fill in the required parameters
5. Click "Execute"

### Using curl
```bash
# Login
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get products (public)
curl -X GET http://localhost:8080/v1/products

# Get user profile (authenticated)
curl -X GET http://localhost:8080/v1/users/profile \
  -H "Authorization: Bearer <your-token>"
```

## Development Workflow

1. **Add new endpoint**: Add Swagger annotations to controller method
2. **Update models**: Add or update request/response models
3. **Regenerate docs**: Run `swag init -g src/main.go -o src/docs`
4. **Test**: Verify documentation at http://localhost:8080/docs
5. **Commit**: Include updated docs in version control

## Best Practices

1. **Always document new endpoints** with proper Swagger annotations
2. **Use descriptive summaries** and detailed descriptions
3. **Include all possible responses** (success and error cases)
4. **Keep examples up to date** with actual API behavior
5. **Test the documentation** to ensure it matches the implementation
6. **Regenerate docs** after any API changes

## Troubleshooting

### Documentation not updating
- Ensure swag is installed: `go install github.com/swaggo/swag/cmd/swag@latest`
- Regenerate docs: `swag init -g src/main.go -o src/docs`
- Restart the server after regeneration

### Swagger UI not loading
- Check if server is running on correct port
- Verify docs route is configured in router
- Check browser console for JavaScript errors

### Missing endpoints in documentation
- Ensure all controller methods have Swagger annotations
- Check that annotations are properly formatted
- Verify that models are properly imported and referenced 