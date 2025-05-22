const User = require("../models/User")
const Task = require("../models/Task")
const bcrypt = require("bcryptjs")

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit

    const total = await User.countDocuments()
    const users = await User.find().sort({ createdAt: -1 }).skip(startIndex).limit(limit)

    res.status(200).json({
      success: true,
      count: users.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      users,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    })

    res.status(201).json({
      success: true,
      data: user,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Build update object
    const updateFields = {}
    if (name) updateFields.name = name
    if (email) updateFields.email = email
    if (role) updateFields.role = role

    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateFields.password = await bcrypt.hash(password, salt)
    }

    // Update user
    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if user has assigned tasks
    const assignedTasks = await Task.countDocuments({ assignedTo: req.params.id })

    if (assignedTasks > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user with assigned tasks. Reassign tasks first.",
      })
    }

    // Delete user
    await user.remove()

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

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body

    // Get current user
    const user = await User.findById(req.user.id).select("+password")

    // Build update object
    const updateFields = {}
    if (name) updateFields.name = name
    if (email) updateFields.email = email

    // If changing password
    if (currentPassword && newPassword) {
      // Verify current password
      const isMatch = await user.matchPassword(currentPassword)

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        })
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10)
      updateFields.password = await bcrypt.hash(newPassword, salt)
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true, runValidators: true })

    res.status(200).json({
      success: true,
      data: updatedUser,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}
