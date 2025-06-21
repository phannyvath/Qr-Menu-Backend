// controllers/featureController.js
const Feature = require("../models/Feature");

// @desc    Get all features
// @route   GET /api/features
// @access  Public
const getAllFeatures = async (req, res) => {
  try {
    const features = await Feature.find();
    res.status(200).json({
      success: true,
      message: "Features retrieved successfully",
      data: features,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch features",
    });
  }
};

// @desc    Create a new feature
// @route   POST /api/features
// @access  Private (Authenticated users only)
const createFeature = async (req, res) => {
  try {
    const { jobFeature, supplierFeature } = req.body;

    // Ensure at least one feature is provided
    if (!jobFeature && !supplierFeature) {
      return res.status(400).json({
        success: false,
        message: "Either jobFeature or supplierFeature is required",
      });
    }

    // Validate required nested properties
    const requiredProps = ['imageUrl', 'description', 'applyLink'];
    if (jobFeature) {
      for (const prop of requiredProps) {
        if (!jobFeature[prop]) {
          return res.status(400).json({
            success: false,
            message: `jobFeature.${prop} is required`,
          });
        }
      }
      // Check if a jobFeature already exists
      const existingJobFeature = await Feature.findOne({ "jobFeature": jobFeature });
      if (existingJobFeature) {
        return res.status(400).json({
          success: false,
          message: "Job feature already exists, cannot post again",
        });
      }
    }

    if (supplierFeature) {
      for (const prop of requiredProps) {
        if (!supplierFeature[prop]) {
          return res.status(400).json({
            success: false,
            message: `supplierFeature.${prop} is required`,
          });
        }
      }
      // Check if a supplierFeature already exists
      const existingSupplierFeature = await Feature.findOne({ "supplierFeature": supplierFeature });
      if (existingSupplierFeature) {
        return res.status(400).json({
          success: false,
          message: "Supplier feature already exists, cannot post again",
        });
      }
    }

    // Create a new feature
    const newFeature = new Feature({
      jobFeature,
      supplierFeature,
    });

    // Save the new feature to the database
    await newFeature.save();

    res.status(200).json({
      success: true,
      message: "Feature created successfully",
      data: newFeature,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create feature",
    });
  }
};

// @desc    Update a feature by ID
// @route   PUT /api/features/:id
// @access  Private (Authenticated users only)
const updateFeature = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedFeature = await Feature.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedFeature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found or could not be updated",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feature updated successfully",
      data: updatedFeature,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update feature",
    });
  }
};

// @desc    Delete a feature by ID
// @route   DELETE /api/features/:id
// @access  Private (Authenticated users only)
const deleteFeature = async (req, res) => {
  try {
    const { id } = req.params;

    const feature = await Feature.findByIdAndDelete(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found or could not be deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,   
      message: "Failed to delete feature",
    });
  }
};

// Image upload controller
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Return the file path or URL
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, fileUrl });
};

module.exports = {
  getAllFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  uploadImage,
};      
