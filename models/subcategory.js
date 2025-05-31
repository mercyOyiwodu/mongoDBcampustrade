const mongoose = require('mongoose');
const { Schema } = mongoose;

const subcategorySchema = new mongoose.Schema(
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
    categoryId: {
      type: Schema.Types.ObjectId, // Reference to Category model
      ref: 'Category', // Assuming Category is the Mongoose model name
      required: true,
    },
    // productId: {
    //   type: Schema.Types.ObjectId, // Reference to Product model
    //   ref: 'Product', // Assuming Product is the Mongoose model name
    // },
  },
  {
    // Mongoose options
    collection: 'Subcategories', // Equivalent to tableName
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Define the model
const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;