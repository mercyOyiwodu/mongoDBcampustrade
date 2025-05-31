const mongoose = require('mongoose');
const { Schema } = mongoose;

const sellerKYCSchema = new Schema(
  {
    // MongoDB uses _id as the primary key by default (ObjectId)
    // If you want to use UUID, you can uncomment the id field below
    // id: {
    //   type: String,
    //   default: () => require('uuid').v4(),
    //   required: true,
    //   unique: true,
    // },
    jambRegNo: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      required: true,
    },
    whatsappLink: {
      type: String,
      required: false, // allowNull: true in Sequelize
      default: true, // Note: default: true seems unusual for a String; confirm if this should be a string or boolean
    },
    school: {
      type: String,
      enum: ['Lagos State University', 'University Of Lagos', 'Yaba College Of Technology'],
      required: false, // allowNull: true is implied if not specified
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Female', 'Male'],
      default: 'Male',
    },
    // Added sellerId to reference Seller model (replacing foreignKey: 'id')
    sellerId: {
      type: Schema.Types.ObjectId, // Reference to Seller model
      ref: 'Seller', // Assuming Seller is the Mongoose model name
      required: true,
    },
    // If you intended to use the id field as the foreign key (matching Seller's id), you can remove sellerId and use:
    // Note: This is unusual and may cause issues, as id is the primary key of SellerKYC
    // id: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Seller',
    //   required: true,
    // },
  },
  {
    // Mongoose options
    collection: 'SellerKYCs', // Equivalent to tableName
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Define the model
const SellerKYC = mongoose.model('SellerKYC', sellerKYCSchema);

module.exports = SellerKYC;