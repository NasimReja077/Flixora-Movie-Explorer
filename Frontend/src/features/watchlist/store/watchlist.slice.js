import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addToWatchlist as addToWatchlistApi,
  getWatchlist,
  removeFromWatchlist as removeFromWatchlistApi,
} from "../service/watchlist.api.js";

export const fetchWatchlist = createAsyncThunk(
  "watchlist/fetchWatchlist",
  async (_, { rejectWithValue }) => {
    try {
      return await getWatchlist();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch watchlist"
      );
    }
  }
);

export const addToWatchlist = createAsyncThunk(
  "watchlist/addToWatchlist",
  async (
    { movieId, movieType = "movie", movieData = {} },
    { rejectWithValue }
  ) => {
    try {
      return await addToWatchlistApi(movieId, movieType, movieData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to watchlist"
      );
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  "watchlist/removeFromWatchlist",
  async (movieId, { rejectWithValue }) => {
    try {
      await removeFromWatchlistApi(movieId);
      return movieId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from watchlist"
      );
    }
  }
);

const initialState = {
  items: [],
  pagination: null,
  isInWatchlistById: {},
  loading: false,
  error: null,
};

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    clearWatchlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
        state.isInWatchlistById = Object.fromEntries(
          state.items.map(({ movieId }) => [movieId, true])
        );
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        const watchlistItem = action.payload.item;
        state.items = [
          watchlistItem,
          ...state.items.filter(
            (item) => item.movieId !== watchlistItem.movieId
          ),
        ];
        state.isInWatchlistById[watchlistItem.movieId] = true;
      })
      .addCase(addToWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => String(item.movieId) !== String(action.payload)
        );
        state.isInWatchlistById[action.payload] = false;
      })
      .addCase(removeFromWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWatchlistError } = watchlistSlice.actions;
export default watchlistSlice.reducer;
