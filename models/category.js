const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true // Optional, if category names must be unique
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
