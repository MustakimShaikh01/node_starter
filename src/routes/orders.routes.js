import express from 'express';
import { listFactory, getFactory, createFactory } from '../controllers/generic.controller.js';
import { Order } from '../models/order.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rate.middleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Orders
 *   description: Manage customer orders
 */

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Retrieve all orders (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, apiLimiter, listFactory(Order));

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Retrieve order details by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get('/:id', protect, apiLimiter, getFactory(Order));

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [total]
 *             properties:
 *               total:
 *                 type: number
 *                 example: 99.99
 *     responses:
 *       201:
 *         description: Order created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, apiLimiter, createFactory(Order));

export default router;
