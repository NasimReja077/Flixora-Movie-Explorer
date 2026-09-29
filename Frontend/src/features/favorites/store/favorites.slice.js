import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addFavorite as addFavoriteApi,
  checkFavorite as checkFavoriteApi,
  getFavorites,
  removeFavorite as removeFavoriteApi,
} from "../service/favorites.api.js";

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      return await getFavorites();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch favorites"
      );
    }
  }
);

export const addFavorite = createAsyncThunk(
  "favorites/addFavorite",
  async ({ movieId, movieType = "movie", movieData = {} }, { rejectWithValue }) => {
    try {
      return await addFavoriteApi(movieId, movieType, movieData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add favorite"
      );
    }
  }
);

export const removeFavorite = createAsyncThunk(
  "favorites/removeFavorite",
  async (movieId, { rejectWithValue }) => {
    try {
      await removeFavoriteApi(movieId);
      return movieId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove favorite"
      );
    }
  }
);

export const checkFavorite = createAsyncThunk(
  "favorites/checkFavorite",
  async (movieId, { rejectWithValue }) => {
    try {
      const result = await checkFavoriteApi(movieId);
      return { movieId, isFavorite: result.isFavorite };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to check favorite status"
      );
    }
  }
);

const initialState = {
  items: [],
  isFavoriteById: {},
  loading: false,
  error: null,
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavoritesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.favorites;
        state.isFavoriteById = Object.fromEntries(
          state.items.map(({ movieId }) => [movieId, true])
        );
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.loading = false;
        const favorite = action.payload.favorite;
        state.items = [
          favorite,
          ...state.items.filter((item) => item.movieId !== favorite.movieId),
        ];
        state.isFavoriteById[favorite.movieId] = true;
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => item.movieId !== action.payload
        );
        state.isFavoriteById[action.payload] = false;
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkFavorite.fulfilled, (state, action) => {
        const { movieId, isFavorite } = action.payload;
        state.isFavoriteById[movieId] = isFavorite;
      })
      .addCase(checkFavorite.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearFavoritesError } = favoritesSlice.actions;
export default favoritesSlice.reducer;
