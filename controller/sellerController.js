const JWT = require('jsonwebtoken');
const { sendEmail } = require('../utils/nodemailer');
const { signUpTemplate, passwordResetTemplate } = require('../utils/mailtemplates');
const fs = require('fs');
const Product = require('../models/product');
const Category = require('../models/category');
const verificationLink = process.env.FRONTEND_URL;
const reset = process.env.RESET_PASSWORD;
const Seller = require('../models/seller');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const sellerExists = await Seller.findOne({ email: email.toLowerCase() });
    if (sellerExists) {
      return res.status(400).json({
        message: `An account with ${email} already exists`,
      });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create seller
    const seller = await Seller.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      isLoggedIn: false,
    });

    // Generate JWT token
    const token = JWT.sign({ sellerId: seller._id }, process.env.JWT_SECRET, { expiresIn: '30mins' });

    // Create verification link
    const link = `${req.protocol}://campus-trade-h7bq.vercel.app/verification/${token}`;
    const mailDetails = {
      email: seller.email,
      subject: 'Verify your CampusTrade account',
      html: signUpTemplate(link, 'seller'),
    };

    await sendEmail(mailDetails);

    const sellerData = seller.toJSON();
    delete sellerData.password;

    return res.status(201).json({
      message: 'Account created! Please check your email to verify it.',
      data: sellerData,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' + error.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(404).json({
        message: 'Token not found',
      });
    }

    JWT.verify(token, process.env.JWT_SECRET, async (error, payload) => {
      if (error) {
        if (error instanceof JWT.JsonWebTokenError) {
          const { sellerId } = JWT.decode(token);
          const seller = await Seller.findById(sellerId);

          if (!seller) {
            return res.status(404).json({
              message: 'Seller not found',
            });
          }
          const newToken = JWT.sign({ sellerId: seller._id }, process.env.JWT_SECRET, { expiresIn: '30mins' });
          const link = `${req.protocol}://campus-trade-h7bq.vercel.app/verification/${newToken}`;
          const mailDetails = {
            email: seller.email,
            subject: 'Verify your CampusTrade account',
            html: signUpTemplate(link, 'seller'),
          };
          await sendEmail(mailDetails);
          res.status(200).json({
            message: 'Verification sent to email',
          });
        }
      } else {
        const seller = await Seller.findById(payload.sellerId);

        if (!seller) {
          return res.status(404).json({
            message: 'Seller not found',
          });
        }

        seller.isVerified = true;
        await seller.save();
        res.status(200).json({
          message: 'Email verified successfully',
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    // Get the email from the request body
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: 'Please input your email',
      });
    }

    // Check for the user
    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found',
      });
    }

    // Generate a token for the user
    const newToken = await JWT.sign({ sellerId: seller._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Create the reset link
    const link = `${reset}/${newToken}`;

    const mailDetails = {
      subject: 'Password Reset',
      email: seller.email,
      html: passwordResetTemplate(link, 'Seller'),
    };

    // Await nodemailer to send the user an email
    await sendEmail(mailDetails);

    // Send a success response
    res.status(200).json({
      message: 'Password reset initiated, Please check your email for the reset link',
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Extract the token from the params
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: 'Token not found',
      });
    }
    // Extract the password and confirm password from the request body
    const { password, confirmPassword } = req.body;
    // Verify if the token is still valid
    const decoded = await JWT.verify(token, process.env.JWT_SECRET);
    const sellerId = decoded.sellerId;
    // Check if the user still exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found',
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match',
      });
    }
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Update the user's password to the new password
    seller.password = hashedPassword;
    await seller.save();
    // Send a success response
    res.status(200).json({
      message: 'Password reset successful',
    });
  } catch (error) {
    console.log(error.message);
    if (error instanceof JWT.JsonWebTokenError) {
      res.status(400).json({
        message: 'Link expired, Please initiate a new link',
      });
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const seller = await Seller.findOne({ email: email.toLowerCase() });

    if (!seller) {
      return res.status(400).json({ message: 'Seller not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, seller.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    if (seller.isVerified === false) {
      const token = JWT.sign({ sellerId: seller._id }, process.env.JWT_SECRET, { expiresIn: '30mins' });

      // Create verification link
      const link = `${verificationLink}/${token}`;
      const mailDetails = {
        email: seller.email,
        subject: 'Verify your CampusTrade account' + 'Please verify your email by clicking the link below',
        html: signUpTemplate(link, 'seller'),
      };

      await sendEmail(mailDetails);
      return res.status(400).json({
        message: 'Not verified, please check your email to verify',
        token,
      });
    }
    seller.isLoggedIn = true;

    const token = await JWT.sign(
      { sellerId: seller._id, isAdmin: seller.isAdmin, isLoggedIn: seller.isLoggedIn },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const sellerData = seller.toJSON();
    delete sellerData.password;

    await seller.save();

    res.status(200).json({
      message: 'Login successful',
      data: sellerData,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.logOut = async (req, res) => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'User not found' });
    }

    seller.isLoggedIn = false;
    await seller.save();

    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Check if the user exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, seller.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: 'Incorrect password',
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, seller.password);

    if (isSamePassword) {
      return res.status(400).json({
        message: 'New password cannot be the same as the current password',
      });
    }

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    seller.password = hashedPassword;
    await seller.save();

    // Return success message
    res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: 'An error occurred while updating the password.' + error.message,
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Basic validation
    if (!sellerId || typeof sellerId !== 'string') {
      return res.status(400).json({ message: 'Invalid sellerId' });
    }

    const totalProducts = await Product.countDocuments({ sellerId });
    const pendingProducts = await Product.countDocuments({ sellerId, approvalStatus: 'pending' });
    const approvedProducts = await Product.countDocuments({ sellerId, approvalStatus: 'approved' });

    res.status(200).json({
      message: 'Dashboard stats retrieved successfully',
      data: {
        totalProducts,
        pendingProducts,
        approvedProducts,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal Server Error: ' + error.message });
  }
};

exports.getRecentPosts = async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const recentPosts = await Product.find({ sellerId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({ message: 'Recent posts retrieved', data: recentPosts });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error: ' + error.message });
  }
};

exports.getPendingPosts = async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const pendingPosts = await Product.find({ sellerId, approvalStatus: 'pending' });

    res.status(200).json({ message: 'Pending posts retrieved', data: pendingPosts });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error: ' + error.message });
  }
};

exports.getApprovedPosts = async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const approvedPosts = await Product.find({ sellerId, approvalStatus: 'approved' });

    res.status(200).json({ message: 'Approved posts retrieved', data: approvedPosts });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error: ' + error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const getSellers = await Seller.find();
    res.status(200).json({
      message: 'All registered sellers in the platform',
      data: getSellers,
      total: getSellers.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error' + error.message,
    });
  }
};

exports.getSellerById = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(400).json({
        message: 'Seller id is required',
      });
    }

    return res.status(200).json({
      message: 'Seller found',
      data: seller,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error getting seller ' + error.message,
    });
  }
};

exports.deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({
        message: 'User not found',
      });
    }
    const oldFilePaths = seller.profilePic.map((e) => `./uploads/${e}`);
    const deleteUser = await Seller.findByIdAndDelete(id);

    if (deleteUser) {
      oldFilePaths.forEach((path) => {
        if (fs.existsSync(path)) {
          fs.unlinkSync(path);
        }
      });
    }
    res.status(201).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};