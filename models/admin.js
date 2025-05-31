const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Recommended for admin login
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
