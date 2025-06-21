const asyncHandler = require("express-async-handler");
const fs = require('fs');
const path = require('path');

// Image upload controller
const uploadImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Verify file exists on disk
    if (!fs.existsSync(req.file.path)) {
      return res.status(500).json({ 
        success: false, 
        message: 'File was not saved properly' 
      });
    }

    // Return the file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({ 
      success: true,
      statusCode: 200,
      message: "Image uploaded successfully",
      data: {
        fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        storagePath: req.file.path,
        accessUrl: `${req.protocol}://${req.get('host')}${fileUrl}`
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Get storage information and list uploaded files
const getStorageInfo = asyncHandler(async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Check if directory exists
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Uploads directory does not exist yet',
        data: {
          directory: uploadsDir,
          exists: false,
          fileCount: 0,
          totalSize: 0,
          files: []
        }
      });
    }

    // Get all files in the uploads directory
    const files = fs.readdirSync(uploadsDir);
    const fileInfo = [];
    let totalSize = 0;

    files.forEach(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      const fileUrl = `/uploads/${filename}`;
      
      fileInfo.push({
        filename,
        originalName: filename.replace(/^\d+_/, ''), // Remove timestamp prefix
        size: stats.size,
        sizeFormatted: formatFileSize(stats.size),
        uploadDate: stats.birthtime,
        accessUrl: `${req.protocol}://${req.get('host')}${fileUrl}`,
        filePath
      });
      
      totalSize += stats.size;
    });

    // Sort files by upload date (newest first)
    fileInfo.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Storage information retrieved successfully',
      data: {
        directory: uploadsDir,
        exists: true,
        fileCount: files.length,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        files: fileInfo
      }
    });
  } catch (error) {
    console.error('Storage info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving storage information'
    });
  }
});

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  uploadImage,
  getStorageInfo,
}; 