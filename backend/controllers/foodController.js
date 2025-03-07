const asyncHandler = require("express-async-handler");
const Food = require("../models/foodModel");
const User = require("../models/User");

// Create new food
const createFood = asyncHandler(async (req, res) => {
  const { foodName, description, price, category, imgUrl } = req.body;

  // Use the authenticated user's webID (from token)
  const webID = req.user.webID;

  // Check if required fields are provided
  if (!foodName || !description || !price || !category || !imgUrl) {
    return res
      .status(400)
      .json({ message: "All fields are required", status: 400 });
  }

  try {
    // Create food with webID
    const food = await Food.create({
      foodName,
      description,
      price,
      category,
      imgUrl,
      webID,
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
        webID: food.webID,
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
    const foods = await Food.find().populate("webID", "name email webID");
    res
      .status(200)
      .json({ message: "Foods retrieved successfully", status: 200, foods });
  } catch (error) {
    res.status(400).json({ message: "Failed to retrieve foods", status: 400 });
  }
});

// Get foods by authenticated user's webID
const getFoodsByOwner = asyncHandler(async (req, res) => {
  try {
    const foods = await Food.find({ webID: req.user.webID }).populate(
      "webID",
      "name email webID"
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

// Get foods by category
const getFoodsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.query;

  try {
    let foods;
    if (category) {
      // Retrieve foods for a specific category
      foods = await Food.find({ category }).select(
        "foodName price imgUrl category webID"
      );
    } else {
      // Retrieve all foods grouped by category
      foods = await Food.find().select("foodName price imgUrl category webID");
    }

    if (!foods.length) {
      return res.status(404).json({
        message: "No foods found for this category",
        status: 404,
      });
    }

    // Group foods by category
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
        price: food.price,
        image: food.imgUrl,
        webID: food.webID,
      });

      return acc;
    }, []);

    res.status(200).json({
      message: "Foods retrieved successfully",
      status: 200,
      foodData: groupedFoods,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to retrieve foods",
      status: 400,
    });
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
    if (food.webID !== req.user.webID) {
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

    // Check if the food belongs to the authenticated user
    if (food.webID !== req.user.webID) {
      return res
        .status(400)
        .json({ message: "Not authorized to delete this food", status: 400 });
    }

    // Delete the food
    await Food.findByIdAndDelete(id);

    res.status(200).json({
      message: "Food deleted successfully",
      status: 200,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete food", status: 400 });
  }
});

module.exports = {
  createFood,
  getFoods,
  getFoodsByOwner,
  getFoodsByCategory,
  updateFood,
  deleteFood,
};
