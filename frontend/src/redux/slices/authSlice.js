import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/api"
import { setAuthToken } from "../../utils/api"

// Load user from localStorage
const user = JSON.parse(localStorage.getItem("user"))
const token = localStorage.getItem("token")

if (token) {
  setAuthToken(token)
}

const initialState = {
  token: token || null,
  user: user || null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
}

// Register user
export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/register", userData)
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("user", JSON.stringify(response.data.user))
    setAuthToken(response.data.token)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Registration failed")
  }
})

// Login user
export const login = createAsyncThunk("auth/login", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/login", userData)
    const { token, user } = response.data
    
    // Set token in localStorage and API headers
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    setAuthToken(token)
    
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Login failed")
  }
})

// Logout user
export const logout = createAsyncThunk("auth/logout", async () => {
  // Clear token from localStorage and API headers
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  setAuthToken(null)
})

// Update profile
export const updateProfile = createAsyncThunk("auth/updateProfile", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.put("/users/profile", userData)
    localStorage.setItem("user", JSON.stringify(response.data))
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Profile update failed")
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null
        state.user = null
        state.isAuthenticated = false
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
