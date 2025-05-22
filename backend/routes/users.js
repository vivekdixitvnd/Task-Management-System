const express = require("express")
const { getUsers, getUser, createUser, updateUser, deleteUser, updateProfile } = require("../controllers/users")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// Protect all routes
router.use(protect)

// User profile route
router.put("/profile", updateProfile)

// Admin only routes
router.use(authorize("admin"))

router.route("/").get(getUsers).post(createUser)

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser)

module.exports = router
