import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth)

  // If still loading, show nothing
  if (loading) {
    return null
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // If authenticated, render the child routes
  return <Outlet />
}

export default PrivateRoute
