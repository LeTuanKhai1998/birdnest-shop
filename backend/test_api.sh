#!/bin/bash

echo "🧪 Testing BirdNest Shop Backend API"
echo "======================================"

BASE_URL="http://localhost:8080/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $BASE_URL$endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint")
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Success${NC}"
        echo "Response: $response" | head -c 200
        echo "..."
    else
        echo -e "${RED}❌ Failed${NC}"
    fi
}

# Test health check
test_endpoint "GET" "/health-check" "" "Health Check"

# Test products
test_endpoint "GET" "/products" "" "Get All Products"

# Test authentication
test_endpoint "POST" "/auth/login" '{"email":"admin@birdnest.com","password":"admin123"}' "Admin Login"

# Test customer login
test_endpoint "POST" "/auth/login" '{"email":"customer1@example.com","password":"password123"}' "Customer Login"

# Test registration
test_endpoint "POST" "/auth/register" '{"email":"newuser@example.com","password":"password123","name":"New User"}' "User Registration"

echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Use the JWT token from login responses for protected endpoints"
echo "2. Test dashboard endpoints with admin token"
echo "3. Test cart and order endpoints with customer token" 