# Restaurant Backend API

A Node.js backend application for restaurant management using microservices architecture, TypeScript, Express, PostgreSQL, and Clean Architecture principles.

## 🚀 Features

### Core Functionality
- **Restaurant Management** with geolocation support
- **Category, Country, City, Province & District** hierarchical management
- **Dish and Menu Management** with file upload support
- **User Management** with registration and authentication
- **Nearby Restaurant Search** based on user location with radius filtering

### Advanced Features
- **JWT Authentication** for secure API access
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

### 🗺️ Locations
- 🔓 `GET /api/locations/countries` - Get all active countries
- 🔒 `POST /api/locations/countries` - Create new country
- 🔓 `GET /api/locations/cities` - Get all active cities
- 🔒 `POST /api/locations/cities` - Create new city

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
│   └── entities/              # Database entities (with BaseEntity)
│       ├── BaseEntity.ts      # Base class with common fields
│       ├── Restaurant.ts      # Restaurant entity
│       ├── Category.ts        # Category entity
│       ├── User.ts           # User entity
│       └── ...
├── application/
│   └── services/             # Business logic services
│       └── ErrorLoggingService.ts
├── presentation/
│   ├── controllers/          # HTTP controllers
│   │   ├── RestaurantController.ts
│   │   ├── CategoryController.ts
│   │   ├── UserController.ts
│   │   └── ...
│   ├── routes/              # API routes with JWT protection
│   │   ├── restaurantRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── ...
│   └── middlewares/         # Express middlewares
│       ├── auth.ts          # JWT authentication
│       ├── errorHandler.ts  # Error handling
│       └── upload.ts        # File upload
├── shared/
│   ├── utils/               # Shared utilities
│   │   └── EntityUtils.ts   # Soft delete utilities
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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
