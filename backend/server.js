const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const dotenv = require("dotenv")
const morgan = require("morgan")
const fs = require("fs")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const taskRoutes = require("./routes/tasks")

// Initialize express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, path) => {
    // Set appropriate headers for PDF files
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}))

// Test endpoint for PDF download
app.get("/api/test-pdf/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);
  
  console.log(`Test PDF endpoint: Attempting to serve ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Test PDF endpoint: File not found at ${filePath}`);
    return res.status(404).send("File not found");
  }
  
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Test PDF endpoint: Download error:", err);
      if (!res.headersSent) {
        return res.status(500).send("Error downloading file");
      }
    }
  });
});

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tasks", taskRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: 'taskmanager'
  })
  .then(() => {
    console.log("MongoDB Connected to database: taskmanager")

    // Start server
    const PORT = process.env.PORT || 5001
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message)
    process.exit(1)
  })
