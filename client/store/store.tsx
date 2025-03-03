import { configureStore } from "@reduxjs/toolkit";
import matchesReducer from "./matchesSlice";

// Configure Store with a Root Reducer
export const store = configureStore({
  reducer: {
    matches: matchesReducer,
  },
});

// RootState Type for TypeScript Support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
