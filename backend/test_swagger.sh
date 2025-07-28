#!/bin/bash

# Test Swagger Documentation
echo "Testing Swagger Documentation..."

# Check if server is running
if ! curl -s http://localhost:8080/docs > /dev/null; then
    echo "❌ Server is not running on port 8080"
    echo "Please start the server with: make start"
    exit 1
fi

echo "✅ Server is running on port 8080"

# Test Swagger UI endpoints
echo "Testing Swagger UI endpoints..."

# Test /docs redirect
if curl -s -I http://localhost:8080/docs | grep -q "302 Found"; then
    echo "✅ /docs redirect working"
else
    echo "❌ /docs redirect not working"
fi

# Test /docs/index.html
if curl -s -I http://localhost:8080/docs/index.html | grep -q "200 OK"; then
    echo "✅ /docs/index.html accessible"
else
    echo "❌ /docs/index.html not accessible"
fi

# Test /swagger redirect
if curl -s -I http://localhost:8080/swagger | grep -q "302 Found"; then
    echo "✅ /swagger redirect working"
else
    echo "❌ /swagger redirect not working"
fi

# Test swagger.json
if curl -s http://localhost:8080/docs/swagger.json | jq -e '.info.title' > /dev/null 2>&1; then
    echo "✅ swagger.json is valid JSON"
else
    echo "❌ swagger.json is not valid JSON"
fi

# Test swagger.yaml
if curl -s http://localhost:8080/docs/swagger.yaml | grep -q "swagger:"; then
    echo "✅ swagger.yaml is valid YAML"
else
    echo "❌ swagger.yaml is not valid YAML"
fi

echo ""
echo "🎉 Swagger documentation is working correctly!"
echo ""
echo "📖 Access the documentation at:"
echo "   - http://localhost:8080/docs"
echo "   - http://localhost:8080/swagger"
echo ""
echo "📋 API Schema files:"
echo "   - http://localhost:8080/docs/swagger.json"
echo "   - http://localhost:8080/docs/swagger.yaml" 