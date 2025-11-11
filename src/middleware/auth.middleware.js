// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { User } from '../models/user.model.js';
import { logger } from '../utils/logger.js';

/**
 * 🔐 Middleware: protect
 * Validates JWT and attaches the authenticated user to req.user.
 */
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // No token provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn({
        message: 'Unauthorized: missing token',
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({ error: 'Not authorized, token missing' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      logger.warn({
        message: 'Unauthorized: invalid or expired token',
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Find user
    const user = await User.findByPk(payload.id);
    if (!user) {
      logger.warn({
        message: 'Unauthorized: user not found',
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach to request
    req.user = user;
    next();
  } catch (err) {
    logger.error({
      message: 'Unexpected error in protect middleware',
      stack: err.stack,
      ip: req.ip,
      path: req.path,
    });
    res.status(500).json({ error: 'Internal authentication error' });
  }
}

/**
 * 🧍 Middleware: authorizeRole(...roles)
 * Restricts access to users with allowed roles.
 * Usage: app.get('/admin', protect, authorizeRole('admin'), controller);
 */
export function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn({
        message: 'Forbidden: insufficient permissions',
        user: req.user.email,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }

    next();
  };
}