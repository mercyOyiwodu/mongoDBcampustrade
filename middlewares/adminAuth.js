const JWT = require('jsonwebtoken');
const Admin = require('../models/admin'); 

exports.authenticateAdmin = async (req, res, next) => {
    try {
        // Get the token from Authorization header
        const auth = req.header('Authorization');
        if (!auth) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const token = auth.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'Invalid token'
            });
        }

        // Verify the token
        const decodedToken = await JWT.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decodedToken); // For debugging

        // Ensure it's an admin token
        if (decodedToken.type !== 'admin') {
            return res.status(403).json({
                message: 'Admin privileges required'
            });
        }

        // Find the admin by id
        const admin = await Admin.findByPk(decodedToken.id); // <-- FIXED: using 'id'
        if (!admin) {
            return res.status(404).json({
                message: 'Authentication failed: admin not found'
            });
        }

        // Attach admin data to request
        req.admin = {
            id: admin.id,
            email: admin.email,
            isAdmin: admin.isAdmin,
        };

        next();
    } catch (error) {
        if (error instanceof JWT.TokenExpiredError) {
            return res.status(401).json({
                message: 'Session timed-out, please login'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid token'
            });
        }

        console.error('Auth Error:', error.message);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};


  exports.adminAuth = (req, res, next) => {
    try {
      // Check if admin object exists on request
      if (!req.admin) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }
      
      if (req.admin.isAdmin !== true) {
        return res.status(403).json({
          message: 'Admin privileges required'
        });
      }
      
      next();
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };
  
  