import { NavLink } from "react-router-dom"
import { useSelector } from "react-redux"
import { Home, Users, User } from "react-feather"

const Sidebar = ({ isOpen }) => {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>
        </li>

        {user && user.role === "admin" && (
          <li className="sidebar-item">
            <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <Users size={18} />
              <span>User Management</span>
            </NavLink>
          </li>
        )}

        <li className="sidebar-item">
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <User size={18} />
            <span>Profile</span>
          </NavLink>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar
