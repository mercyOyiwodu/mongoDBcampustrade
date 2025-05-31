const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const Product = require('../models/product');

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({ name });
    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('subcategories');

    res.status(200).json({
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Get Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({
      message: 'Category fetched successfully',
      data: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;

    await category.save();

    res.status(200).json({
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();

    res.status(200).json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
