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

    const adminId = req.admin._id;

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
