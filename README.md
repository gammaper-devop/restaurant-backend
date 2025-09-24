# Restaurant Backend API

A Node.js backend application for restaurant management using microservices architecture, TypeScript, Express, PostgreSQL, and Clean Architecture principles.

## 🚀 Features

### Core Functionality
- **Restaurant Management** with geolocation support
- **Restaurant Location Management** with operating hours and real-time status
- **Operating Hours System** with smart scheduling and validation
- **Category, Country, City, Province & District** hierarchical management
- **Dish and Menu Management** with file upload support
- **User Management** with registration and authentication
- **Nearby Restaurant Search** based on user location with radius filtering

### Advanced Features
- **JWT Authentication** for secure API access
- **Real-time Opening Status** - Automatically calculates if restaurants are open
- **Smart Operating Hours** - Support for midnight crossover and custom schedules
- **Operating Hours Validation** - Prevents invalid time configurations
- **Soft Delete System** - Data is never permanently lost
- **Audit Trail** - Automatic created_at and updated_at timestamps
- **Clean Architecture** with proper separation of concerns
- **RESTful API** with comprehensive Swagger documentation
- **Error Handling** with centralized logging
- **CORS Support** for cross-origin requests

## Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your database credentials and other settings

4. Set up PostgreSQL database:
   - Create a database named `restaurant_db` (or update DB_NAME in .env)
   - Update DB_HOST, DB_USERNAME, DB_PASSWORD accordingly

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=restaurant_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=3000

# File Upload Configuration
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880
```

### Running the Application

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

For development with auto-reload:
```bash
npm run dev
```

The server will start on port 3000 (or the port specified in .env).

## 🚀 API Endpoints

> **Authentication:** 🔒 Requires JWT Token | 🔓 Public Access

### 🏢 Restaurants
- 🔓 `GET /api/restaurants` - Get all active restaurants
- 🔓 `GET /api/restaurants/:id` - Get restaurant by ID
- 🔓 `GET /api/restaurants/nearby?lat=...&lng=...&radius=...` - Find nearby restaurants
- 🔒 `POST /api/restaurants` - Create new restaurant
- 🔒 `PUT /api/restaurants/:id` - Update restaurant
- 🔒 `DELETE /api/restaurants/:id` - Soft delete restaurant

### 🏷️ Categories
- 🔓 `GET /api/categories` - Get all active categories
- 🔓 `GET /api/categories/:id` - Get category by ID
- 🔒 `POST /api/categories` - Create new category
- 🔒 `PUT /api/categories/:id` - Update category
- 🔒 `DELETE /api/categories/:id` - Soft delete category

### 👥 Users
- 🔓 `POST /api/users/register` - Register new user
- 🔓 `POST /api/users/login` - Login user
- 🔒 `GET /api/users` - Get all active users
- 🔒 `GET /api/users/profile` - Get current user profile
- 🔒 `PUT /api/users/profile` - Update user profile
- 🔒 `PUT /api/users/change-password` - Change password
- 🔒 `DELETE /api/users/:id` - Soft delete user

### 📍 Restaurant Locations & Operating Hours
- 🔓 `GET /api/restaurants/locations` - Get all restaurant locations with current status
- 🔓 `GET /api/restaurants/locations/:id` - Get specific location with opening status
- 🔓 `GET /api/restaurants/:restaurantId/locations` - Get all locations for a restaurant
- 🔓 `GET /api/restaurants/locations/currently-open` - Get all currently open locations
- 🔓 `GET /api/restaurants/locations/:id/is-open` - Check if location is open now
- 🔓 `GET /api/restaurants/locations/:id/is-open-at/:datetime` - Check if open at specific time
- 🔒 `POST /api/restaurants/locations` - Create new restaurant location
- 🔒 `PUT /api/restaurants/locations/:id` - Update restaurant location
- 🔒 `PATCH /api/restaurants/locations/:id/operating-hours` - Update only operating hours
- 🔒 `DELETE /api/restaurants/locations/:id` - Soft delete restaurant location

### 🗺️ Geographic Locations
- 🔓 `GET /api/locations/countries` - Get all active countries
- 🔒 `POST /api/locations/countries` - Create new country
- 🔓 `GET /api/locations/cities` - Get all active cities
- 🔒 `POST /api/locations/cities` - Create new city
- 🔓 `GET /api/locations/provinces` - Get all active provinces
- 🔓 `GET /api/locations/provinces/city/:cityId` - Get provinces by city
- 🔓 `GET /api/locations/districts` - Get all active districts
- 🔓 `GET /api/locations/districts/province/:provinceId` - Get districts by province

### 🍽️ Dishes
- 🔓 `GET /api/dishes` - Get all active dishes
- 🔒 `POST /api/dishes` - Create new dish
- 🔒 `PUT /api/dishes/:id` - Update dish
- 🔒 `DELETE /api/dishes/:id` - Soft delete dish

### 📋 Menus
- 🔓 `GET /api/menus` - Get all active menus
- 🔒 `POST /api/menus` - Create new menu
- 🔒 `PUT /api/menus/:id` - Update menu
- 🔒 `DELETE /api/menus/:id` - Soft delete menu

## 📁 Project Structure

```
src/
├── domain/
│   ├── entities/              # Database entities (with BaseEntity)
│   │   ├── BaseEntity.ts      # Base class with common fields
│   │   ├── Restaurant.ts      # Restaurant entity
│   │   ├── RestaurantLocation.ts # Restaurant location with operating hours
│   │   ├── Category.ts        # Category entity
│   │   ├── User.ts           # User entity
│   │   └── ...
│   └── types/                # Domain type definitions
│       └── OperatingHours.ts  # Operating hours interfaces
├── application/
│   └── services/             # Business logic services
│       └── ErrorLoggingService.ts
├── presentation/
│   ├── controllers/          # HTTP controllers
│   │   ├── RestaurantController.ts
│   │   ├── RestaurantLocationController.ts # Location & hours management
│   │   ├── CategoryController.ts
│   │   ├── UserController.ts
│   │   └── ...
│   ├── routes/              # API routes with JWT protection
│   │   ├── restaurantRoutes.ts # Includes location routes
│   │   ├── categoryRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── ...
│   └── middlewares/         # Express middlewares
│       ├── auth.ts          # JWT authentication
│       ├── errorHandler.ts  # Error handling
│       └── upload.ts        # File upload
├── shared/
│   ├── utils/               # Shared utilities
│   │   ├── EntityUtils.ts   # Soft delete utilities
│   │   └── OperatingHoursUtils.ts # Operating hours logic
│   ├── errors/              # Custom error classes
│   └── responses/           # API response handlers
└── config/
    └── swagger.ts           # API documentation
