import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addHistory as addHistoryApi,
  clearHistory as clearHistoryApi,
  getHistory,
} from "../service/history.api.js";

export const fetchHistory = createAsyncThunk(
  "history/fetchHistory",
  async (limit, { rejectWithValue }) => {
    try {
      return await getHistory(limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch watch history"
      );
    }
  }
);

export const addHistory = createAsyncThunk(
  "history/addHistory",
  async ({ movieId, movieType = "movie", movieData = {} }, { rejectWithValue }) => {
    try {
      return await addHistoryApi(movieId, movieType, movieData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to watch history"
      );
    }
  }
);

export const clearHistory = createAsyncThunk(
  "history/clearHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await clearHistoryApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear watch history"
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    clearHistoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.history;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHistory.fulfilled, (state, action) => {
        state.loading = false;
        const history = action.payload.history;
        state.items = [
          history,
          ...state.items.filter(
            (item) =>
              item.movieId !== history.movieId ||
              item.movieType !== history.movieType
          ),
        ];
      })
      .addCase(addHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearHistory.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
      })
      .addCase(clearHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHistoryError } = historySlice.actions;
export default historySlice.reducer;
