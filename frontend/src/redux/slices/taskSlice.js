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
      console.log(`Attempting to download document: ${documentId} from task: ${taskId}`);
      
      // Try downloading using direct API endpoint first
      try {
        const response = await api.get(`/tasks/${taskId}/documents/${documentId}`, {
          responseType: "blob",
        });
        
        // Check if we got a valid blob response
        if (response.data.size === 0) {
          console.error("Empty response received from server");
          throw new Error("Empty file received");
        }
        
        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));

        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", documentName);
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
        
        return { success: true };
      } catch (error) {
        console.error("Error with primary download method:", error);
        
        // Fall back to the test endpoint if the primary method fails
        console.log("Trying fallback method...");
        
        // Try to extract the filename from the error response
        let filename = documentName;
        if (error.response?.data) {
          // Try to parse the error message to see if it contains the filename
          const errorObj = JSON.parse(JSON.stringify(error.response.data));
          console.log("Error object:", errorObj);
          
          // Try to get the document path from the error message
          if (typeof errorObj === 'string' && errorObj.includes('File not found')) {
            console.log("Document ID might be the filename itself, trying direct access");
            filename = documentId;
          }
        }
        
        // Create a direct link to potentially access the file through the static route
        const link = document.createElement("a");
        link.href = `/api/test-pdf/${filename}`;
        link.setAttribute("download", documentName);
        document.body.appendChild(link);
        console.log("Trying to download with fallback URL:", link.href);
        
        link.click();
        
        // Clean up
        setTimeout(() => {
          link.parentNode.removeChild(link);
        }, 100);
        
        return { success: true, message: "Using fallback download method" };
      }
    } catch (error) {
      console.error("Download error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to download document");
    }
  }
);

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
        // state.task = action.payload
        state.task = action.payload.data || action.payload
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
      .addCase(downloadDocument.pending, (state) => {
        // Set loading indicator for downloads if needed
      })
      .addCase(downloadDocument.fulfilled, (state) => {
        // Clear any previous download errors
        state.error = null;
      })
      .addCase(downloadDocument.rejected, (state, action) => {
        state.error = action.payload || "Failed to download document";
        // Show the error immediately
        alert(`Download failed: ${state.error}`);
      })
  },
})

export const { clearTaskError, setFilters, clearFilters } = taskSlice.actions
export default taskSlice.reducer
