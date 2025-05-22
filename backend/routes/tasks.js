const express = require("express")
const { getTasks, getTask, createTask, updateTask, deleteTask, downloadDocument } = require("../controllers/tasks")
const { protect } = require("../middleware/auth")
const { uploadDocuments, handleUploadErrors } = require("../middleware/upload")

const router = express.Router()

// Protect all routes
router.use(protect)

router.route("/").get(getTasks).post(uploadDocuments, handleUploadErrors, createTask)

router.route("/:id").get(getTask).put(uploadDocuments, handleUploadErrors, updateTask).delete(deleteTask)

router.get("/:id/documents/:documentId", downloadDocument)

module.exports = router
