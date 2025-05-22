import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

const AdminRoute = () => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth)

  // If still loading, show nothing
  if (loading) {
    return null
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // If not admin, redirect to dashboard
  if (user && user.role !== "admin") {
    return <Navigate to="/dashboard" />
  }

  // If admin, render the child routes
  return <Outlet />
}

export default AdminRoute
