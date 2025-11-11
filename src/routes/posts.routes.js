import express from 'express';
import { listFactory, getFactory, createFactory } from '../controllers/generic.controller.js';
import { Post } from '../models/post.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rate.middleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Posts
 *   description: Manage blog posts
 */

/**
 * @openapi
 * /api/posts:
 *   get:
 *     summary: Retrieve all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/', apiLimiter, listFactory(Post));

/**
 * @openapi
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.get('/:id', apiLimiter, getFactory(Post));

/**
 * @openapi
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title:
 *                 type: string
 *                 example: My First Post
 *               body:
 *                 type: string
 *                 example: This is my first blog post content.
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, apiLimiter, createFactory(Post));

export default router;
