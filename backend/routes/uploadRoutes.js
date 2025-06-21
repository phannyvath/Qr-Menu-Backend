const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImage, getStorageInfo } = require("../controllers/uploadController");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure directory exists before saving
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Clean filename to avoid special characters
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    cb(null, `${timestamp}-${cleanName}`);
  }
});

const upload = multer({ storage });

// Image upload route
router.post('/image', upload.single('image'), uploadImage);

// Get storage information route
router.get('/storage', getStorageInfo);

module.exports = router; 