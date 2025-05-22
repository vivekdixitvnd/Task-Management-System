const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
  },
})

// Check file type
const fileFilter = (req, file, cb) => {
  // Allow PDF only
  if (file.mimetype === "application/pdf") {
    cb(null, true)
  } else {
    cb(new Error("Only PDF files are allowed"), false)
  }
}

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
})

// Handle document uploads (up to 3)
exports.uploadDocuments = upload.array("documents", 3)

// Error handling middleware for multer
exports.handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB",
      })
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 3",
      })
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }
  next()
}
