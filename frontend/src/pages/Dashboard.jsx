"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getTasks, clearTaskError, setFilters, clearFilters, createTask } from "../redux/slices/taskSlice"
import { getUsers } from "../redux/slices/userSlice"
import TaskCard from "../components/TaskCard"
import Modal from "../components/Modal"
import TaskForm from "../components/TaskForm"
import Pagination from "../components/Pagination"
import Alert from "../components/Alert"
import { Plus, Filter, RefreshCw } from "react-feather"

const Dashboard = () => {
  const dispatch = useDispatch()
  const { tasks, loading, error, totalPages, currentPage, filters } = useSelector((state) => state.tasks)
  const { users } = useSelector((state) => state.users)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    status: "",
    priority: "",
    dueDate: "",
    assignedTo: "",
  })

  // Load tasks and users on mount
  useEffect(() => {
    dispatch(getTasks({ page: 1, filters }))
    dispatch(getUsers({ limit: 100 }))
  }, [dispatch, filters])

  // Update local filters when redux filters change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handlePageChange = (page) => {
    dispatch(getTasks({ page, filters }))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setLocalFilters({ ...localFilters, [name]: value })
  }

  const applyFilters = () => {
    dispatch(setFilters(localFilters))
  }

  const resetFilters = () => {
    dispatch(clearFilters())
  }

  const handleCreateTask = (taskData) => {
    dispatch(createTask(taskData))
      .unwrap()
      .then(() => {
        setIsModalOpen(false)
        dispatch(getTasks({ page: 1, filters }))
      })
      .catch(() => {
        // Error is handled by the reducer
      })
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="text-2xl font-bold">Tasks Dashboard</h1>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => dispatch(clearTaskError())} />}

      <div className="card mb-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Filter size={18} />
          <span>Filters</span>
        </h2>

        <div className="task-filters">
          <div className="filter-group">
            <label htmlFor="status" className="filter-label">
              Status:
            </label>
            <select
              id="status"
              name="status"
              className="filter-select"
              value={localFilters.status}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priority" className="filter-label">
              Priority:
            </label>
            <select
              id="priority"
              name="priority"
              className="filter-select"
              value={localFilters.priority}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="dueDate" className="filter-label">
              Due Date:
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              className="filter-select"
              value={localFilters.dueDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="assignedTo" className="filter-label">
              Assigned To:
            </label>
            <select
              id="assignedTo"
              name="assignedTo"
              className="filter-select"
              value={localFilters.assignedTo}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="btn btn-secondary flex items-center gap-1" onClick={resetFilters}>
              <RefreshCw size={14} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tasks found. Create a new task to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <TaskForm onSubmit={handleCreateTask} buttonText="Create Task" />
      </Modal>
    </div>
  )
}

export default Dashboard
