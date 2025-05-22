"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { getUsers } from "../redux/slices/userSlice"
import { validateTaskForm } from "../utils/validation"
import { X, Upload, Paperclip } from "react-feather"

const TaskForm = ({ task, onSubmit, buttonText = "Submit" }) => {
  const dispatch = useDispatch()
  const { users } = useSelector((state) => state.users)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
    documents: [],
  })
  const [errors, setErrors] = useState({})
  const [selectedFiles, setSelectedFiles] = useState([])
  // Load users on mount
  useEffect(() => {
    dispatch(getUsers({ limit: 100 }))
  }, [dispatch])

  // Populate form if editing a task
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        assignedTo: task.assignedTo ? task.assignedTo._id : "",
        documents: [],
      })

      // Show existing document names
      if (task.documents && task.documents.length > 0) {
        setSelectedFiles(
          task.documents.map((doc) => ({
            name: doc.originalName,
            id: doc._id,
            isExisting: true,
          })),
        )
      }
    }
  }, [task])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear error for this field if any
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)

    // Check if adding these files would exceed the limit of 3
    if (selectedFiles.length + files.length > 3) {
      setErrors({ ...errors, documents: ["Maximum 3 documents allowed"] })
      return
    }

    // Validate files
    const fileErrors = []
    const validFiles = []

    files.forEach((file) => {
      if (file.type !== "application/pdf") {
        fileErrors.push(`${file.name} must be a PDF`)
      } else if (file.size > 5 * 1024 * 1024) {
        // 5MB
        fileErrors.push(`${file.name} exceeds the maximum size of 5MB`)
      } else {
        validFiles.push(file)
        setSelectedFiles((prev) => [...prev, { name: file.name, file }])
      }
    })

    if (fileErrors.length > 0) {
      setErrors({ ...errors, documents: fileErrors })
    } else {
      setFormData({ ...formData, documents: [...formData.documents, ...validFiles] })
      if (errors.documents) {
        setErrors({ ...errors, documents: null })
      }
    }

    // Reset the input
    e.target.value = ""
  }

  const removeFile = (index) => {
    const updatedFiles = [...selectedFiles]
    const removedFile = updatedFiles[index]

    updatedFiles.splice(index, 1)
    setSelectedFiles(updatedFiles)

    // If it's a new file (not an existing one), remove it from formData
    if (!removedFile.isExisting) {
      const updatedFormDocuments = formData.documents.filter((file) => file.name !== removedFile.name)
      setFormData({ ...formData, documents: updatedFormDocuments })
    }

    // Clear document errors if any
    if (errors.documents) {
      setErrors({ ...errors, documents: null })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    const validation = validateTaskForm(formData)

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    // Create a new object with form data and existing document IDs
    const submitData = { ...formData }

    // Add existing document IDs if any
    if (selectedFiles.some((file) => file.isExisting)) {
      submitData.existingDocuments = selectedFiles.filter((file) => file.isExisting).map((file) => file.id)
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title" className="block mb-1 font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className="form-control"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <div className="text-red-500 mt-1 text-sm">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="block mb-1 font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows="4"
          className="form-control"
          value={formData.description}
          onChange={handleChange}
        ></textarea>
        {errors.description && <div className="text-red-500 mt-1 text-sm">{errors.description}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="status" className="block mb-1 font-medium">
            Status
          </label>
          <select id="status" name="status" className="form-control" value={formData.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          {errors.status && <div className="text-red-500 mt-1 text-sm">{errors.status}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="priority" className="block mb-1 font-medium">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className="form-control"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.priority && <div className="text-red-500 mt-1 text-sm">{errors.priority}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="dueDate" className="block mb-1 font-medium">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            className="form-control"
            value={formData.dueDate}
            onChange={handleChange}
          />
          {errors.dueDate && <div className="text-red-500 mt-1 text-sm">{errors.dueDate}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="assignedTo" className="block mb-1 font-medium">
            Assigned To
          </label>
          <select
            id="assignedTo"
            name="assignedTo"
            className="form-control"
            value={formData.assignedTo}
            onChange={handleChange}
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.assignedTo && <div className="text-red-500 mt-1 text-sm">{errors.assignedTo}</div>}
        </div>
      </div>

      <div className="form-group">
        <label className="block mb-1 font-medium">Documents (PDF only, max 3)</label>
        <div className="file-upload">
          <input
            type="file"
            id="documents"
            name="documents"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            className="file-upload-input"
            disabled={selectedFiles.length >= 3}
          />
          <label htmlFor="documents" className="file-upload-btn">
            <Upload size={16} className="mr-2" />
            {selectedFiles.length >= 3 ? "Maximum files reached" : "Choose files"}
          </label>
        </div>

        {errors.documents && (
          <div className="text-red-500 mt-1 text-sm">
            {Array.isArray(errors.documents)
              ? errors.documents.map((err, i) => <div key={i}>{err}</div>)
              : errors.documents}
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="file-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-name">
                  <Paperclip size={14} />
                  <span>{file.name}</span>
                </div>
                <button type="button" onClick={() => removeFile(index)} className="file-remove">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <button type="submit" className="btn btn-primary">
          {buttonText}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
