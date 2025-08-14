const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // Make sure bcryptjs is installed

const sellerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    fullName: { type: String },
    profilePic: [{ type: String }],
    // Add other necessary fields here
}, { timestamps: true });

// Add index for email field for faster authentication
sellerSchema.index({ email: 1 });

// Hash the password before saving to the database
sellerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare the password during login
sellerSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const Seller = mongoose.model('Sellers', sellerSchema);

module.exports = Seller;
