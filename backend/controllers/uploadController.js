const asyncHandler = require("express-async-handler");

// Image upload controller
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No file uploaded' 
    });
  }

  // Return the file URL
  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.status(200).json({ 
    success: true, 
    fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  });
});

module.exports = {
  uploadImage,
}; 