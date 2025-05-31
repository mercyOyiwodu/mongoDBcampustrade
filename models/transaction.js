const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    // MongoDB uses _id as the primary key by default (ObjectId)
    // If you want to use UUID, you can uncomment the id field below
    // id: {
    //   type: String,
    //   default: () => require('uuid').v4(),
    //   required: true,
    //   unique: true,
    // },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number, // Using Number instead of INTEGER for MongoDB
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    paymentDate: {
      type: String, // Kept as String per original model
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
      default: 'Pending',
    },
    purpose: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    productId: {
      type: Schema.Types.ObjectId, // Reference to Product model
      ref: 'Product', // Assuming Product is the Mongoose model name
      required: true,
    },
    // sellerId: {
    //   type: Schema.Types.ObjectId, // Reference to Seller model
    //   ref: 'Seller', // Assuming Seller is the Mongoose model name
    //   required: true,
    // },
  },
  {
    // Mongoose options
    collection: 'transactions', // Equivalent to tableName
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Define the model
const Transaction = mongoose.model('transaction', transactionSchema);

module.exports = Transaction;