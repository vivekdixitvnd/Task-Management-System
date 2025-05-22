import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import userReducer from "./slices/userSlice"
import taskReducer from "./slices/taskSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    tasks: taskReducer,
  },
})
