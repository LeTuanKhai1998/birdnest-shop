# Unit Tests for Birdnest Shop Backend

This directory contains unit tests for the backend services of the Birdnest Shop application.

## Test Structure

```
test/
├── unit/
│   └── service/
│       ├── user_service_test.go      # User service tests
│       ├── order_service_test.go     # Order service tests
│       └── simple_service_test.go    # Basic service pattern tests
├── integration/
│   ├── auth_test.go                  # Authentication integration tests
│   ├── health_check_test.go          # Health check integration tests
│   └── user_test.go                  # User integration tests
└── init.go                           # Test initialization
```

## Running Tests

### Run all tests
```bash
go test ./test/... -v
```

### Run unit tests only
```bash
go test ./test/unit/... -v
```

### Run integration tests only
```bash
go test ./test/integration/... -v
```

### Run specific service tests
```bash
go test ./test/unit/service/... -v
```

## Test Coverage

### Unit Tests
- **User Service**: Tests for user CRUD operations
- **Order Service**: Tests for order management
- **Service Patterns**: Tests for common service layer patterns

### Integration Tests
- **Authentication**: End-to-end authentication flow
- **Health Check**: API health check endpoints
- **User Management**: Complete user management workflows

## Test Patterns

### Service Layer Testing
- Mock dependencies (database, external services)
- Test business logic in isolation
- Validate error handling
- Test input validation

### Integration Testing
- Use test database
- Test complete workflows
- Validate API responses
- Test authentication flows

## Best Practices

1. **Test Structure**: Use table-driven tests for multiple scenarios
2. **Mocking**: Mock external dependencies to isolate unit tests
3. **Cleanup**: Always clean up test data after tests
4. **Naming**: Use descriptive test names that explain the scenario
5. **Assertions**: Use clear assertions with meaningful error messages

## Adding New Tests

### For Unit Tests
1. Create test file in `test/unit/service/`
2. Follow the existing pattern with table-driven tests
3. Mock dependencies using testify/mock
4. Test both success and error scenarios

### For Integration Tests
1. Create test file in `test/integration/`
2. Use the test database setup
3. Test complete API workflows
4. Clean up test data after each test

## Test Database

The tests use a separate test database to avoid affecting development data. The test database is configured in `test/init.go`.

## Dependencies

- `github.com/stretchr/testify` - Testing framework and mocking
- `github.com/gofiber/fiber/v2` - HTTP framework for testing
- `gorm.io/gorm` - Database ORM for testing

## Future Improvements

1. **More Comprehensive Tests**: Add tests for all service methods
2. **Performance Tests**: Add benchmarks for critical operations
3. **Security Tests**: Add tests for authentication and authorization
4. **API Contract Tests**: Add tests to ensure API contracts are maintained 