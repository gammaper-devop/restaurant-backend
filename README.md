# Restaurant Backend API

A Node.js backend application for restaurant management using microservices architecture, TypeScript, Express, PostgreSQL, and Clean Architecture principles.

## Features

- Restaurant management with geolocation
- Category, country, and city management
- Dish and menu management with file uploads
- JWT authentication
- Nearby restaurant search based on user location

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

## API Endpoints

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create new restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant
- `GET /api/restaurants/nearby?lat=...&lng=...&radius=...` - Find nearby restaurants

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Locations
- `GET /api/locations/countries` - Get all countries
- `POST /api/locations/countries` - Create new country
- `GET /api/locations/cities` - Get all cities
- `POST /api/locations/cities` - Create new city

### Dishes
- `GET /api/dishes` - Get all dishes
- `POST /api/dishes` - Create new dish

### Menus
- `GET /api/menus` - Get all menus
- `POST /api/menus` - Create new menu

## Project Structure

```
src/
├── domain/
│   ├── entities/          # Database entities
│   └── repositories/      # Repository interfaces
├── application/
│   └── use-cases/         # Business logic
├── infrastructure/
│   ├── database/          # Database configuration
│   └── repositories/      # Repository implementations
├── presentation/
│   ├── controllers/       # HTTP controllers
│   ├── routes/           # API routes
│   └── middlewares/      # Express middlewares
└── shared/               # Shared utilities
```

## Technologies Used

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- TypeORM
- JWT for authentication
- Multer for file uploads
- Clean Architecture pattern

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the ISC License.
