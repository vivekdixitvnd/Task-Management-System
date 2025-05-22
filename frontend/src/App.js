import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./redux/store"
import PrivateRoute from "./components/PrivateRoute"
import AdminRoute from "./components/AdminRoute"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import TaskDetails from "./pages/TaskDetails"
import UserManagement from "./pages/UserManagement"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import Layout from "./components/Layout"
import "./App.css"

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks/:id" element={<TaskDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/users" element={<UserManagement />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
