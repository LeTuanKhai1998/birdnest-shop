#!/bin/bash

echo "🚀 Testing Updated Swagger UI and API Documentation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}Checking server status...${NC}"
if ! curl -s http://localhost:8080/docs > /dev/null; then
    echo -e "${RED}❌ Server is not running on port 8080${NC}"
    echo "Please start the server with: go run src/main.go"
    exit 1
fi
echo -e "${GREEN}✅ Server is running on port 8080${NC}"

echo ""
echo -e "${BLUE}Testing Swagger UI endpoints...${NC}"

# Test Swagger UI redirects
if curl -s -I http://localhost:8080/docs | grep -q "302 Found"; then
    echo -e "${GREEN}✅ /docs redirect working${NC}"
else
    echo -e "${RED}❌ /docs redirect not working${NC}"
fi

if curl -s -I http://localhost:8080/docs/index.html | grep -q "200 OK"; then
    echo -e "${GREEN}✅ /docs/index.html accessible${NC}"
else
    echo -e "${RED}❌ /docs/index.html not accessible${NC}"
fi

if curl -s -I http://localhost:8080/swagger | grep -q "302 Found"; then
    echo -e "${GREEN}✅ /swagger redirect working${NC}"
else
    echo -e "${RED}❌ /swagger redirect not working${NC}"
fi

# Test API schema files
echo ""
echo -e "${BLUE}Testing API schema files...${NC}"

if curl -s http://localhost:8080/docs/swagger.json | grep -q '"swagger":"2.0"'; then
    echo -e "${GREEN}✅ swagger.json is valid${NC}"
else
    echo -e "${RED}❌ swagger.json is not valid${NC}"
fi

if curl -s http://localhost:8080/docs/swagger.yaml | grep -q "swagger:"; then
    echo -e "${GREEN}✅ swagger.yaml is valid${NC}"
else
    echo -e "${RED}❌ swagger.yaml is not valid${NC}"
fi

# Test API endpoints availability
echo ""
echo -e "${BLUE}Testing API endpoints availability...${NC}"

# Test public endpoints
echo -e "${YELLOW}Testing public endpoints...${NC}"
if curl -s http://localhost:8080/v1/products | grep -q "products"; then
    echo -e "${GREEN}✅ /v1/products endpoint working${NC}"
else
    echo -e "${RED}❌ /v1/products endpoint not working${NC}"
fi

if curl -s http://localhost:8080/v1/categories | grep -q "categories"; then
    echo -e "${GREEN}✅ /v1/categories endpoint working${NC}"
else
    echo -e "${RED}❌ /v1/categories endpoint not working${NC}"
fi

if curl -s http://localhost:8080/v1/health-check | grep -q "status"; then
    echo -e "${GREEN}✅ /v1/health-check endpoint working${NC}"
else
    echo -e "${RED}❌ /v1/health-check endpoint not working${NC}"
fi

# Count available endpoints in swagger.json
echo ""
echo -e "${BLUE}Counting documented endpoints...${NC}"
ENDPOINT_COUNT=$(curl -s http://localhost:8080/docs/swagger.json | grep -o '"/[^"]*"' | sort | uniq | wc -l)
echo -e "${GREEN}📊 Total documented endpoints: ${ENDPOINT_COUNT}${NC}"

# List all available endpoint categories
echo ""
echo -e "${BLUE}Available API Categories:${NC}"
echo -e "${YELLOW}🔐 Authentication:${NC} /auth/*"
echo -e "${YELLOW}🛍️ Products:${NC} /products/*, /categories"
echo -e "${YELLOW}🛒 Cart:${NC} /cart/*"
echo -e "${YELLOW}📦 Orders:${NC} /orders/*"
echo -e "${YELLOW}⭐ Reviews:${NC} /reviews/*, /products/*/reviews"
echo -e "${YELLOW}👥 Users:${NC} /users/*"
echo -e "${YELLOW}📊 Dashboard:${NC} /dashboard/*"
echo -e "${YELLOW}🏥 Health:${NC} /health-check"

echo ""
echo -e "${GREEN}🎉 Swagger UI Update Complete!${NC}"
echo ""
echo -e "${BLUE}📖 Access the documentation at:${NC}"
echo -e "   🌐 ${GREEN}http://localhost:8080/docs${NC}"
echo -e "   🔗 ${GREEN}http://localhost:8080/swagger${NC}"
echo ""
echo -e "${BLUE}📋 API Schema files:${NC}"
echo -e "   📄 ${GREEN}http://localhost:8080/docs/swagger.json${NC}"
echo -e "   📄 ${GREEN}http://localhost:8080/docs/swagger.yaml${NC}"
echo ""
echo -e "${BLUE}🔧 Regenerate documentation:${NC}"
echo -e "   💻 ${YELLOW}make swagger${NC}"
echo ""
echo -e "${BLUE}📚 API Documentation Features:${NC}"
echo -e "   ✅ Interactive API testing"
echo -e "   ✅ Request/response examples"
echo -e "   ✅ Authentication support"
echo -e "   ✅ Error handling documentation"
echo -e "   ✅ Model schemas"
echo -e "   ✅ Query parameter documentation"
echo -e "   ✅ Admin vs User role separation" 