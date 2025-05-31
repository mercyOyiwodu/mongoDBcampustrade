const express = require('express');
const { profileDetails, getSellerKyc,updateSellerKyc } = require('../controller/kycController');
const upload = require('../utils/multer');
const kycRouter = express.Router();

/**
 * @swagger
 * /api/v1/kyc/profile/{id}:
 *   patch:
 *     summary: Complete seller profile details (KYC)
 *     description: Uploads profile information for a seller including profile image, school, contact details, and more.
 *     tags:
 *       - Seller KYC
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the seller
 *         schema:
 *           type: string
 *           example: "e8c3bfa4-49d2-4c1f-95e5-b39e34f09d10"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profilePic
 *               - jambRegNo
 *               - school
 *               - gender
 *               - fullName
 *               - phoneNumber
 *             properties:
 *               profilePic:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file (image)
 *               fullName:
 *                 type: string
 *                 example: "Jane Doe"
 *               jambRegNo:
 *                 type: integer
 *                 example: 12345678
 *               school:
 *                 type: string
 *                 enum: ["Lagos State University", "University Of Lagos", "Yaba College Of Technology"]
 *                 example: "University Of Lagos"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *                 example: "Female"
 *               whatsappLink:
 *                 type: string
 *                 example: "https://wa.me/2348098765432"
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348098765432"
 *     responses:
 *       201:
 *         description: Successfully completed your profile update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully completed your profile update
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "e8c3bfa4-49d2-4c1f-95e5-b39e34f09d10"
 *                     fullName:
 *                       type: string
 *                       example: "Jane Doe"
 *                     jambRegNo:
 *                       type: integer
 *                       example: 12345678
 *                     school:
 *                       type: string
 *                       example: "University Of Lagos"
 *                     gender:
 *                       type: string
 *                       example: "Female"
 *                     whatsappLink:
 *                       type: string
 *                       example: "https://wa.me/2348098765432"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+2348098765432"
 *                     profilePic:
 *                       type: string
 *                       example: "https://res.cloudinary.com/appname/image/upload/v12345/profile.jpg"
 *       400:
 *         description: Missing or invalid input (e.g. no image uploaded)
 *       404:
 *         description: Seller not found
 *       500:
 *         description: Internal server error
 */

kycRouter.patch('/profile/:id', upload.single('profilePic'), profileDetails);

/**
 * @swagger
 * /api/v1/kyc/get-kyc-details/{id}:
 *   get:
 *     summary: Get Seller KYC Details
 *     description: Fetch a seller and their complete KYC profile by seller ID.
 *     tags:
 *       - Seller KYC
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique seller ID
 *         schema:
 *           type: string
 *           example: "e8c3bfa4-49d2-4c1f-95e5-b39e34f09d10"
 *     responses:
 *       200:
 *         description: Seller and KYC data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seller retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "e8c3bfa4-49d2-4c1f-95e5-b39e34f09d10"
 *                     email:
 *                       type: string
 *                       example: "janedoe@example.com"
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-19T12:30:00.000Z"  
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-19T12:30:00.000Z" 
 *                     SellerKYCs:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                           example: "Jane Doe"
 *                         jambRegNo:
 *                           type: integer
 *                           example: 12345678
 *                         school:
 *                           type: string
 *                           example: "University Of Lagos"
 *                         gender:
 *                           type: string
 *                           enum: [Male, Female]
 *                           example: "Female"
 *                         whatsappLink:
 *                           type: string
 *                           example: "https://wa.me/2348098765432"
 *                         phoneNumber:
 *                           type: string
 *                           example: "+2348098765432"
 *                         profilePic:
 *                           type: string
 *                           example: "https://res.cloudinary.com/app/image/upload/v123456/profile.jpg"
 *       404:
 *         description: Seller not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seller not found"
 *       500:
 *         description: Error retrieving seller data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "There was an issue getting the user detail: Internal Server Error"
 */

kycRouter.get('/get-kyc-details/:id',getSellerKyc);

kycRouter.put('/kyc/:id', upload.single('profilePic'),updateSellerKyc);  


module.exports = kycRouter;