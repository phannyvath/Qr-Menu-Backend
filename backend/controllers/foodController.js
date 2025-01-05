// controllers/foodController.js
const asyncHandler = require("express-async-handler");
const Food = require("../models/foodModel");
const User = require("../models/User");

// Create new food
const createFood = asyncHandler(async (req, res) => {
  const { foodName, description, price, category, imgUrl } = req.body;

  // Use the authenticated user's ID (from token) as ownerID
  const ownerID = req.user._id;

  // Check if required fields are provided
  if (!foodName || !description || !price || !category || !imgUrl) {
    return res
      .status(400)
      .json({ message: "All fields are required", status: 400 });
  }

  try {
    // Create food
    const food = await Food.create({
      foodName,
      description,
      price,
      category,
      imgUrl,
      ownerID,
    });

    res.status(200).json({
      message: "Food created successfully",
      status: 200,
      food: {
        foodName: food.foodName,
        description: food.description,
        price: food.price,
        category: food.category,
        imgUrl: food.imgUrl,
        ownerID: food.ownerID,
        _id: food._id,
        createdAt: food.createdAt,
        updatedAt: food.updatedAt,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create food", status: 400 });
  }
});

// Get all foods
const getFoods = asyncHandler(async (req, res) => {
  try {
    const foods = await Food.find().populate("ownerID", "name email");
    res
      .status(200)
      .json({ message: "Foods retrieved successfully", status: 200, foods });
  } catch (error) {
    res.status(400).json({ message: "Failed to retrieve foods", status: 400 });
  }
});

// Get foods by authenticated owner's ID
const getFoodsByOwner = asyncHandler(async (req, res) => {
  try {
    const foods = await Food.find({ ownerID: req.user._id }).populate(
      "ownerID",
      "name email"
    );

    if (!foods.length) {
      return res
        .status(400)
        .json({ message: "No foods found for this user", status: 400 });
    }

    res
      .status(200)
      .json({ message: "Foods retrieved successfully", status: 200, foods });
  } catch (error) {
    res.status(400).json({ message: "Failed to retrieve foods", status: 400 });
  }
});

// Update food
const updateFood = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const food = await Food.findById(id);

    if (!food) {
      return res.status(400).json({ message: "Food not found", status: 400 });
    }

    // Check if the food belongs to the authenticated user
    if (food.ownerID.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Not authorized to update this food", status: 400 });
    }

    // Update the food
    const updatedFood = await Food.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      message: "Food updated successfully",
      status: 200,
      updatedFood,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to update food", status: 400 });
  }
});

// Delete food
const deleteFood = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const food = await Food.findById(id);

    if (!food) {
      return res.status(400).json({ message: "Food not found", status: 400 });
    }

    console.log("Food ownerID:", food.ownerID.toString()); // Log food's ownerID
    console.log("Authenticated user ID:", req.user._id.toString()); // Log authenticated user's _id

    // Check if the food belongs to the authenticated user
    if (food.ownerID.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Not authorized to delete this food", status: 400 });
    }

    // Delete the food using findByIdAndDelete
    await Food.findByIdAndDelete(id);

    res.status(200).json({
      message: "Food deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error(error); // Log any errors
    res.status(400).json({ message: "Failed to delete food", status: 400 });
  }
});

module.exports = {
  createFood,
  getFoods,
  getFoodsByOwner,
  updateFood,
  deleteFood,
};
