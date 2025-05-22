"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getUsers, createUser, updateUser, deleteUser, clearUserError } from "../redux/slices/userSlice"
import Modal from "../components/Modal"
import UserForm from "../components/UserForm"
import Pagination from "../components/Pagination"
import Alert from "../components/Alert"
import { Plus, Edit, Trash2, User } from "react-feather"

const UserManagement = () => {
  const dispatch = useDispatch()
  const { users, loading, error, totalPages, currentPage } = useSelector((state) => state.users)
  const { user: currentUser } = useSelector((state) => state.auth)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [alert, setAlert] = useState(null)

  // Load users on mount
  useEffect(() => {
    dispatch(getUsers({ page: 1 }))
  }, [dispatch])

  const handlePageChange = (page) => {
    dispatch(getUsers({ page }))
  }

  const handleCreateUser = (userData) => {
    dispatch(createUser(userData))
      .unwrap()
      .then(() => {
        setIsCreateModalOpen(false)
        setAlert({
          type: "success",
          message: "User created successfully",
        })
        dispatch(getUsers({ page: 1 }))
      })
      .catch(() => {
        // Error is handled by the reducer
      })
  }

  const handleEditUser = (userData) => {
    dispatch(updateUser({ id: selectedUser._id, userData }))
      .unwrap()
      .then(() => {
        setIsEditModalOpen(false)
        setAlert({
          type: "success",
          message: "User updated successfully",
        })
        dispatch(getUsers({ page: currentPage }))
      })
      .catch(() => {
        // Error is handled by the reducer
      })
  }

  const handleDeleteUser = () => {
    dispatch(deleteUser(selectedUser._id))
      .unwrap()
      .then(() => {
        setIsDeleteModalOpen(false)
        setAlert({
          type: "success",
          message: "User deleted successfully",
        })
        dispatch(getUsers({ page: currentPage }))
      })
      .catch(() => {
        // Error is handled by the reducer
        setIsDeleteModalOpen(false)
      })
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} />
          <span>New User</span>
        </button>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => dispatch(clearUserError())} />}

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found. Create a new user to get started.</p>
        </div>
      ) : (
        <div className="mt-4">
          {users.map((user) => (
            <div key={user._id} className="user-card">
              <div className="user-info">
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <div className="user-details">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs mt-1">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>

              <div className="user-actions">
                <button
                  className="btn btn-sm btn-secondary flex items-center gap-1"
                  onClick={() => openEditModal(user)}
                >
                  <Edit size={16} />
                  <span className="hidden md:inline">Edit</span>
                </button>

                {/* Prevent deleting yourself */}
                {currentUser._id !== user._id && (
                  <button
                    className="btn btn-sm btn-danger flex items-center gap-1"
                    onClick={() => openDeleteModal(user)}
                  >
                    <Trash2 size={16} />
                    <span className="hidden md:inline">Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New User">
        <UserForm onSubmit={handleCreateUser} buttonText="Create User" />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
        {selectedUser && <UserForm user={selectedUser} onSubmit={handleEditUser} buttonText="Update User" />}
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete User">
        <div>
          <p>
            Are you sure you want to delete user <strong>{selectedUser?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteUser}>
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UserManagement
