const adminRouter = require('express').Router();
const {loginAdmin, createAdmin, verifyAdmin, verifySeller}= require('../controller/adminController');
const { authenticateAdmin } = require('../middlewares/adminAuth');
const { registerValidation} = require('../middlewares/validator');

/**
 * @swagger
 * paths:
 *   /api/v1/createAdmin:
 *     post:
 *       summary: Create a new admin
 *       description: Registers a new admin and sends a verification email with a token link.
 *       tags:
 *         - Admin 
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - password
 *                 - confirmPassword
 *               properties:
 *                 email:
 *                   type: string
 *                   example: "admin@example.com"
 *                 password:
 *                   type: string
 *                   example: "StrongPassword123"
 *                 confirmPassword:
 *                   type: string
 *                   example: "StrongPassword123"
 *       responses:
 *         "201":
 *           description: Admin account created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Admin account created successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "123"
 *                       email:
 *                         type: string
 *                         example: "admin@example.com"
 *         "400":
 *           description: Bad Request - Email already exists or password mismatch
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Admin with this email already exists"
 *         "500":
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Internal Server Error: [error message]"
 */

adminRouter.post('/createAdmin', registerValidation, createAdmin);

/**
 * @swagger
 * /api/v1/verify-seller/{sellerId}:
 *   patch:
 *     summary: Verify a seller account
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the seller to verify
 *     responses:
 *       200:
 *         description: Seller verified successfully
 *       404:
 *         description: Seller not found
 *       500:
 *         description: "Internal server error:<error-message>"
 */
adminRouter.patch('/verify-seller/:sellerId', authenticateAdmin, verifySeller);

/**
 * @swagger
 * /api/v1/verify-admin/{token}:
 *   get:
 *     summary: Verify admin email via token
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token sent via email
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Already verified or link expired
 *       404:
 *         description: Admin not found
 *       500:
 *         description: "Internal server error: <error-message>"
 */
adminRouter.get('/verify-admin/:token', verifyAdmin);

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: "Internal server error:<error-message>"
 */
adminRouter.post('/login', loginAdmin);

// adminRouter.post()

module.exports = adminRouter ;
