#!/bin/bash

# Test script for Restaurant by Category functionality
BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Restaurant by Category Endpoint"
echo "=========================================="

# 1. First, get all categories to know which ones exist
echo -e "\n1. Getting all available categories..."
CATEGORIES_RESPONSE=$(curl -s "$BASE_URL/categories")
echo "Categories Response: $CATEGORIES_RESPONSE"

# Extract first category ID (assuming JSON format with id field)
FIRST_CATEGORY_ID=$(echo "$CATEGORIES_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "First category ID found: $FIRST_CATEGORY_ID"

if [ ! -z "$FIRST_CATEGORY_ID" ]; then
  # 2. Test getting active restaurants by valid category
  echo -e "\n2. Testing active restaurants by category ID $FIRST_CATEGORY_ID..."
  curl -s "$BASE_URL/restaurants/category/$FIRST_CATEGORY_ID" | jq .

  # 3. Test getting all restaurants (including inactive) by valid category
  echo -e "\n3. Testing ALL restaurants (including inactive) by category ID $FIRST_CATEGORY_ID..."
  curl -s "$BASE_URL/restaurants/category/$FIRST_CATEGORY_ID?includeInactive=true" | jq .

  # 4. Test getting restaurants by non-existent category
  echo -e "\n4. Testing restaurants by non-existent category (ID: 99999)..."
  curl -s "$BASE_URL/restaurants/category/99999" | jq .

  # 5. Test with invalid category ID format
  echo -e "\n5. Testing with invalid category ID format..."
  curl -s "$BASE_URL/restaurants/category/invalid" | jq .

  # 6. Test with missing category ID
  echo -e "\n6. Testing with missing category ID..."
  curl -s "$BASE_URL/restaurants/category/" | jq .

  echo -e "\n✅ Category endpoint tests completed!"
else
  echo "❌ No categories found. Cannot test category endpoint."
  echo "Please ensure you have at least one category in your database."
  
  # Show available endpoints for reference
  echo -e "\n📋 Available endpoints for reference:"
  echo "GET $BASE_URL/restaurants - Get all restaurants"
  echo "GET $BASE_URL/restaurants/category/{categoryId} - Get restaurants by category"
  echo "GET $BASE_URL/categories - Get all categories"
fi

echo -e "\n🔍 For more detailed testing, you can:"
echo "1. Create a category first: POST $BASE_URL/categories"
echo "2. Create a restaurant with that category: POST $BASE_URL/restaurants"
echo "3. Then test: GET $BASE_URL/restaurants/category/{categoryId}"