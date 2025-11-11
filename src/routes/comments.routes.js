import express from 'express';
import { listFactory, getFactory, createFactory } from '../controllers/generic.controller.js';
import { Comment } from '../models/comment.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rate.middleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Comments
 *   description: Manage comments on posts
 */

/**
 * @openapi
 * /api/comments:
 *   get:
 *     summary: Retrieve all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get('/', apiLimiter, listFactory(Comment));

/**
 * @openapi
 * /api/comments/{id}:
 *   get:
 *     summary: Retrieve a single comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the comment to retrieve
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 */
router.get('/:id', apiLimiter, getFactory(Comment));

/**
 * @openapi
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text, postId]
 *             properties:
 *               text:
 *                 type: string
 *                 example: Great post!
 *               postId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, apiLimiter, createFactory(Comment));

export default router;
