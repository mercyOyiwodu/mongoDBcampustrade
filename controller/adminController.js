const Seller = require('../models/seller');
const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/nodemailer');
const signUpTemplate = require('../utils/mailtemplates');
const JWT = require('jsonwebtoken');

exports.createAdmin = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Password does not match',
      });
    }

    const adminExists = await Admin.findOne({ email: email.toLowerCase() });
    if (adminExists) {
      return res.status(400).json({
        message: `Admin with this email: ${email} already exists`,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newAdmin.save();

    const token = JWT.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: '30mins' });

    const link = `${req.protocol}://${req.get('host')}/api/v1/verify-admin/${token}`;

    const mailDetails = {
      email: newAdmin.email,
      subject: 'Welcome to Campus Trade',
      html: signUpTemplate(link, 'Admin'),
    };

    await sendEmail(mailDetails);

    const adminData = newAdmin.toObject();
    delete adminData.password;

    res.status(201).json({
      message: 'Admin account created successfully',
      data: adminData,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

exports.verifyAdmin = async (req, res) => {
  try {
    const { token } = req.params;
    await JWT.verify(token, process.env.JWT_SECRET, async (error, payload) => {
      if (error) {
        if (error instanceof JWT.TokenExpiredError) {
          const decodedToken = await JWT.decode(token);

          const admin = await Admin.findById(decodedToken.id);
          if (admin == null) {
            return res.status(400).json({
              message: 'Admin not found',
            });
          }
          if (admin.isVerified === true) {
            return res.status(400).json({
              message: 'Admin already verified, please login',
            });
          }

          const newToken = await JWT.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '3mins' });

          const link = `${req.protocol}://${req.get('host')}/api/v1/verify-admin/${newToken}`;

          const mailDetails = {
            email: admin.email,
            subject: 'Email verification',
            html: signUpTemplate(link, 'Admin'),
          };

          await sendEmail(mailDetails);

          res.status(200).json({
            message: 'Link expired: A new verification link was sent, please check your email',
          });
        }
      } else {
        const admin = await Admin.findById(payload.id);
        if (!admin) {
          return res.status(404).json({
            message: 'Admin not found',
          });
        }
        if (admin.isVerified === true) {
          return res.status(400).json({
            message: 'Admin has already been verified, please login',
          });
        }
        admin.isVerified = true;
        admin.isAdmin = true;
        await admin.save();
        res.status(200).json({
          message: 'Account verified successfully',
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error ' + error.message,
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const newAdmin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (!newAdmin) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, newAdmin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = JWT.sign({ id: newAdmin._id, type: 'admin', isAdmin: newAdmin.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    const adminData = newAdmin.toObject();
    delete adminData.password;
    res.status(200).json({
      message: 'Login successful',
      token,
      data: adminData,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

exports.verifySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const adminId = req.admin.id;

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found',
      });
    }

    seller.isVerified = true;
    seller.verifiedBy = adminId;
    seller.verifiedAt = new Date();

    await seller.save();

    res.status(200).json({
      message: 'Seller verified successfully',
      data: seller,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

// Dashboard Analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const Product = require('../models/product');
    const Transaction = require('../models/transaction');
    const SellerKYC = require('../models/sellerkyc');
    const Category = require('../models/category');
    const Subcategory = require('../models/subcategory');

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

    // Basic counts
    const totalSellers = await Seller.countDocuments();
    const verifiedSellers = await Seller.countDocuments({ isVerified: true });
    const totalProducts = await Product.countDocuments();
    const approvedProducts = await Product.countDocuments({ status: 'approved' });
    const pendingProducts = await Product.countDocuments({ status: 'pending' });
    const totalTransactions = await Transaction.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalSubcategories = await Subcategory.countDocuments();
    const pendingKYC = await SellerKYC.countDocuments({ status: 'pending' });

    // Recent activity (last 30 days)
    const recentSellers = await Seller.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const recentProducts = await Product.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const recentTransactions = await Transaction.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Product status distribution
    const productsByStatus = await Product.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top categories by product count
    const topCategories = await Product.aggregate([
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subCategoryId',
          foreignField: '_id',
          as: 'subcategory'
        }
      },
      {
        $unwind: '$subcategory'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'subcategory.categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $group: {
          _id: {
            categoryId: '$category._id',
            categoryName: '$category.name'
          },
          productCount: { $sum: 1 }
        }
      },
      {
        $sort: { productCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Recent activity timeline (last 7 days)
    const activityTimeline = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        overview: {
          totalSellers,
          verifiedSellers,
          totalProducts,
          approvedProducts,
          pendingProducts,
          totalTransactions,
          totalCategories,
          totalSubcategories,
          pendingKYC
        },
        recentActivity: {
          newSellers: recentSellers,
          newProducts: recentProducts,
          newTransactions: recentTransactions
        },
        analytics: {
          productsByStatus,
          topCategories,
          activityTimeline
        },
        metrics: {
          sellerVerificationRate: totalSellers > 0 ? ((verifiedSellers / totalSellers) * 100).toFixed(2) : 0,
          productApprovalRate: totalProducts > 0 ? ((approvedProducts / totalProducts) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

// Get all sellers with pagination and filters
exports.getAllSellers = async (req, res) => {
  try {
    const { page = 1, limit = 10, verified, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const sellers = await Seller.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Seller.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Sellers retrieved successfully',
      data: sellers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: sellers.length,
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

// Get all products with admin filters
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    const skip = (page - 1) * limit;
    const Product = require('../models/product');

    let query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('sellerId', 'email fullName')
      .populate('subCategoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: products.length,
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

// Get pending KYC applications
exports.getPendingKYC = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const SellerKYC = require('../models/sellerkyc');

    const pendingKYC = await SellerKYC.find({ status: 'pending' })
      .populate('sellerId', 'email fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SellerKYC.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      message: 'Pending KYC applications retrieved successfully',
      data: pendingKYC,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: pendingKYC.length,
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

// Approve/Reject KYC
exports.updateKYCStatus = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { status, reason } = req.body;
    const SellerKYC = require('../models/sellerkyc');

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const kyc = await SellerKYC.findById(kycId);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC application not found'
      });
    }

    kyc.status = status;
    kyc.reviewedBy = req.admin.id;
    kyc.reviewedAt = new Date();
    if (reason) {
      kyc.reason = reason;
    }

    await kyc.save();

    res.status(200).json({
      success: true,
      message: `KYC ${status} successfully`,
      data: kyc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

// Get system activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;
    const Product = require('../models/product');
    const Transaction = require('../models/transaction');

    // Aggregate recent activities from different collections
    const recentProducts = await Product.find()
      .populate('sellerId', 'email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('productName status createdAt sellerId');

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount status createdAt');

    const recentSellers = await Seller.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('email isVerified createdAt');

    // Format activity feed
    const activities = [
      ...recentProducts.map(product => ({
        type: 'product',
        action: 'created',
        description: `New product "${product.productName}" created`,
        user: product.sellerId?.email || 'Unknown',
        timestamp: product.createdAt,
        status: product.status
      })),
      ...recentTransactions.map(transaction => ({
        type: 'transaction',
        action: 'created',
        description: `Transaction of $${transaction.amount} created`,
        timestamp: transaction.createdAt,
        status: transaction.status
      })),
      ...recentSellers.map(seller => ({
        type: 'seller',
        action: 'registered',
        description: `New seller registered: ${seller.email}`,
        timestamp: seller.createdAt,
        status: seller.isVerified ? 'verified' : 'pending'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      message: 'Activity logs retrieved successfully',
      data: activities.slice(skip, skip + parseInt(limit)),
      total: activities.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: ' + error.message,
    });
  }
};
