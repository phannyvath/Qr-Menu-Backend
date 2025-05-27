const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");
const Food = require("../models/foodModel");

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { categoryName, status } = req.body;
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

  const category = await Category.create({
    categoryName: categoryName.trim(),
    webID,
    status: typeof status === "boolean" ? status : true,
  });

  const categoryResponse = category.toObject();
  delete categoryResponse.webID;
  delete categoryResponse.__v;

  res.status(200).json({
    statusCode: 200,
    message: "Category created successfully",
    category: categoryResponse,
  });
});

// Get all categories by authenticated user
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

// Delete category by payload
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

// Update category status by payload
const updateCategoryStatus = asyncHandler(async (req, res) => {
  const { categoryId, status } = req.body;
  const webID = req.user.webID;

  if (!categoryId) {
    return res.status(200).json({
      statusCode: 201,
      message: "categoryId is required",
    });
  }

  if (typeof status !== "boolean") {
    return res.status(200).json({
      statusCode: 201,
      message: "Status must be a boolean",
    });
  }

  // Find the category first to get its name
  const category = await Category.findOneAndUpdate(
    { _id: categoryId, webID },
    { status },
    { new: true }
  ).select("-webID -__v");

  if (!category) {
    return res.status(200).json({
      statusCode: 201,
      message: "Category not found or not authorized",
    });
  }

  // Update all foods in this category to match the new status
  await Food.updateMany(
    { category: category.categoryName, webID },
    { status }
  );

  res.status(200).json({
    statusCode: 200,
    message: "Category status updated successfully",
    category,
  });
});

// Update category details by payload
const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId, categoryName, status } = req.body;
  const webID = req.user.webID;

  if (!categoryId) {
    return res.status(200).json({
      statusCode: 201,
      message: "categoryId is required",
    });
  }

  // Find the current category to get the old name
  const currentCategory = await Category.findOne({ _id: categoryId, webID });
  if (!currentCategory) {
    return res.status(200).json({
      statusCode: 201,
      message: "Category not found or not authorized",
    });
  }

  const updates = {};
  if (categoryName) updates.categoryName = categoryName.trim();
  if (typeof status === "boolean") updates.status = status;

  const category = await Category.findOneAndUpdate(
    { _id: categoryId, webID },
    updates,
    { new: true }
  ).select("-webID -__v");

  if (!category) {
    return res.status(200).json({
      statusCode: 201,
      message: "Category not found or not authorized",
    });
  }

  // If category name changed, update all foods with the old name to the new name
  if (categoryName && categoryName.trim() !== currentCategory.categoryName) {
    await Food.updateMany(
      { category: currentCategory.categoryName, webID },
      { category: categoryName.trim() }
    );
  }

  // If status changed, update all foods in this category to match the new status
  if (typeof status === "boolean" && status !== currentCategory.status) {
    await Food.updateMany(
      { category: categoryName ? categoryName.trim() : currentCategory.categoryName, webID },
      { status }
    );
  }

  res.status(200).json({
    statusCode: 200,
    message: "Category updated successfully",
    category,
  });
});

module.exports = {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategoryStatus,
  updateCategory,
};
