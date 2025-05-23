const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;
  const webID = req.user.webID;

  if (!categoryName) {
    return res.status(200).json({
      statusCode: 201,
      message: "Please provide category name",
    });
  }

  const existing = await Category.findOne({ categoryName: categoryName.trim(), webID });
  if (existing) {
    return res.status(200).json({
      statusCode: 201,
      message: "Category already exists",
    });
  }

  const category = await Category.create({ categoryName: categoryName.trim(), webID });

  const categoryResponse = category.toObject();
  delete categoryResponse.webID;
  delete categoryResponse.__v;

  res.status(200).json({
    statusCode: 200,
    message: "Category created successfully",
    category: categoryResponse,
  });
});

// Get all categories by user
const getCategories = asyncHandler(async (req, res) => {
  const webID = req.user.webID;

  const categories = await Category.find({ webID }).sort({ categoryName: 1 });

  const cleaned = categories.map((c) => {
    const item = c.toObject();
    delete item.webID;
    delete item.__v;
    return item;
  });

  res.status(200).json({
    statusCode: 200,
    message: cleaned.length ? "Categories retrieved successfully" : "No categories found for this user",
    categories: cleaned,
  });
});

// Delete a category by payload
const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.body;
  const webID = req.user.webID;

  if (!categoryId) {
    return res.status(200).json({
      statusCode: 201,
      message: "categoryId is required",
    });
  }

  const category = await Category.findOneAndDelete({ _id: categoryId, webID });

  if (!category) {
    return res.status(200).json({
      statusCode: 201,
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
