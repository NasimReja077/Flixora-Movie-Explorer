import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getTrendingMedia,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getMovieDetails,
} from "../service/movie.api.js";

export const fetchTrendingMovies = createAsyncThunk(
  "movies/fetchTrendingMovies",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getTrendingMedia("movie", "week");
      return data?.results || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trending movies"
      );
    }
  }
);

export const fetchPopularMovies = createAsyncThunk(
  "movies/fetchPopularMovies",
  async (page = 1, { rejectWithValue }) => {
    try {
      const { data } = await getPopularMovies(page);
      return data?.results || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch popular movies"
      );
    }
  }
);

export const fetchTopRatedMovies = createAsyncThunk(
  "movies/fetchTopRatedMovies",
  async (page = 1, { rejectWithValue }) => {
    try {
      const { data } = await getTopRatedMovies(page);
      return data?.results || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch top-rated movies"
      );
    }
  }
);

export const fetchNowPlayingMovies = createAsyncThunk(
  "movies/fetchNowPlayingMovies",
  async (page = 1, { rejectWithValue }) => {
    try {
      const { data } = await getNowPlayingMovies(page, "US");
      return data?.results || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch now playing movies"
      );
    }
  }
);

export const fetchMovieById = createAsyncThunk(
  "movies/fetchMovieById",
  async (movieId, { rejectWithValue }) => {
    try {
      const { data } = await getMovieDetails(movieId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch movie details"
      );
    }
  }
);

const initialState = {
  trending: [],
  popular: [],
  topRated: [],
  nowPlaying: [],
  selectedMovie: null,
  loading: false,
  error: null,
};

const moviesSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    clearMovieError: (state) => {
      state.error = null;
    },
    clearSelectedMovie: (state) => {
      state.selectedMovie = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrendingMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendingMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.trending = action.payload;
      })
      .addCase(fetchTrendingMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchPopularMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.popular = action.payload;
      })
      .addCase(fetchPopularMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchTopRatedMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopRatedMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.topRated = action.payload;
      })
      .addCase(fetchTopRatedMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchNowPlayingMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNowPlayingMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.nowPlaying = action.payload;
      })
      .addCase(fetchNowPlayingMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchMovieById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMovie = action.payload;
      })
      .addCase(fetchMovieById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMovieError, clearSelectedMovie } = moviesSlice.actions;
export default moviesSlice.reducer;
