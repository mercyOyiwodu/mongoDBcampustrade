const SubCategory = require('../models/subcategory');
const Category = require('../models/category');
const Product = require('../models/product');

// Create SubCategory
exports.createSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    // Check if categoryId exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const existingSubCategory = await SubCategory.findOne({ name, categoryId });
    if (existingSubCategory) {
      return res.status(400).json({ message: 'Subcategory already exists in this category' });
    }

    const subCategory = new SubCategory({ name, categoryId });
    await subCategory.save();

    res.status(201).json({
      message: 'Subcategory created successfully',
      data: subCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Get All SubCategories
exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate('categoryId').populate({
      path: 'Products',
      model: Product,
    });

    res.status(200).json({
      message: 'Subcategories fetched successfully',
      data: subCategories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Get SubCategory by ID
exports.getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id).populate('categoryId').populate({
      path: 'Products',
      model: Product,
    });

    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    res.status(200).json({
      message: 'Subcategory fetched successfully',
      data: subCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Update SubCategory
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;

    const subCategory = await SubCategory.findById(id);

    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    // If categoryId is provided, validate it
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Category not found' });
      }
      subCategory.categoryId = categoryId;
    }

    // Update name if provided
    if (name) {
      subCategory.name = name;
    }

    await subCategory.save();

    res.status(200).json({
      message: 'Subcategory updated successfully',
      data: subCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Delete SubCategory
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id);

    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    await subCategory.deleteOne();

    res.status(200).json({
      message: 'Subcategory deleted successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
