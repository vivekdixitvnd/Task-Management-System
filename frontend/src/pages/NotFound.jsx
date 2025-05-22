import { Link } from "react-router-dom"
import { Home } from "react-feather"

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <p className="text-gray-500 mb-8 text-center">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/dashboard" className="btn btn-primary flex items-center gap-2">
        <Home size={18} />
        <span>Go to Dashboard</span>
      </Link>
    </div>
  )
}

export default NotFound
