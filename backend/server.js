import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import homepageRoutes from './routes/homepageRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import navigationRoutes from './routes/navigationRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import storyRoutes from './routes/storyRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect Database
connectDB();

// Global Security & Performance Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, uptime monitors)
      if (!origin) return callback(null, true);
      if (
        process.env.CLIENT_URL === '*' ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve Uploaded Media Files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// General rate limiter for API routes
app.use('/api', apiLimiter);

// API v1 Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/homepage', homepageRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/navigation', navigationRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/story', storyRoutes);

// Health check endpoints
app.get(['/', '/api/health'], (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'CALZARE Footwear Engine v1.0.0',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[CALZARE Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[CALZARE Server] REST API prefix: /api/v1`);
});

process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
  // Keep server alive in dev
});

export default app;
