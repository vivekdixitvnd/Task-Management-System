"use client"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "../redux/slices/authSlice"
import { Menu, User, LogOut } from "react-feather"

const Navbar = ({ toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-gray-600 focus:outline-none">
            <Menu size={24} />
          </button>
          <Link to="/dashboard" className="navbar-brand">
            Task Management System
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/profile" className="btn btn-sm" title="Profile">
                <User size={18} />
              </Link>
              <button onClick={handleLogout} className="btn btn-sm" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
