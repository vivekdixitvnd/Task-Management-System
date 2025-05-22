import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/api"

const initialState = {
  tasks: [],
  task: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  filters: {
    status: "",
    priority: "",
    dueDate: "",
    assignedTo: "",
  },
}

// Get all tasks with filters
export const getTasks = createAsyncThunk(
  "tasks/getTasks",
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      let queryString = `page=${page}&limit=${limit}`

      if (filters.status) queryString += `&status=${filters.status}`
      if (filters.priority) queryString += `&priority=${filters.priority}`
      if (filters.dueDate) queryString += `&dueDate=${filters.dueDate}`
      if (filters.assignedTo) queryString += `&assignedTo=${filters.assignedTo}`

      const response = await api.get(`/tasks?${queryString}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.message || "Failed to fetch tasks")
    }
  },
)

// Get task by ID
export const getTaskById = createAsyncThunk("tasks/getTaskById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Failed to fetch task")
  }
})

// Create task
export const createTask = createAsyncThunk("tasks/createTask", async (taskData, { rejectWithValue }) => {
  try {
    // Handle file uploads
    const formData = new FormData()

    // Add task data
    Object.keys(taskData).forEach((key) => {
      if (key !== "documents") {
        formData.append(key, taskData[key])
      }
    })

    // Add documents if any
    if (taskData.documents && taskData.documents.length > 0) {
      for (let i = 0; i < taskData.documents.length; i++) {
        formData.append("documents", taskData.documents[i])
      }
    }

    const response = await api.post("/tasks", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Failed to create task")
  }
})

// Update task
export const updateTask = createAsyncThunk("tasks/updateTask", async ({ id, taskData }, { rejectWithValue }) => {
  try {
    // Handle file uploads
    const formData = new FormData()

    // Add task data
    Object.keys(taskData).forEach((key) => {
      if (key !== "documents") {
        formData.append(key, taskData[key])
      }
    })

    // Add documents if any
    if (taskData.documents && taskData.documents.length > 0) {
      for (let i = 0; i < taskData.documents.length; i++) {
        formData.append("documents", taskData.documents[i])
      }
    }

    const response = await api.put(`/tasks/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Failed to update task")
  }
})

// Delete task
export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/tasks/${id}`)
    return id
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Failed to delete task")
  }
})

// Download document
export const downloadDocument = createAsyncThunk(
  "tasks/downloadDocument",
  async ({ taskId, documentId, documentName }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${taskId}/documents/${documentId}`, {
        responseType: "blob",
      })

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]))

      // Create a temporary link and trigger download
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", documentName)
      document.body.appendChild(link)
      link.click()

      // Clean up
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true }
    } catch (error) {
      return rejectWithValue("Failed to download document")
    }
  },
)

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: "",
        priority: "",
        dueDate: "",
        assignedTo: "",
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all tasks
      .addCase(getTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload.tasks
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get task by ID
      .addCase(getTaskById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.loading = false
        state.task = action.payload
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false
        state.tasks.unshift(action.payload)
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = state.tasks.map((task) => (task._id === action.payload._id ? action.payload : task))
        if (state.task && state.task._id === action.payload._id) {
          state.task = action.payload
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = state.tasks.filter((task) => task._id !== action.payload)
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Download document
      .addCase(downloadDocument.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearTaskError, setFilters, clearFilters } = taskSlice.actions
export default taskSlice.reducer
