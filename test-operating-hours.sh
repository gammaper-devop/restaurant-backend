#!/bin/bash

# Test script for Operating Hours functionality
BASE_URL="http://localhost:3000/api/restaurants"

echo "🧪 Testing Operating Hours Functionality"
echo "========================================"

# 1. Test creating a location with operating hours
echo -e "\n1. Testing location creation with custom operating hours..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/locations" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Test Address 123",
    "phone": "+1234567890",
    "latitude": -12.0464,
    "longitude": -77.0428,
    "district": 1,
    "restaurant": 1,
    "operatingHours": {
      "monday": {"open": "08:00", "close": "23:00", "closed": false},
      "tuesday": {"open": "08:00", "close": "23:00", "closed": false},
      "wednesday": {"open": "08:00", "close": "23:00", "closed": false},
      "thursday": {"open": "08:00", "close": "23:00", "closed": false},
      "friday": {"open": "08:00", "close": "24:00", "closed": false},
      "saturday": {"open": "10:00", "close": "24:00", "closed": false},
      "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }
  }')

echo "Create Response: $CREATE_RESPONSE"

# Extract location ID from response (assuming JSON format with id field)
LOCATION_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Created location ID: $LOCATION_ID"

if [ ! -z "$LOCATION_ID" ]; then
  # 2. Test getting location with operating hours
  echo -e "\n2. Testing get location by ID..."
  curl -s "$BASE_URL/locations/$LOCATION_ID" | jq .

  # 3. Test checking if currently open
  echo -e "\n3. Testing current opening status..."
  curl -s "$BASE_URL/locations/$LOCATION_ID/is-open" | jq .

  # 4. Test checking if open at specific time (next Monday at 10 AM)
  NEXT_MONDAY=$(date -d "next monday 10:00" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -v+1d -v+mon -v10H -v0M -v0S -u +"%Y-%m-%dT%H:%M:%SZ")
  echo -e "\n4. Testing opening status at specific time ($NEXT_MONDAY)..."
  curl -s "$BASE_URL/locations/$LOCATION_ID/is-open-at/$NEXT_MONDAY" | jq .

  # 5. Test updating operating hours
  echo -e "\n5. Testing operating hours update..."
  curl -s -X PATCH "$BASE_URL/locations/$LOCATION_ID/operating-hours" \
    -H "Content-Type: application/json" \
    -d '{
      "operatingHours": {
        "monday": {"open": "07:00", "close": "22:00", "closed": false},
        "tuesday": {"open": "07:00", "close": "22:00", "closed": false},
        "wednesday": {"open": "07:00", "close": "22:00", "closed": false},
        "thursday": {"open": "07:00", "close": "22:00", "closed": false},
        "friday": {"open": "07:00", "close": "23:00", "closed": false},
        "saturday": {"open": "08:00", "close": "23:00", "closed": false},
        "sunday": {"open": "08:00", "close": "21:00", "closed": false}
      }
    }' | jq .

  # 6. Test getting all currently open locations
  echo -e "\n6. Testing get all currently open locations..."
  curl -s "$BASE_URL/locations/currently-open" | jq .

  echo -e "\n✅ All tests completed!"
else
  echo "❌ Failed to create location. Cannot proceed with other tests."
fi