import express from 'express';
import { listFactory, getFactory, createFactory } from '../controllers/generic.controller.js';
import { User } from '../models/user.model.js';
import { protect, authorizeRole } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rate.middleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Users
 *   description: Manage user data (admin only)
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden
 */
router.get('/', protect, authorizeRole('admin'), apiLimiter, listFactory(User));

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/:id', protect, authorizeRole('admin'), apiLimiter, getFactory(User));

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alice
 *               email:
 *                 type: string
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', protect, authorizeRole('admin'), apiLimiter, createFactory(User));

export default router;
