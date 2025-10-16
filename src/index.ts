import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { Restaurant } from './domain/entities/Restaurant';
import { RestaurantLocation } from './domain/entities/RestaurantLocation';
import { Category } from './domain/entities/Category';
import { Country } from './domain/entities/Country';
import { City } from './domain/entities/City';
import { Province } from './domain/entities/Province';
import { District } from './domain/entities/District';
import { Dish } from './domain/entities/Dish';
import { Menu } from './domain/entities/Menu';
import { User } from './domain/entities/User';
import { ErrorLog } from './domain/entities/ErrorLog';
import { swaggerUi, specs } from './config/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://localhost:5173', // Vite default
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token',
  ],
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Database connection
createConnection({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'restaurant_db',
  entities: [Restaurant, RestaurantLocation, Category, Country, City, Province, District, Dish, Menu, User, ErrorLog],
  synchronize: true, // In production, use migrations
}).then(() => {
  console.log('Database connected');

  // Import routes and middleware after database connection is established
  const restaurantRoutes = require('./presentation/routes/restaurantRoutes').default;
  const categoryRoutes = require('./presentation/routes/categoryRoutes').default;
  const locationRoutes = require('./presentation/routes/locationRoutes').default;
  const dishRoutes = require('./presentation/routes/dishRoutes').default;
  const menuRoutes = require('./presentation/routes/menuRoutes').default;
  const userRoutes = require('./presentation/routes/userRoutes').default;
  const errorLogRoutes = require('./presentation/routes/errorLogRoutes').default;
  const { errorHandler } = require('./presentation/middlewares/errorHandler');

  // Routes
  app.use('/api/restaurants', restaurantRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/locations', locationRoutes);
  app.use('/api/dishes', dishRoutes);
  app.use('/api/menus', menuRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/error-logs', errorLogRoutes);

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Error handling middleware (must be last)
  app.use(errorHandler);

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => console.log(error));
