import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import postsRoutes from './routes/posts.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import productsRoutes from './routes/products.routes.js';
import ordersRoutes from './routes/orders.routes.js';

import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rate.middleware.js';
import { debounceRequests } from './middleware/debounce.middleware.js';
import { logger } from './utils/logger.js';
import { protect, authorizeRole } from './middleware/auth.middleware.js';

// -----------------------------------------------------------------------------
// 🌱 Environment Setup
// -----------------------------------------------------------------------------
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------------------------------
// 🌐 Basic Middleware
// -----------------------------------------------------------------------------
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// -----------------------------------------------------------------------------
// ⏱️ Global Rate Limiter
// -----------------------------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  handler: (req, res) => {
    logger.warn({
      message: 'Rate limit exceeded',
      ip: req.ip,
      path: req.path,
      ua: req.headers['user-agent'],
    });
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
  },
});
app.use(globalLimiter);

// -----------------------------------------------------------------------------
// 🪵 Request Logging
// -----------------------------------------------------------------------------
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// -----------------------------------------------------------------------------
// 📘 Swagger Documentation (FIXED)
// -----------------------------------------------------------------------------
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Complete Node Express API',
      version: '1.0.0',
      description:
        'Production-ready Node.js + Express API with JWT authentication, role-based access, throttling, debouncing, and Sequelize integration.',
    },
    servers: [
      {
        url: process.env.BASE_URL || 'https://node-starter-1.onrender.com/',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', example: 'user' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 10 },
            title: { type: 'string', example: 'My First Post' },
            body: { type: 'string', example: 'This is the post content.' },
            userId: { type: 'integer', example: 1 },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 5 },
            text: { type: 'string', example: 'Nice article!' },
            postId: { type: 'integer', example: 10 },
            userId: { type: 'integer', example: 1 },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Widget' },
            price: { type: 'number', example: 19.99 },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            total: { type: 'number', example: 99.99 },
            userId: { type: 'integer', example: 1 },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // ✅ FIXED: Use absolute ESM-safe path for routes
  apis: [path.resolve(__dirname, './routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

console.log('✅ Swagger loaded routes count:', Object.keys(swaggerSpec.paths || {}).length);

// -----------------------------------------------------------------------------
// 🚦 Routes with Protection, Throttling & Debouncing
// -----------------------------------------------------------------------------
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/users', protect, authorizeRole('admin'), usersRoutes);
app.use('/api/posts', protect, debounceRequests(3000), postsRoutes);
app.use('/api/comments', protect, debounceRequests(3000), commentsRoutes);
app.use('/api/products', debounceRequests(2000), productsRoutes);
app.use('/api/orders', protect, authorizeRole('admin', 'user'), debounceRequests(5000), ordersRoutes);

// -----------------------------------------------------------------------------
// ❤️ Health Check
// -----------------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// -----------------------------------------------------------------------------
// 🚨 Error Handler
// -----------------------------------------------------------------------------
app.use(errorHandler);

export default app;
