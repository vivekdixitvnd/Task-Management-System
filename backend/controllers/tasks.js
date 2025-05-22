const Task = require("../models/Task")
const User = require("../models/User")
const fs = require("fs")
const path = require("path")

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit

    // Build query
    const query = {}

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status
    }

    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority
    }

    // Filter by due date
    if (req.query.dueDate) {
      const date = new Date(req.query.dueDate)
      date.setHours(0, 0, 0, 0)
      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)

      query.dueDate = {
        $gte: date,
        $lt: nextDay,
      }
    }

    // Filter by assigned user
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo
    }

    // If not admin, only show tasks assigned to or created by the user
    if (req.user.role !== "admin") {
      query.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }]
    }

    // Count total tasks matching query
    const total = await Task.countDocuments(query)

    // Get tasks
    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)

    res.status(200).json({
      success: true,
      count: tasks.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      tasks,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    // Check if user is authorized to view this task
    if (
      req.user.role !== "admin" &&
      task.assignedTo._id.toString() !== req.user.id &&
      task.createdBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this task",
      })
    }

    res.status(200).json({
      success: true,
      data: task,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body

    // Check if assigned user exists
    const user = await User.findById(assignedTo)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found",
      })
    }

    // Create task
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user.id,
    })

    // Add documents if any
    if (req.files && req.files.length > 0) {
      task.documents = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }))
    }

    await task.save()

    // Populate user details
    await task.populate("assignedTo", "name email")
    await task.populate("createdBy", "name email")

    res.status(201).json({
      success: true,
      data: task,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    // Get task
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    // Check if user is authorized to update this task
    if (
      req.user.role !== "admin" &&
      task.assignedTo.toString() !== req.user.id &&
      task.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      })
    }

    // Check if assigned user exists
    if (req.body.assignedTo) {
      const user = await User.findById(req.body.assignedTo)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found",
        })
      }
    }

    // Update task fields
    const { title, description, status, priority, dueDate, assignedTo, existingDocuments } = req.body

    if (title) task.title = title
    if (description) task.description = description
    if (status) task.status = status
    if (priority) task.priority = priority
    if (dueDate) task.dueDate = dueDate
    if (assignedTo) task.assignedTo = assignedTo

    // Handle documents
    if (existingDocuments) {
      // Convert to array if it's a string
      const existingDocsArray = Array.isArray(existingDocuments) ? existingDocuments : [existingDocuments]

      // Keep only the documents that are in the existingDocuments array
      task.documents = task.documents.filter((doc) => existingDocsArray.includes(doc._id.toString()))
    } else if (existingDocuments === undefined) {
      // If existingDocuments is not provided, keep all existing documents
    } else {
      // If existingDocuments is provided as empty, remove all documents
      task.documents = []
    }

    // Add new documents if any
    if (req.files && req.files.length > 0) {
      const newDocuments = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }))

      task.documents = [...task.documents, ...newDocuments]
    }

    // Save task
    await task.save()

    // Populate user details
    await task.populate("assignedTo", "name email")
    await task.populate("createdBy", "name email")

    res.status(200).json({
      success: true,
      data: task,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    // Get task
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    // Check if user is authorized to delete this task
    if (req.user.role !== "admin" && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      })
    }

    // Delete associated documents
    if (task.documents && task.documents.length > 0) {
      task.documents.forEach((doc) => {
        const filePath = path.join(__dirname, "..", doc.path)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
    }

    // Delete task
    await task.remove()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Download document
// @route   GET /api/tasks/:id/documents/:documentId
// @access  Private
exports.downloadDocument = async (req, res) => {
  try {
    // Get task
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
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
        message: "Not authorized to access this task",
      })
    }

    // Find document
    const document = task.documents.id(req.params.documentId)

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      })
    }

    // Send file
    const filePath = path.join(__dirname, "..", document.path)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    res.download(filePath, document.originalName)
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}
