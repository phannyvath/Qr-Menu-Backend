const asyncHandler = require("express-async-handler");
const Food = require("../models/foodModel");
const Category = require("../models/categoryModel"); // <-- Added

// Create a new food item
const createFood = asyncHandler(async (req, res) => {
  const { foodName, description, price, category, imgUrl, status } = req.body;
  const webID = req.user.webID;

  if (!foodName || !description || !price || !category || !imgUrl) {
    return res.status(200).json({
      statusCode: 200,
      message: "Please provide all required fields",
    });
  }

  // ✅ Check that category exists for this user
  const categoryExists = await Category.findOne({ categoryName: category, webID });
  if (!categoryExists) {
    return res.status(200).json({
      statusCode: 200,
      message: "Invalid category. Please select a valid one from the list.",
    });
  }

  const food = await Food.create({
    foodName,
    description,
    price,
    category, // still stored as a string
    imgUrl,
    webID,
    status,
  });

  const foodResponse = food.toObject();
  delete foodResponse.webID;
  delete foodResponse.__v;

  res.status(200).json({
    statusCode: 200,
    message: "Food created successfully",
    food: foodResponse,
  });
});

// Get all foods
const getFoods = asyncHandler(async (req, res) => {
  const foods = await Food.find().select("-webID -__v");

  res.status(200).json({
    statusCode: 200,
    message: "Foods retrieved successfully",
    foods,
  });
});

// Get foods by owner (authenticated user)
const getFoodsByOwner = asyncHandler(async (req, res) => {
  const webID = req.user.webID;

  const foods = await Food.find({ webID }).select("-webID -__v");

  res.status(200).json({
    statusCode: 200,
    message: foods.length ? "Foods retrieved successfully" : "No foods found for this user",
    foods,
  });
});

// Get foods by webID (e.g. for public menu)
const getFoodsByWebID = asyncHandler(async (req, res) => {
  const { webId } = req.body;

  if (!webId) {
    return res.status(200).json({
      statusCode: 200,
      message: "webId is required",
      foodData: [],
    });
  }

  const foods = await Food.find({ webID: webId }).select("-webID -__v");

  const groupedFoods = foods.reduce((acc, food) => {
    let group = acc.find((g) => g.category === food.category);
    if (!group) {
      group = {
        id: acc.length + 1,
        category: food.category,
        items: [],
      };
      acc.push(group);
    }
    group.items.push({
      id: food._id,
      name: food.foodName,
      description: food.description,
      price: food.price,
      image: food.imgUrl,
      status: food.status,
      createdAt: food.createdAt,
      updatedAt: food.updatedAt,
    });
    return acc;
  }, []);

  res.status(200).json({
    statusCode: 200,
    message: "Foods retrieved successfully",
    foodData: groupedFoods,
  });
});

// Update food status
const updateFoodStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const webID = req.user.webID;

  if (typeof status !== "boolean") {
    return res.status(200).json({
      statusCode: 200,
      message: "Status must be a boolean",
    });
  }

  const food = await Food.findOneAndUpdate(
    { _id: id, webID },
    { status },
    { new: true }
  ).select("-webID -__v");

  if (!food) {
    return res.status(200).json({
      statusCode: 200,
      message: "Food not found or not authorized",
    });
  }

  res.status(200).json({
    statusCode: 200,
    message: "Food status updated successfully",
    food,
  });
});

// Update food details
const updateFood = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const webID = req.user.webID;
  const updates = req.body;

  const food = await Food.findOneAndUpdate(
    { _id: id, webID },
    updates,
    { new: true }
  ).select("-webID -__v");

  if (!food) {
    return res.status(200).json({
      statusCode: 200,
      message: "Food not found or not authorized",
    });
  }

  res.status(200).json({
    statusCode: 200,
    message: "Food updated successfully",
    food,
  });
});

// Delete a food item
const deleteFood = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const webID = req.user.webID;

  const food = await Food.findOneAndDelete({ _id: id, webID });

  if (!food) {
    return res.status(200).json({
      statusCode: 200,
      message: "Food not found or not authorized",
    });
  }

  res.status(200).json({
    statusCode: 200,
    message: "Food deleted successfully",
  });
});

module.exports = {
  createFood,
  getFoods,
  getFoodsByOwner,
  getFoodsByWebID,
  updateFoodStatus,
  updateFood,
  deleteFood,
};
