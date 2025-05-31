const mongoose = require('mongoose');
const { Schema } = mongoose;

const adSchema = new Schema(
  {
    // MongoDB uses _id as the primary key by default (ObjectId)
    // If you want to use UUID, you can uncomment the id field below
    // id: {
    //   type: String,
    //   default: () => require('uuid').v4(),
    //   required: true,
    //   unique: true,
    // },
    title: {
      type: String,
      required: false, // allowNull: true
    },
    image: {
      type: String,
      required: true, // allowNull: false
    },
    description: {
      type: String, // TEXT in Sequelize maps to String in Mongoose
      required: false, // allowNull: true
    },
    date: {
      type: Date,
      required: true, // allowNull: false
    },
    expiresAt: {
      type: Date,
      required: true, // allowNull: false
    },
  },
  {
    // Mongoose options
    collection: 'Ads', // Equivalent to tableName
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Define the model
const Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;