```

## 🛠️ Technologies Used

### Core Technologies
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **TypeORM** - Object-Relational Mapping with decorators

### Security & Authentication
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### File Handling & Documentation
- **Multer** - File upload middleware
- **Swagger** - API documentation and testing

### Architecture & Patterns
- **Clean Architecture** - Separation of concerns
- **Repository Pattern** - Data access abstraction
- **Soft Delete Pattern** - Data preservation
- **BaseEntity Pattern** - DRY principle implementation

## ⏰ Operating Hours System

### Overview
The operating hours system provides comprehensive management of restaurant location schedules with real-time status checking and intelligent validation.

### Features
- **Smart Scheduling**: Support for different hours each day of the week
- **Midnight Crossover**: Handle schedules like "22:00 - 02:00" that cross midnight
- **Closed Days**: Full support for locations closed on specific days
- **Real-time Status**: Automatic calculation of current opening status
- **Validation**: Prevents invalid time formats and logical errors
- **Next Opening**: Calculate the next time a location will be open

### Data Structure

```typescript
interface DaySchedule {
  open: string;    // "HH:MM" format (24-hour)
  close: string;   // "HH:MM" format (24-hour)
  closed: boolean; // true if closed all day
}

interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}
```

### Usage Examples

#### Create Location with Custom Hours
```bash
curl -X POST http://localhost:3000/api/restaurants/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "address": "123 Main St",
    "latitude": -12.0464,
    "longitude": -77.0428,
    "district": 1,
    "restaurant": 1,
    "operatingHours": {
      "monday": {"open": "08:00", "close": "22:00", "closed": false},
      "tuesday": {"open": "08:00", "close": "22:00", "closed": false},
      "wednesday": {"open": "08:00", "close": "22:00", "closed": false},
      "thursday": {"open": "08:00", "close": "22:00", "closed": false},
      "friday": {"open": "08:00", "close": "23:00", "closed": false},
      "saturday": {"open": "10:00", "close": "23:00", "closed": false},
      "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }
  }'
