const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  price: {
    type: mongoose.Types.Decimal128,
    required: true,
  },

  condition: {
    type: String,
    enum: ['Used', 'New'],
    default: 'Used',
  },

  media: {
    type: [String],
    required: true,
    validate: {
      validator: Array.isArray,
      message: 'Media must be an array of strings',
    },
  },

  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },

  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    required: true,
  },

  subCategoryName: {
    type: String,
    required: true,
  },

  school: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'not_approved'],
    default: 'pending',
  },

  timeCreated: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
