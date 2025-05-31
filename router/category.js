const express = require('express');
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controller/category');
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /api/v1/create-categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create a new category
 *     description: Creates a new category if it does not already exist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Electronics
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: '2025-04-17T14:35:00.000Z'
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: '2025-04-17T14:35:00.000Z'
 *       400:
 *         description: Category already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category already exists
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An unexpected error occurred
 */


router.post('/create-categories', createCategory);
/**
 * @swagger
 * /api/v1/all-categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/all-categories', getAllCategories);
/**
 * @swagger
 * /api/v1/one-categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get('/one-categories/:id', getCategoryById);
/**
 * @swagger
 * /api/v1/update-categories/{id}:
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gadgets
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */

router.put('/update-categories/:id', updateCategory);
/**
 * @swagger
 * /api/v1/delete-categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete-categories/:id', deleteCategory);

module.exports = router;