```

#### Check Current Opening Status
```bash
# Check if location is open right now
curl http://localhost:3000/api/restaurants/locations/1/is-open

# Response:
{
  "success": true,
  "data": {
    "locationId": 1,
    "isCurrentlyOpen": true,
    "currentTime": "2024-01-15T14:30:00.000Z",
    "nextOpeningTime": null
  }
}
```

#### Update Only Operating Hours
```bash
curl -X PATCH http://localhost:3000/api/restaurants/locations/1/operating-hours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "operatingHours": {
      "monday": {"open": "07:00", "close": "23:00", "closed": false}
      // ... other days
    }
  }'
```

#### Get All Currently Open Locations
```bash
curl http://localhost:3000/api/restaurants/locations/currently-open

# Returns array of locations that are open right now
```

#### Check Opening at Specific Time
```bash
# Check if open on Christmas Day at 3 PM
curl "http://localhost:3000/api/restaurants/locations/1/is-open-at/2024-12-25T15:00:00Z"
```

### Advanced Features

#### Midnight Crossover Support
```json
{
  "friday": {
    "open": "18:00",
    "close": "02:00",  // Closes at 2 AM Saturday
    "closed": false
  }
}
```

#### Default Operating Hours
New locations automatically get default hours (9 AM - 10 PM, Monday-Sunday) if not specified.

#### Validation Rules
- Time format must be "HH:MM" in 24-hour format
- All days must be specified
- If `closed: true`, open/close times are ignored
- Opening and closing times cannot be identical (unless closed)

### Testing

Run the operating hours test suite:
```bash
# Make test script executable
chmod +x test-operating-hours.sh

# Run tests
./test-operating-hours.sh
```

## 🔐 Authentication

### JWT Token Usage

For protected endpoints, include the JWT token in the Authorization header:

```bash
# Login to get token
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token for protected endpoints
curl -X POST http://localhost:3000/api/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"My Restaurant","categoryId":1}'
```

### Token Expiration
- Tokens expire after **24 hours**
- Include token in header: `Authorization: Bearer <token>`
- Public endpoints don't require authentication

## 🗑️ Soft Delete System

### How it Works
All entities use **soft delete** - records are never physically deleted from the database:

```sql
-- Instead of: DELETE FROM restaurants WHERE id = 1
-- We do: UPDATE restaurants SET active = false WHERE id = 1
```

### Benefits
- **Data Recovery**: Deleted records can be restored
- **Audit Trail**: Complete history is preserved
- **Referential Integrity**: No broken foreign key relationships
- **Analytics**: Historical data remains available

### Entity Structure
Every entity includes these standard fields:

```typescript
export class Restaurant extends BaseEntity {
  // Custom fields
  name: string;
  logo?: string;
  
  // Inherited from BaseEntity
  id: number;           // Auto-generated ID
  active: boolean;      // true = active, false = soft deleted
  created_at: Date;     // Auto-set on creation
  updated_at: Date;     // Auto-updated on changes
}
```

## 🚀 Usage Examples

### Restaurant Management

```bash
# Get all active restaurants
curl http://localhost:3000/api/restaurants

# Search nearby restaurants (10km radius)
curl "http://localhost:3000/api/restaurants/nearby?lat=40.7128&lng=-74.0060&radius=10"

# Create new restaurant (requires JWT)
curl -X POST http://localhost:3000/api/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Amazing Pizza",
    "phone": "+1234567890",
    "categoryId": 1
  }'

# Soft delete restaurant (requires JWT)
curl -X DELETE http://localhost:3000/api/restaurants/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Restaurant Location Management

