const asyncHandler = require("express-async-handler");
const Food = require("../models/foodModel");

// Create new food item
const createFood = asyncHandler(async (req, res) => {
  const { foodName, description, price, category, imgUrl, status } = req.body;
  const webID = req.user.webID;

  if (!foodName || !description || !price || !category || !imgUrl) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const food = await Food.create({
      foodName,
      description,
      price,
      category,
      imgUrl,
      webID,
      status, // Add status
    });

    const foodResponse = food.toObject();
    delete foodResponse.webID;
    delete foodResponse.__v;

    res.status(200).json({
      success: true,
      message: "Food created successfully",
      food: foodResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create food",
    });
  }
});

// Get all foods
const getFoods = asyncHandler(async (req, res) => {
  try {
    const foods = await Food.find().select('-webID -__v');
    res.status(200).json({
      success: true,
      message: "Foods retrieved successfully",
      foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve foods",
    });
  }
});

// Get foods by owner
const getFoodsByOwner = asyncHandler(async (req, res) => {
  const webID = req.user.webID;

  try {
    const foods = await Food.find({ webID }).select("-webID -__v");

    if (!foods.length) {
      return res.status(404).json({
        success: false,
        message: "No foods found for this user",
        foods: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Foods retrieved successfully",
      foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve foods",
    });
  }
});

// Get foods by category
const getFoodsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const webID = req.user.webID;

  try {
    let foods = await Food.find({
      webID,
      ...(category && { category }),
    }).select("-webID -__v");

    if (!foods.length) {
      return res.status(404).json({
        success: false,
        message: "No foods found",
        foodData: [],
      });
    }

    const groupedFoods = foods.reduce((acc, food) => {
      let categoryGroup = acc.find((group) => group.category === food.category);
      if (!categoryGroup) {
        categoryGroup = {
          id: acc.length + 1,
          category: food.category,
          items: [],
        };
        acc.push(categoryGroup);
      }
      categoryGroup.items.push({
        id: food._id,
        name: food.foodName,
        description: food.description,
        price: food.price,
        image: food.imgUrl,
      });
      return acc;
    }, []);

    res.status(200).json({
      success: true,
      message: "Foods retrieved successfully",
      foodData: groupedFoods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve foods",
      foodData: [],
    });
  }
});

// Update food item (including status)
const updateFood = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const webID = req.user.webID;

  try {
    const food = await Food.findOneAndUpdate(
      { _id: id, webID },
      req.body, // This will include the updated status
      { new: true }
    ).select("-webID -__v");

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food updated successfully",
      food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update food",
    });
  }
});

// Delete food item
const deleteFood = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const webID = req.user.webID;

  try {
    const food = await Food.findOneAndDelete({ _id: id, webID });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete food",
    });
  }
});

// Update food status
const updateFoodStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const webID = req.user.webID;

  if (typeof status !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Status must be a boolean",
    });
  }

  try {
    const food = await Food.findOneAndUpdate(
      { _id: id, webID },
      { status },
      { new: true }
    ).select("-webID -__v");

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food status updated successfully",
      food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update food status",
    });
  }
});

module.exports = {
  createFood,
  getFoods,
  getFoodsByOwner,
  getFoodsByCategory,
  updateFood,
  deleteFood,
  updateFoodStatus,
};
