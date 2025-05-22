import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/api"

const initialState = {
  users: [],
  user: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
}

// Get all users
export const getUsers = createAsyncThunk("users/getUsers", async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
  try {
    const response = await api.get(`/users?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Failed to fetch users")
  }
})

// Get user by ID
export const getUserById = createAsyncThunk("users/getUserById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/users/${id}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Failed to fetch user")
  }
})

// Create user (admin only)
export const createUser = createAsyncThunk("users/createUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post("/users", userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Failed to create user")
  }
})

// Update user
export const updateUser = createAsyncThunk("users/updateUser", async ({ id, userData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Failed to update user")
  }
})

// Delete user
export const deleteUser = createAsyncThunk("users/deleteUser", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/users/${id}`)
    return id
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Failed to delete user")
  }
})

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.users
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get user by ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        state.users.push(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        state.users = state.users.map((user) => (user._id === action.payload._id ? action.payload : user))
        if (state.user && state.user._id === action.payload._id) {
          state.user = action.payload
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false
        state.users = state.users.filter((user) => user._id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearUserError } = userSlice.actions
export default userSlice.reducer