```bash
# Get all restaurant locations with current opening status
curl http://localhost:3000/api/restaurants/locations

# Get only currently open locations
curl http://localhost:3000/api/restaurants/locations/currently-open

# Create location with custom operating hours (requires JWT)
curl -X POST http://localhost:3000/api/restaurants/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "address": "123 Pizza Street",
    "phone": "+1234567890",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "district": 1,
    "restaurant": 1,
    "operatingHours": {
      "monday": {"open": "11:00", "close": "23:00", "closed": false},
      "tuesday": {"open": "11:00", "close": "23:00", "closed": false},
      "wednesday": {"open": "11:00", "close": "23:00", "closed": false},
      "thursday": {"open": "11:00", "close": "23:00", "closed": false},
      "friday": {"open": "11:00", "close": "24:00", "closed": false},
      "saturday": {"open": "12:00", "close": "24:00", "closed": false},
      "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }
  }'

# Check if location is currently open
curl http://localhost:3000/api/restaurants/locations/1/is-open

# Update only operating hours (requires JWT)
curl -X PATCH http://localhost:3000/api/restaurants/locations/1/operating-hours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "operatingHours": {
      "sunday": {"open": "12:00", "close": "22:00", "closed": false}
    }
  }'
```

### User Registration & Authentication

```bash
# Register new user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Category Management

```bash
# Get all categories
curl http://localhost:3000/api/categories

# Create category (requires JWT)
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Italian Cuisine"}'
```

## 📊 Database Schema

### Core Tables
All tables include the standard audit fields:

```sql
-- Example: restaurants table
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    logo VARCHAR,
    phone TEXT,
    "categoryId" INTEGER REFERENCES categories(id),
    
    -- Standard audit fields (via BaseEntity)
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Restaurant locations with operating hours
CREATE TABLE restaurant_locations (
    id SERIAL PRIMARY KEY,
    address VARCHAR NOT NULL,
    phone TEXT,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    "operatingHours" JSON NOT NULL DEFAULT '{
      "monday": {"open": "09:00", "close": "22:00", "closed": false},
      "tuesday": {"open": "09:00", "close": "22:00", "closed": false},
      "wednesday": {"open": "09:00", "close": "22:00", "closed": false},
      "thursday": {"open": "09:00", "close": "22:00", "closed": false},
      "friday": {"open": "09:00", "close": "22:00", "closed": false},
      "saturday": {"open": "10:00", "close": "22:00", "closed": false},
      "sunday": {"open": "10:00", "close": "21:00", "closed": false}
    }',
    "districtId" INTEGER REFERENCES districts(id),
    "restaurantId" INTEGER REFERENCES restaurants(id),
    
    -- Standard audit fields (via BaseEntity)
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

### Soft Delete Queries

```sql
-- Get active records only
SELECT * FROM restaurants WHERE active = true;

-- Get deleted records
SELECT * FROM restaurants WHERE active = false;

-- Restore deleted record
UPDATE restaurants SET active = true WHERE id = 1;
```

### Operating Hours Queries

```sql
-- Get location with current day's hours
SELECT 
  id, address,
  "operatingHours"->>'monday' as monday_hours,
  "operatingHours"->>'tuesday' as tuesday_hours
FROM restaurant_locations 
WHERE active = true;

-- Update operating hours for a location
UPDATE restaurant_locations 
SET "operatingHours" = '{
  "monday": {"open": "08:00", "close": "23:00", "closed": false},
  "tuesday": {"open": "08:00", "close": "23:00", "closed": false}
  // ... rest of the week
}'
WHERE id = 1;

-- Query locations by operating hours (find locations open on Monday)
SELECT * FROM restaurant_locations 
WHERE active = true 
AND ("operatingHours"->>'monday')::json->>'closed' = 'false';
```

## 📝 API Documentation

### Swagger UI
Interactive API documentation available at:
```
http://localhost:3000/api-docs
```

### Response Format
All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/restaurants",
  "method": "GET"
}
```

### Error Handling
Errors are returned with consistent structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Testing

### Available Test Scripts

1. **General API Testing**
   ```bash
   # Test various API endpoints
   ./test-api.sh
   ```

2. **Operating Hours Testing**
   ```bash
   # Test operating hours functionality
   chmod +x test-operating-hours.sh
   ./test-operating-hours.sh
   ```

### Manual Testing

Use the Swagger UI for interactive testing:
```
http://localhost:3000/api-docs
```

### Testing Operating Hours Features

```bash
# Test creating location with hours
curl -X POST http://localhost:3000/api/restaurants/locations -H "Content-Type: application/json" -d '{...}'

# Test real-time status checking
curl http://localhost:3000/api/restaurants/locations/1/is-open

# Test getting all open locations
curl http://localhost:3000/api/restaurants/locations/currently-open

# Test historical/future time checking
curl "http://localhost:3000/api/restaurants/locations/1/is-open-at/2024-12-25T15:00:00Z"
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
