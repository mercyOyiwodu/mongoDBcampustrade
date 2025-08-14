const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const adminAuth = require('../middlewares/adminAuth');
const { authLimiter } = require('../middlewares/rateLimiter');

// Dashboard routes
router.get('/dashboard/stats', adminAuth, adminController.getDashboardStats);
router.get('/dashboard/activity-logs', adminAuth, adminController.getActivityLogs);

// Seller management
router.post('/verify-seller/:sellerId', adminAuth, adminController.verifySeller);
router.get('/sellers', adminAuth, adminController.getAllSellers);

// Product management
router.get('/products', adminAuth, adminController.getAllProductsAdmin);

// KYC management
router.get('/kyc/pending', adminAuth, adminController.getPendingKYC);
router.put('/kyc/:kycId/status', adminAuth, authLimiter, adminController.updateKYCStatus);

module.exports = router;