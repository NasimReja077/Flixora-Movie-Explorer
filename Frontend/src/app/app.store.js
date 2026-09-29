import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/state/auth.slice.js";
import moviesReducer from "../features/movies/store/movies.slice.js";
import favoritesReducer from "../features/favorites/store/favorites.slice.js";
import historyReducer from "../features/history/store/history.slice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: moviesReducer,
    favorites: favoritesReducer,
    history: historyReducer,
  },
});

export default store;