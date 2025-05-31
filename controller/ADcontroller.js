const Ad = require('../models/ad');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Create Ad with flexible expiry
exports.createAd = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const { title, description, expiresInDays } = req.body;
    const daysToExpire = parseInt(expiresInDays, 10) || 7; 

    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' });

    // Remove file from local storage
    fs.unlinkSync(req.file.path);

    const expiresAt = new Date(Date.now() + daysToExpire * 24 * 60 * 60 * 1000);

    const ad = await Ad.create({
      title,
      image: result.secure_url,
      description,
      expiresAt
    });

    res.status(201).json({ message: 'Ad created successfully', data: ad });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create ad', error: error.message });
  }
};

// Delete Ad if expired
exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findByPk(id);

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    // Check if ad is expired
    const now = new Date();
    if (ad.expiresAt > now) {
      return res.status(400).json({ message: 'Ad has not expired yet' });
    }

    const deleted = await Ad.destroy({ where: { id } });

    res.status(200).json({ message: 'Ad deleted successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
