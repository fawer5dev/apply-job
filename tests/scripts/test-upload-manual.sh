#!/bin/bash

# Script to manually test CV upload
# Run: ./scripts/test-upload-manual.sh

echo "🚀 Testing CV upload manually..."
echo ""

# Verify that the file exists
if [ ! -f "files/FawerV-CV.pdf" ]; then
    echo "❌ Error: The file files/FawerV-CV.pdf does not exist"
    exit 1
fi

echo "📄 File found: files/FawerV-CV.pdf"
echo ""

# Verify that the server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Error: The Next.js server is not running on localhost:3000"
    echo "   Please run: pnpm dev"
    exit 1
fi

echo "✅ Server detected at http://localhost:3000"
echo ""

echo "📤 Uploading CV..."
echo ""

# Make the request
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/cv/upload \
  -F "file=@files/FawerV-CV.pdf" \
  -F "title=My Professional CV" \
  -F "userId=temp-user")

# Separate body and status code
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "📊 Server response:"
echo ""

if [ "$http_code" = "200" ]; then
    echo "✅ Status: $http_code OK"
    echo ""
    echo "📋 Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    echo "🎉 CV uploaded successfully!"
else
    echo "❌ Status: $http_code ERROR"
    echo ""
    echo "📋 Error response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    echo "💡 Tip: Make sure the user 'temp-user' exists in the database"
    echo "   Run: pnpm tsx scripts/create-test-user.ts"
fi

echo ""
