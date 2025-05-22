"use client"

import { useState, useEffect } from "react"
import { validateUserForm } from "../utils/validation"

const UserForm = ({ user, onSubmit, buttonText = "Submit" }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  })
  const [errors, setErrors] = useState({})

  // Populate form if editing a user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "user",
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear error for this field if any
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    const validation = validateUserForm(formData)

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    // If editing and password is empty, remove it from the data
    const submitData = { ...formData }
    if (user && !submitData.password) {
      delete submitData.password
    }

    onSubmit(submitData)
  }

  return (
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
        />
        {errors.name && <div className="text-red-500 mt-1 text-sm">{errors.name}</div>}
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
        />
        {errors.email && <div className="text-red-500 mt-1 text-sm">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="block mb-1 font-medium">
          {user ? "Password (leave blank to keep current)" : "Password"}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <div className="text-red-500 mt-1 text-sm">{errors.password}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="role" className="block mb-1 font-medium">
          Role
        </label>
        <select id="role" name="role" className="form-control" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && <div className="text-red-500 mt-1 text-sm">{errors.role}</div>}
      </div>

      <div className="mt-4">
        <button type="submit" className="btn btn-primary">
          {buttonText}
        </button>
      </div>
    </form>
  )
}

export default UserForm
