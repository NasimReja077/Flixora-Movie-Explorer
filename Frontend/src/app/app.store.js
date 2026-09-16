import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/state/auth.slice.js";
import moviesReducer from "../features/movies/store/movies.slice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: moviesReducer,
  },
});

export default store;