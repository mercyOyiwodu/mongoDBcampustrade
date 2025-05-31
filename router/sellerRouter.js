const { verify, forgotPassword, resetPassword, login, register, deleteSeller, logOut, changePassword, getDashboardStats, getApprovedPosts, getPendingPosts, getRecentPosts, getWeeklyCategoryUploadStats, getAll, getSellerById} = require('../controller/sellerController');
const { registerValidation, forgetPasswords, resetPasswords } = require('../middlewares/validator');
const sellerRouter = require('express').Router();
const {authenticateAdmin} =require('../middlewares/adminAuth')
const {authenticate} =require('../middlewares/authentication')


/**
 * @swagger
 * /api/v1/seller/register:
 *   post:
 *     summary: Register a new seller
 *     description: Registers a new seller account and sends a verification email to the provided address.*
 *     tags:
 *       - Seller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 example: "strongPassword123"
 *               confirmPassword:
 *                 type: string
 *                 example: "strongPassword123"
 *     responses:
 *       "201":
 *         description: Account created and verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account created! Please check your email to verify it."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isloggedIn:
 *                       type: boolean
 *       "400":
 *         description: Bad request - validation or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An account with johndoe@example.com already exists"
 *       "500":
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again later."
 */
sellerRouter.post('/register', register);

/**
 * @swagger
 * /api/v1/seller/verify-user/{token}:
 *   get:
 *     summary: Verify seller's email
 *     description: Verifies the seller's account using a token sent to their email. If the token is invalid, a new verification email is sent.*
 *     tags:
 *       - Seller
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         description: JWT token sent in the verification email*
 *         schema:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       "200":
 *         description: Email verified successfully or new verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email verified successfully"
 *       "400":
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       "404":
 *         description: Token or seller not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seller not found"
 *       "500":
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again later."
 */
sellerRouter.get('/verify-user/:token', verify);

/**
 * @swagger
 * /api/v1/seller/forget:
 *   post:
 *     tags:
 *       - Seller
 *     summary: Send password reset link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent
 *         content:
 *           application/json:
 *             example:
 *               message: "Password reset link sent"
 *       404:
 *         description: Seller not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Seller with this email does not exist"
 */
sellerRouter.post('/forget', forgetPasswords, forgotPassword);

/**
 * @swagger
 * /api/v1/seller/reset/{token}:
 *   post:
 *     summary: Reset seller's password using a token
 *     tags:
 *       - Seller 
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token sent to seller's email for password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 example: NewStrongPassword123!
 *               confirmPassword:
 *                 type: string
 *                 example: NewStrongPassword123!
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             example:
 *               message: Password reset successful
 *       400:
 *         description: Password mismatch or expired token
 *         content:
 *           application/json:
 *             examples:
 *               mismatch:
 *                 value:
 *                   message: Passwords do not match
 *               expired:
 *                 value:
 *                   message: Link expired, Please initiate a link
 *       404:
 *         description: Seller not found
 *         content:
 *           application/json:
 *             example:
 *               message: User not found
 *       500:
 *         description: Internal server error
 */

sellerRouter.post('/reset/:token', resetPasswords, resetPassword);

/**
 * @swagger
 * /api/v1/seller/login:
 *   post:
 *     summary: Login a seller
 *     description: Authenticates a seller and returns a token if the credentials are correct. If the account is not verified, it sends a verification email.
 *     tags:
 *       - Seller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email *
 *               - password *
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seller not found"
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 */
sellerRouter.post('/login', login)

/**
 * @swagger
 * /api/v1/seller/signout:
 *   post:
 *     tags:
 *       - Seller
 *     summary: Sign out seller
 *     responses:
 *       200:
 *         description: Signed out successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Logout successful"
 */
sellerRouter.post('/signout',authenticate ,logOut);

/**
 * @swagger
 * /api/v1/seller/change/{id}:
 *   patch:
 *     tags:
 *       - Seller
 *     summary: Change seller password
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Password changed successfully"
 *       400:
 *         description: Incorrect old password
 *         content:
 *           application/json:
 *             example:
 *               message: "Old password is incorrect"
 */

sellerRouter.patch('/change/:token', changePassword);

// /**
//  * @swagger
//  * /api/v1/seller/remove:
//  *   delete:
//  *     tags:
//  *       - Seller
//  *     summary: Delete seller account
//  *     responses:
//  *       200:
//  *         description: Seller deleted successfully
//  *         content:
//  *           application/json:
//  *             example:
//  *               message: "Seller account deleted successfully"
//  */
// sellerRouter.delete('/remove/:id', deleteSeller);


/**
 * @swagger
 * /api/v1/seller/getSellerDashboard:
 *   get:
 *     tags:
 *       - Seller
 *     summary: Get seller dashboard details
 *     responses:
 *       200:
 *         description: Seller dashboard retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Seller dashboard retrieved successfully"
 *               data:
 *                 totalProducts: 5
 *                 totalOrders: 12
 *                 totalRevenue: 34000
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized access"
 */
sellerRouter.get('/stats', authenticate, getDashboardStats);
sellerRouter.get('/recent-posts', authenticate, getRecentPosts);
sellerRouter.get('/pending-posts', authenticate, getPendingPosts);
sellerRouter.get('/approved-posts', authenticate, getApprovedPosts);
// sellerRouter.get('/category-weekly-stats', getWeeklyCategoryUploadStats);


/**
 * @swagger
 * /api/v1/seller/getAll:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all sellers (Admin only)
 *     description: This endpoint retrieves all registered sellers. Only accessible by authenticated admins using a Bearer token.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all sellers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All registered seller in the platform"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: uuid
 *                         example: "thk890J.iIsInR5cCI6Ikp-XVCJ91"
 *                       fullName:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "johndoe@example.com"
 *                       phoneNumber:
 *                         type: string
 *                         example: "+2348000000000"
 *                       school:
 *                         type: string
 *                         example: "University of Lagos"
 *                 total:
 *                   type: string
 *                   example: "5"
 *       401:
 *         description: Unauthorized - Missing or invalid admin token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Admin token required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error: [error message]"
 */                                                                                                                                                                              
sellerRouter.get('/getAll', authenticateAdmin, getAll);


 sellerRouter.get('/getOneSeller/:id',getSellerById)



module.exports = sellerRouter;