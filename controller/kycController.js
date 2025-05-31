const Seller = require('../models/seller');
const SellerKYC = require('../models/sellerkyc');
const cloudinary = require('../config/cloudinary');
const { toPascalCase } = require('../utils/stringHelpers');
const fs = require('fs');

exports.profileDetails = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Profile image is required',
      });
    }

    if (req.body.fullName) {
      req.body.fullName = toPascalCase(req.body.fullName);
    }

    const { id: sellerId } = req.params;
    const { jambRegNo, school, gender, whatsappLink, phoneNumber, fullName } = req.body;

    const userExists = await Seller.findById(sellerId);
    if (!userExists) {
      return res.status(404).json({
        message: 'Seller not found',
      });
    }

    // Use Cloudinary promise-based approach
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' });

    // Unlink the file from our local storage after upload
    fs.unlinkSync(req.file.path);

    const data = {
      school,
      jambRegNo,
      sellerId,
      whatsappLink,
      gender,
      phoneNumber,
      profilePic: result.secure_url,
      fullName,
    };

    const profile = new SellerKYC(data);
    await profile.save();

    res.status(201).json({
      message: 'Successfully completed your profile update',
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getSellerKyc = async (req, res) => {
  try {
    const { id: sellerId } = req.params;

    const seller = await Seller.findById(sellerId).populate('SellerKYCs');

    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found',
      });
    }

    return res.status(200).json({
      message: 'Seller retrieved successfully',
      data: seller,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'There was an issue getting the user detail: ' + error.message,
    });
  }
};

exports.updateSellerKyc = async (req, res) => {
  try {
    const { id: sellerId } = req.params;
    const { jambRegNo, school, gender, whatsappLink, phoneNumber, fullName } = req.body;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Grab the existing KYC row (must exist to edit)
    const kyc = await SellerKYC.findOne({ sellerId });
    if (!kyc) {
      return res.status(404).json({ message: 'KYC record not found' });
    }

    let newProfilePicUrl = kyc.profilePic;
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' });
      fs.unlinkSync(req.file.path);
      newProfilePicUrl = upload.secure_url;
    }

    kyc.jambRegNo = jambRegNo ?? kyc.jambRegNo;
    kyc.school = school ?? kyc.school;
    kyc.gender = gender ?? kyc.gender;
    kyc.whatsappLink = whatsappLink ?? kyc.whatsappLink;
    kyc.phoneNumber = phoneNumber ?? kyc.phoneNumber;
    kyc.fullName = fullName ? toPascalCase(fullName) : kyc.fullName;
    kyc.profilePic = newProfilePicUrl;

    await kyc.save();

    return res.status(200).json({
      message: 'KYC updated successfully',
      data: kyc,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
