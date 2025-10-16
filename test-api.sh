#!/bin/bash

# Restaurant Backend API Testing Script
BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Restaurant Backend APIs"
echo "=================================="

# Test 1: Create a Category
echo "1. Creating a Category..."
CATEGORY_RESPONSE=$(curl -s -X POST $BASE_URL/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Italian"}')
echo "Response: $CATEGORY_RESPONSE"
CATEGORY_ID=$(echo $CATEGORY_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "Category ID: $CATEGORY_ID"

# Test 2: Create a Country
echo -e "\n2. Creating a Country..."
COUNTRY_RESPONSE=$(curl -s -X POST $BASE_URL/locations/countries \
  -H "Content-Type: application/json" \
  -d '{"name": "Peru"}')
echo "Response: $COUNTRY_RESPONSE"
COUNTRY_ID=$(echo $COUNTRY_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "Country ID: $COUNTRY_ID"

# Test 3: Create a City
echo -e "\n3. Creating a City..."
CITY_RESPONSE=$(curl -s -X POST $BASE_URL/locations/cities \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Lima\", \"country\": {\"id\": $COUNTRY_ID}}")
echo "Response: $CITY_RESPONSE"
CITY_ID=$(echo $CITY_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "City ID: $CITY_ID"

# Test 4: Create a Restaurant
echo -e "\n4. Creating a Restaurant..."
RESTAURANT_RESPONSE=$(curl -s -X POST $BASE_URL/restaurants \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Mario's Pizza\",
    \"address\": \"Av. Larco 123, Miraflores\",
    \"phone\": \"+51 987 654 321\",
    \"latitude\": -12.0464,
    \"longitude\": -77.0428,
    \"category\": {\"id\": $CATEGORY_ID},
    \"city\": {\"id\": $CITY_ID}
  }")
echo "Response: $RESTAURANT_RESPONSE"
RESTAURANT_ID=$(echo $RESTAURANT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "Restaurant ID: $RESTAURANT_ID"

# Test 5: Get All Restaurants
echo -e "\n5. Getting All Restaurants..."
curl -s $BASE_URL/restaurants | jq '.' 2>/dev/null || curl -s $BASE_URL/restaurants

# Test 6: Get Restaurant by ID
echo -e "\n6. Getting Restaurant by ID..."
curl -s $BASE_URL/restaurants/$RESTAURANT_ID | jq '.' 2>/dev/null || curl -s $BASE_URL/restaurants/$RESTAURANT_ID

# Test 7: Create a Dish
echo -e "\n7. Creating a Dish..."
DISH_RESPONSE=$(curl -s -X POST $BASE_URL/dishes \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Margherita Pizza\",
    \"price\": 25.50,
    \"restaurant\": {\"id\": $RESTAURANT_ID}
  }")
echo "Response: $DISH_RESPONSE"

# Test 8: Get All Dishes
echo -e "\n8. Getting All Dishes..."
curl -s $BASE_URL/dishes | jq '.' 2>/dev/null || curl -s $BASE_URL/dishes

# Test 9: Test Nearby Restaurants (using Lima coordinates)
echo -e "\n9. Testing Nearby Restaurants..."
curl -s "$BASE_URL/restaurants/nearby?lat=-12.0464&lng=-77.0428&radius=10" | jq '.' 2>/dev/null || curl -s "$BASE_URL/restaurants/nearby?lat=-12.0464&lng=-77.0428&radius=10"

# Test 10: Get All Categories
echo -e "\n10. Getting All Categories..."
curl -s $BASE_URL/categories | jq '.' 2>/dev/null || curl -s $BASE_URL/categories

# Test 11: Get All Countries
echo -e "\n11. Getting All Countries..."
curl -s $BASE_URL/locations/countries | jq '.' 2>/dev/null || curl -s $BASE_URL/locations/countries

# Test 12: Get All Cities
echo -e "\n12. Getting All Cities..."
curl -s $BASE_URL/locations/cities | jq '.' 2>/dev/null || curl -s $BASE_URL/locations/cities

# Test 13: Register a User
echo -e "\n13. Registering a User..."
USER_RESPONSE=$(curl -s -X POST $BASE_URL/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "+51 987 654 321"
  }')
echo "Response: $USER_RESPONSE"

# Test 14: Login User
echo -e "\n14. Logging in User..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
echo "Response: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

# Test 15: Get All Users (Protected)
echo -e "\n15. Getting All Users (Authenticated)..."
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/users | jq '.' 2>/dev/null || curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/users

echo -e "\n✅ API Testing Complete!"
echo "📝 Note: Some responses may not be formatted if jq is not installed"
echo "🔧 To install jq for better JSON formatting: brew install jq (macOS)"
