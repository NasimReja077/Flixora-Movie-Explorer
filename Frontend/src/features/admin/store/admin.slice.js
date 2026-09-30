import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addAdminMovie as addAdminMovieApi,
  deleteAdminMovie as deleteAdminMovieApi,
  deleteAdminUser as deleteAdminUserApi,
  getAdminMovies,
  getAdminStats,
  getAdminUsers,
  toggleUserBan as toggleUserBanApi,
  toggleUserRole as toggleUserRoleApi,
  updateAdminMovie as updateAdminMovieApi,
} from "../service/admin.api.js";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchAdminMovies = createAsyncThunk(
  "admin/fetchMovies",
  async (params, { rejectWithValue }) => {
    try {
      return await getAdminMovies(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch movies"));
    }
  }
);

export const addAdminMovie = createAsyncThunk(
  "admin/addMovie",
  async (movieData, { rejectWithValue }) => {
    try {
      return await addAdminMovieApi(movieData);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to add movie"));
    }
  }
);

export const updateAdminMovie = createAsyncThunk(
  "admin/updateMovie",
  async ({ movieId, movieData }, { rejectWithValue }) => {
    try {
      return await updateAdminMovieApi(movieId, movieData);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update movie"));
    }
  }
);

export const deleteAdminMovie = createAsyncThunk(
  "admin/deleteMovie",
  async (movieId, { rejectWithValue }) => {
    try {
      await deleteAdminMovieApi(movieId);
      return movieId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete movie"));
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (params, { rejectWithValue }) => {
    try {
      return await getAdminUsers(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch users"));
    }
  }
);

export const toggleUserBan = createAsyncThunk(
  "admin/toggleUserBan",
  async (userId, { rejectWithValue }) => {
    try {
      return await toggleUserBanApi(userId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update user"));
    }
  }
);

export const deleteAdminUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await deleteAdminUserApi(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete user"));
    }
  }
);

export const toggleUserRole = createAsyncThunk(
  "admin/toggleUserRole",
  async (userId, { rejectWithValue }) => {
    try {
      return { userId, ...(await toggleUserRoleApi(userId)) };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update user role"));
    }
  }
);

export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      return await getAdminStats();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch dashboard stats"));
    }
  }
);

const initialState = {
  movies: [],
  users: [],
  moviePagination: null,
  userPagination: null,
  stats: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.movies;
        state.moviePagination = action.payload.pagination;
      })
      .addCase(fetchAdminMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAdminMovie.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAdminMovie.fulfilled, (state, action) => {
        state.loading = false;
        state.movies.unshift(action.payload.movie);
      })
      .addCase(addAdminMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminMovie.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminMovie.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMovie = action.payload.movie;
        const index = state.movies.findIndex(
          (movie) => movie._id === updatedMovie._id
        );
        if (index !== -1) state.movies[index] = updatedMovie;
      })
      .addCase(updateAdminMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAdminMovie.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminMovie.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = state.movies.filter(
          (movie) => movie._id !== action.payload
        );
      })
      .addCase(deleteAdminMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.userPagination = action.payload.pagination;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleUserBan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserBan.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(
          (user) => user._id === updatedUser._id
        );
        if (index !== -1) state.users[index] = updatedUser;
      })
      .addCase(toggleUserBan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAdminUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          (user) => user._id !== action.payload
        );
      })
      .addCase(deleteAdminUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, role } = action.payload;
        const user = state.users.find((item) => item._id === userId);
        if (user) user.role = role;
      })
      .addCase(toggleUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
