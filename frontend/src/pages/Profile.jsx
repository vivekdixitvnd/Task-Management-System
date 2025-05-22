"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateProfile, clearError } from "../redux/slices/authSlice"
import Alert from "../components/Alert"
import { User } from "react-feather"

const Profile = () => {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null })
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format"
    }

    // Password validation only if user is trying to change password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = "Current password is required to set a new password"
      }

      if (formData.newPassword.length < 6) {
        errors.newPassword = "Password must be at least 6 characters"
      }

      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match"
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Clear previous messages
    setSuccessMessage("")

    // Validate form
    const validation = validateForm()

    if (!validation.isValid) {
      setFormErrors(validation.errors)
      return
    }

    // Prepare data for submission
    const updateData = {
      name: formData.name,
      email: formData.email,
    }

    // Add password data if user is changing password
    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword
      updateData.newPassword = formData.newPassword
    }

    dispatch(updateProfile(updateData))
      .unwrap()
      .then(() => {
        setSuccessMessage("Profile updated successfully")
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      })
      .catch(() => {
        // Error is handled by the reducer
      })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {error && <Alert type="danger" message={error} onClose={() => dispatch(clearError())} />}

      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage("")} />}

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs mt-1">
              {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="block mb-1 font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.name && <div className="text-red-500 mt-1 text-sm">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.email && <div className="text-red-500 mt-1 text-sm">{formErrors.email}</div>}
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-4">Change Password</h3>

          <div className="form-group">
            <label htmlFor="currentPassword" className="block mb-1 font-medium">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              className="form-control"
              value={formData.currentPassword}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.currentPassword && (
              <div className="text-red-500 mt-1 text-sm">{formErrors.currentPassword}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="block mb-1 font-medium">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="form-control"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.newPassword && <div className="text-red-500 mt-1 text-sm">{formErrors.newPassword}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="block mb-1 font-medium">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.confirmPassword && (
              <div className="text-red-500 mt-1 text-sm">{formErrors.confirmPassword}</div>
            )}
          </div>

          <div className="mt-6">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
