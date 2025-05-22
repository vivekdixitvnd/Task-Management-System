"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { login, clearError } from "../redux/slices/authSlice"
import { validateLoginForm } from "../utils/validation"
import Alert from "../components/Alert"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    const validation = validateLoginForm(formData)

    if (!validation.isValid) {
      setFormErrors(validation.errors)
      return
    }

    // Dispatch login action
    dispatch(login(formData))
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">Login to TaskManager</h1>

      {error && <Alert type="danger" message={error} onClose={() => dispatch(clearError())} />}

      <form onSubmit={handleSubmit} className="auth-form">
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

        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <Link to="/register" className="auth-link">
        Don't have an account? Register
      </Link>
    </div>
  )
}

export default Login
