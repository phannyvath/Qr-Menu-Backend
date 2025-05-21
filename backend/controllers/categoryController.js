const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");

// Create new category
const createCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;
  const webID = req.user.webID;

  if (!categoryName) {
    return res.status(200).json({
      statusCode: 200,
      message: "Category name is required",
    });
  }

  const existing = await Category.findOne({ categoryName: categoryName.trim(), webID });
  if (existing) {
    return res.status(200).json({
      statusCode: 200,
      message: "Category already exists",
    });
  }

  const category = await Category.create({ categoryName: categoryName.trim(), webID });

  res.status(200).json({
    statusCode: 200,
    message: "Category created successfully",
    category,
  });
});

// Get all categories
const getCategories = asyncHandler(async (req, res) => {
  const webID = req.user.webID;

  const categories = await Category.find({ webID }).sort({ categoryName: 1 });

  res.status(200).json({
    statusCode: 200,
    message: "Categories fetched successfully",
    categories,
  });
});

// Delete category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const webID = req.user.webID;

  const category = await Category.findOneAndDelete({ _id: id, webID });

  if (!category) {
    return res.status(200).json({
      statusCode: 200,
      message: "Category not found or not authorized",
    });
  }

  res.status(200).json({
    statusCode: 200,
    message: "Category deleted successfully",
  });
});

module.exports = {
  createCategory,
  getCategories,
  deleteCategory,
};
