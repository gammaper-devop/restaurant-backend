import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

// Security Configuration
const isProduction = process.env.NODE_ENV === 'production';

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS Configuration - More restrictive in production
const corsOptions = {
  origin: isProduction 
    ? (process.env.ALLOWED_ORIGINS?.split(',') || [])
    : [
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

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Swagger UI
  crossOriginEmbedderPolicy: false,
}));
app.use(limiter);
app.use(cors(corsOptions));

// Middleware
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));

// Serve static files from public directory
app.use('/static', express.static(path.join(__dirname, '../public')));

// Specific route for images with better error handling and security
app.get('/images/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const allowedTypes = ['dishes', 'restaurants'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid image type' });
  }
  
  // Validate file extension
  const fileExt = path.extname(filename).toLowerCase();
  if (!allowedExtensions.includes(fileExt)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  
  // Prevent directory traversal attacks
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  const imagePath = path.join(__dirname, '../public/images', type, filename);
  
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.log(`Image not found: ${imagePath}`);
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

// Health check endpoint (for Railway/Render)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Database connection - More secure configuration
const databaseConfig = process.env.DATABASE_URL ? {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Restaurant, RestaurantLocation, Category, Country, City, Province, District, Dish, Menu, User, ErrorLog],
  synchronize: !isProduction, // Only sync in development
  logging: !isProduction,
  ssl: {
    rejectUnauthorized: false
  },
  extra: {
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '5000'),
  }
} : {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'restaurant_db',
  entities: [Restaurant, RestaurantLocation, Category, Country, City, Province, District, Dish, Menu, User, ErrorLog],
  synchronize: !isProduction,
  logging: !isProduction
};

async function start() {
  try {
    await createConnection(databaseConfig as any);
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
  } catch (error) {
    console.error(error);
  }
}

start();
