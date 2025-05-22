const express = require("express")
const { getTasks, getTask, createTask, updateTask, deleteTask, downloadDocument } = require("../controllers/tasks")
const { protect } = require("../middleware/auth")
const { uploadDocuments, handleUploadErrors } = require("../middleware/upload")
const path = require("path")
const fs = require("fs")
const crypto = require("crypto")

// Store temporary access tokens with expiration
const temporaryAccessTokens = new Map();

const router = express.Router()

// Protect all routes except public document viewer
router.use(/^(?!\/public-doc\/).*$/, protect)

router.route("/").get(getTasks).post(uploadDocuments, handleUploadErrors, createTask)

router.route("/:id").get(getTask).put(uploadDocuments, handleUploadErrors, updateTask).delete(deleteTask)

router.get("/:id/documents/:documentId", downloadDocument)

// Direct document access route - returns PDF file for viewing
router.get("/:id/preview/:documentId", async (req, res) => {
  try {
    const Task = require("../models/Task")
    
    // Get task
    const task = await Task.findById(req.params.id)
    
    if (!task) {
      return res.status(404).send("Task not found")
    }
    
    // Check if user is authorized to access this task
    if (
      req.user.role !== "admin" &&
      task.assignedTo.toString() !== req.user.id &&
      task.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).send("Not authorized")
    }
    
    // Find document
    const document = task.documents.id(req.params.documentId)
    
    if (!document) {
      return res.status(404).send("Document not found")
    }
    
    // Extract filename from path
    let filename
    if (document.path && document.path.includes('/')) {
      filename = document.path.split('/').pop()
    } else if (document.path && document.path.includes('\\')) {
      filename = document.path.split('\\').pop()
    } else {
      filename = document.filename
    }
    
    // Build file path
    const uploadsDir = path.join(__dirname, '..', 'uploads')
    const filePath = path.join(uploadsDir, filename)
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found at: ${filePath}`)
      return res.status(404).send("File not found on server")
    }
    
    // Set appropriate headers for inline display
    res.setHeader('Content-Type', document.mimetype || 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`)
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  } catch (err) {
    console.error("Error in preview:", err)
    res.status(500).send("Server error")
  }
})

// Create temporary public access to a document (no authentication required)
router.get("/:id/create-preview-token/:documentId", protect, async (req, res) => {
  try {
    const Task = require("../models/Task")
    
    // Get task
    const task = await Task.findById(req.params.id)
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      })
    }
    
    // Check if user is authorized to access this task
    if (
      req.user.role !== "admin" &&
      task.assignedTo.toString() !== req.user.id &&
      task.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this task"
      })
    }
    
    // Find document
    const document = task.documents.id(req.params.documentId)
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      })
    }
    
    // Create a temporary token for this document
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store token with document info (expires in 1 hour)
    temporaryAccessTokens.set(token, {
      taskId: req.params.id,
      documentId: req.params.documentId,
      document: document,
      expires: Date.now() + 3600000 // 1 hour expiration
    });
    
    // Return the token URL
    return res.status(200).json({
      success: true,
      previewUrl: `/tasks/public-doc/${token}`
    });
  } catch (err) {
    console.error("Error creating preview token:", err)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
});

// Public document viewer that doesn't require authentication
router.get("/public-doc/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const tokenData = temporaryAccessTokens.get(token);
    
    // Check if token exists and is not expired
    if (!tokenData || tokenData.expires < Date.now()) {
      if (tokenData) {
        // Clean up expired token
        temporaryAccessTokens.delete(token);
      }
      return res.status(401).send("Access expired or invalid");
    }
    
    // Extract document info
    const document = tokenData.document;
    
    // Extract filename from path
    let filename;
    if (document.path && document.path.includes('/')) {
      filename = document.path.split('/').pop();
    } else if (document.path && document.path.includes('\\')) {
      filename = document.path.split('\\').pop();
    } else {
      filename = document.filename;
    }
    
    // Build file path
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found at: ${filePath}`);
      return res.status(404).send("File not found on server");
    }
    
    // Set appropriate headers for inline display
    res.setHeader('Content-Type', document.mimetype || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error("Error in public document viewer:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router
