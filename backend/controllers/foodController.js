const asyncHandler = require("express-async-handler");
const Food = require("../models/foodModel");
const Category = require("../models/categoryModel");
const User = require("../models/User");

// Create a new food item
const createFood = asyncHandler(async (req, res) => {
  const { foodName, description, price, category, imgUrl, status } = req.body;
  const webID = req.user.webID;

  if (!foodName || !description || !price || !category || !imgUrl) {
    return res.status(200).json({
      statusCode: 201,
      message: "Please provide all required fields",
    });
  }

  const categoryExists = await Category.findOne({ categoryName: category, webID });
  if (!categoryExists) {
    return res.status(200).json({
      statusCode: 201,
      message: "Invalid category. Please select a valid one from the list.",
    });
  }

  const food = await Food.create({
    foodName,
    description,
    price,
    category,
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

// Get foods by authenticated user
const getFoodsByOwner = asyncHandler(async (req, res) => {
  const webID = req.user.webID;
  const foods = await Food.find({ webID }).select("-webID -__v");

  res.status(200).json({
    statusCode: 200,
    message: foods.length ? "Foods retrieved successfully" : "No foods found for this user",
    foods,
  });
});

// Get foods by webID
const getFoodsByWebID = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(200).json({
      statusCode: 201,
      message: "username is required",
      foodData: [],
    });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(200).json({
      statusCode: 201,
      message: "User not found",
      foodData: [],
    });
  }
  const resolvedWebId = user.webID;

  const foods = await Food.find({ webID: resolvedWebId, status: true }).select("-webID -__v");

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

// Update food (by payload)
const updateFood = asyncHandler(async (req, res) => {
  const { foodId, ...updates } = req.body;
  const webID = req.user.webID;

  if (!foodId) {
    return res.status(200).json({
      statusCode: 201,
      message: "foodId is required",
    });
  }

  const food = await Food.findOneAndUpdate({ _id: foodId, webID }, updates, { new: true }).select("-webID -__v");

  if (!food) {
    return res.status(200).json({
      statusCode: 201,
      message: "Food not found or not authorized",
    });
  }

  res.status(200).json({
    statusCode: 200,
    message: "Food updated successfully",
    food,
  });
});

// Update food status (by payload)
const updateFoodStatus = asyncHandler(async (req, res) => {
  const { foodId, status } = req.body;
  const webID = req.user.webID;

  if (!foodId) {
    return res.status(200).json({
      statusCode: 201,
      message: "foodId is required",
    });
  }

  if (typeof status !== "boolean") {
    return res.status(200).json({
      statusCode: 201,
      message: "Status must be a boolean",
    });
  }

  const food = await Food.findOneAndUpdate({ _id: foodId, webID }, { status }, { new: true }).select("-webID -__v");

  if (!food) {
    return res.status(200).json({
      statusCode: 201,
      message: "Food not found or not authorized",
    });
  }

  res.status(200).json({
    statusCode: 200,
    message: "Food status updated successfully",
    food,
  });
});

// Delete food (by payload)
const deleteFood = asyncHandler(async (req, res) => {
  const { foodId } = req.body;
  const webID = req.user.webID;

  if (!foodId) {
    return res.status(200).json({
      statusCode: 201,
      message: "foodId is required",
    });
  }

  const food = await Food.findOneAndDelete({ _id: foodId, webID });

  if (!food) {
    return res.status(200).json({
      statusCode: 201,
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
  updateFood,
  updateFoodStatus,
  deleteFood,
};
