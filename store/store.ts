// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { loggerMiddleware } from "./looger";
import authReducer from "./slices/authSlice"; // example slice


export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add more reducers here
  },
 middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(loggerMiddleware)

});

// Infer the `RootState` and `AppDispatch` types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
