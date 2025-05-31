const { initializePayment, verifyPayment } = require('../controller/transactionController');
const router = require('express').Router();

/**
 * @swagger
 * /api/v1/initialize/{id}:
 *   post:
 *     summary: Initialize payment for product posting
 *     tags:
 *       - Payment
 *     description: Initializes a payment process to charge 5% of the product price as a posting fee.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to post
 *         example: "12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "student@example.com"
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment initialized successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                       example: "TCA-YU-X1Y2Z3A4B5C6"
 *                     checkout_url:
 *                       type: string
 *                       example: "https://checkout.korapay.com/some-hash"
 *                     redirect_url:
 *                       type: string
 *                       example: "https://legacy-builder.vercel.app/verifyingPayment"
 *       400:
 *         description: Bad request due to missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide email, name, and productId"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: Server error while initializing payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error initializing payment: Something went wrong"
 */

router.post('/initialize/:id', initializePayment);


/**
 * @swagger
 * /api/v1/verify:
 *   get:
 *     summary: Verify a payment by reference
 *     tags:
 *       - Payment
 *     description: Verifies a payment using the KoraPay transaction reference and updates the transaction and product status accordingly.
 *     parameters:
 *       - in: query
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique reference from KoraPay for the transaction
 *         example: "TCA-YU-ABC123XYZ456"
 *     responses:
 *       200:
 *         description: Payment verified or failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       type: string
 *                       example: "Payment verified and product approved"
 *                     data:
 *                       type: object
 *                       example:
 *                         id: 21
 *                         name: "Jane Doe"
 *                         email: "student@example.com"
 *                         amount: 250
 *                         status: "Success"
 *                         reference: "TCA-YU-ABC123XYZ456"
 *                         used: true
 *                         productId: 34
 *                 - properties:
 *                     message:
 *                       type: string
 *                       example: "Payment verification failed"
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transaction not found"
 *       500:
 *         description: Server error while verifying payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error verifying payment: Something went wrong"
 */


router.get('/verify', verifyPayment)

module.exports = router;