// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation (at least 6 characters)
export const isValidPassword = (password) => {
  return password && password.length >= 6
}

// Required field validation
export const isRequired = (value) => {
  return value && value.trim() !== ""
}

// File type validation (PDF only)
export const isPdfFile = (file) => {
  return file && file.type === "application/pdf"
}

// File size validation (max 5MB)
export const isValidFileSize = (file) => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  return file && file.size <= maxSize
}

// Date validation (must be in the future)
export const isFutureDate = (date) => {
  if (!date) return false
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selectedDate >= today
}

// Form validation for login
export const validateLoginForm = (formData) => {
  const errors = {}

  if (!isRequired(formData.email)) {
    errors.email = "Email is required"
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Invalid email format"
  }

  if (!isRequired(formData.password)) {
    errors.password = "Password is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Form validation for registration
export const validateRegisterForm = (formData) => {
  const errors = {}

  if (!isRequired(formData.name)) {
    errors.name = "Name is required"
  }

  if (!isRequired(formData.email)) {
    errors.email = "Email is required"
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Invalid email format"
  }

  if (!isRequired(formData.password)) {
    errors.password = "Password is required"
  } else if (!isValidPassword(formData.password)) {
    errors.password = "Password must be at least 6 characters"
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Form validation for task creation/update
export const validateTaskForm = (formData) => {
  const errors = {}

  if (!isRequired(formData.title)) {
    errors.title = "Title is required"
  }

  if (!isRequired(formData.description)) {
    errors.description = "Description is required"
  }

  if (!isRequired(formData.status)) {
    errors.status = "Status is required"
  }

  if (!isRequired(formData.priority)) {
    errors.priority = "Priority is required"
  }

  if (!isRequired(formData.dueDate)) {
    errors.dueDate = "Due date is required"
  } else if (!isFutureDate(formData.dueDate)) {
    errors.dueDate = "Due date must be in the future"
  }

  if (!isRequired(formData.assignedTo)) {
    errors.assignedTo = "Assignee is required"
  }

  // Validate documents if any
  if (formData.documents && formData.documents.length > 0) {
    const documentErrors = []

    for (let i = 0; i < formData.documents.length; i++) {
      const file = formData.documents[i]

      if (!isPdfFile(file)) {
        documentErrors.push(`File ${i + 1} must be a PDF`)
      } else if (!isValidFileSize(file)) {
        documentErrors.push(`File ${i + 1} exceeds the maximum size of 5MB`)
      }
    }

    if (documentErrors.length > 0) {
      errors.documents = documentErrors
    }

    if (formData.documents.length > 3) {
      errors.documents = [...(errors.documents || []), "Maximum 3 documents allowed"]
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Form validation for user creation/update
export const validateUserForm = (formData) => {
  const errors = {}

  if (!isRequired(formData.name)) {
    errors.name = "Name is required"
  }

  if (!isRequired(formData.email)) {
    errors.email = "Email is required"
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Invalid email format"
  }

  if (formData.password && !isValidPassword(formData.password)) {
    errors.password = "Password must be at least 6 characters"
  }

  if (!isRequired(formData.role)) {
    errors.role = "Role is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
