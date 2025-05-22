"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { register, clearError } from "../redux/slices/authSlice"
import { validateRegisterForm } from "../utils/validation"
import Alert from "../components/Alert"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [formErrors, setFormErrors] = useState({})

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    const validation = validateRegisterForm(formData)

    if (!validation.isValid) {
      setFormErrors(validation.errors)
      return
    }

    // Dispatch register action
    dispatch(register(formData))
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">Create an Account</h1>

      {error && <Alert type="danger" message={error} onClose={() => dispatch(clearError())} />}

      <form onSubmit={handleSubmit} className="auth-form">
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

        <div className="form-group">
          <label htmlFor="password" className="block mb-1 font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          {formErrors.password && <div className="text-red-500 mt-1 text-sm">{formErrors.password}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="block mb-1 font-medium">
            Confirm Password
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
          {formErrors.confirmPassword && <div className="text-red-500 mt-1 text-sm">{formErrors.confirmPassword}</div>}
        </div>

        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <Link to="/login" className="auth-link">
        Already have an account? Login
      </Link>
    </div>
  )
}

export default Register
