const Product = require('../models/product');
const Transaction = require('../models/transaction');
const Seller = require('../models/seller');
const Subcategory = require('../models/subcategory');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const SellerKYC = require('../models/sellerkyc');
const Category = require('../models/category');

exports.createProduct = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;
    const { id: sellerId } = req.seller;
    const { productName, price, condition, school, description } = req.body;

    if (!productName || !price || !condition || !school || !description) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const subCategoryExists = await Subcategory.findById(subCategoryId);
    if (!subCategoryExists) {
      return res.status(404).json({ message: 'Sub category not found' });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      if (req.files) req.files.forEach((file) => fs.unlinkSync(file.path));
      return res.status(404).json({ message: 'Seller not found' });
    }

    const sellerKYC = await SellerKYC.findOne({ sellerId });
    if (!sellerKYC) {
      return res.status(400).json({ message: 'Please complete your KYC before proceeding' });
    }

    const uploadedMedia = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: 'auto',
        });
        uploadedMedia.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    const product = await Product.create({
      productName,
      price,
      condition,
      school,
      description,
      media: uploadedMedia,
      sellerId,
      subCategoryId,
      timeCreated: new Date(),
      status: 'pending',
      subCategoryName: subCategoryExists.name,
    });

    res.status(201).json({ message: 'Post created successfully', data: product });
  } catch (error) {
    console.error(error);
    if (req.files) req.files.forEach((file) => fs.unlinkSync(file.path));
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentProductsBySeller = async (req, res) => {
  try {
    const { id: sellerId } = req.params;

    const products = await Product.find({ sellerId, status: 'approved' }).sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: 'No recent posts',
      });
    }

    res.status(200).json({
      message: 'Recent posts fetched successfully',
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('subCategoryId').populate('sellerId');

    res.status(200).json({
      message: 'Products fetched successfully',
      data: products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('subCategoryId').populate('sellerId');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const seller = await SellerKYC.findOne({ sellerId: product.sellerId });

    res.status(200).json({
      message: 'Product retrieved successfully',
      data: product,
      // sellerName: seller ? seller.fullName : null, // Handle case where sellerKYC might not exist
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, productName, condition, school, description, categoryId } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, { resource_type: 'auto' });
        mediaUrls.push(uploadResult.secure_url);
        fs.unlinkSync(file.path);
      }

      product.media = mediaUrls;
    }

    product.price = price || product.price;
    product.productName = productName || product.productName;
    product.condition = condition || product.condition;
    product.school = school || product.school;
    product.description = description || product.description;
    if (categoryId) {
      product.categoryId = categoryId;
    }

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.log(error);
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => fs.unlinkSync(file.path));
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: id });

    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = 'approved';
    await product.save();

    res.status(200).json({ message: 'Product approved', data: product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = 'not_approved';
    await product.save();

    res.status(200).json({ message: 'Product rejected', data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovedProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' });
    res.status(200).json({ message: 'Approved products', data: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingProducts = async (req, res) => {
  try {
    const { id: sellerId } = req.params;
    const products = await Product.find({ sellerId, status: 'pending' });
    res.status(200).json({ message: 'Pending products', data: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProductsBySubcategory = async (req, res) => {
  try {
    const { id: subCategoryId } = req.params;
    const subCategoryExists = await Subcategory.findById(subCategoryId);
    if (!subCategoryExists) {
      return res.status(404).json({ message: 'Sub category not found' });
    }
    const products = await Product.find({ subCategoryId });
    res.status(200).json({
      message: `All products by sub category ${subCategoryId}`,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let searchQuery = { status: 'approved' };
    
    // Use text search if query provided, otherwise return all approved products
    if (q.trim()) {
      searchQuery.$text = { $search: q };
    }

    const products = await Product.find(searchQuery)
      .sort(q.trim() ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('subCategoryId')
      .populate({ path: 'sellerId', select: '_id' });

    const total = await Product.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      message: 'Search successful',
      count: products.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};