const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadImage } = require("../controllers/uploadController");

// Set up multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Image upload route
router.post('/image', upload.single('image'), uploadImage);

module.exports = router; 