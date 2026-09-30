import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createReview as createReviewApi,
  deleteReview as deleteReviewApi,
  getMyReviews,
  getReviews,
  likeReview as likeReviewApi,
  updateReview as updateReviewApi,
} from "../service/review.api.js";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const getReviewId = (review) => review._id || review.id;

const upsertReview = (reviews, review) => {
  const reviewId = getReviewId(review);
  const index = reviews.findIndex((item) => getReviewId(item) === reviewId);

  if (index === -1) {
    reviews.unshift(review);
  } else {
    reviews[index] = { ...reviews[index], ...review };
  }
};

export const fetchReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async ({ movieId, page = 1 }, { rejectWithValue }) => {
    try {
      return await getReviews(movieId, page);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch reviews")
      );
    }
  }
);

export const fetchMyReviews = createAsyncThunk(
  "reviews/fetchMyReviews",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyReviews();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch your reviews")
      );
    }
  }
);

export const createReview = createAsyncThunk(
  "reviews/createReview",
  async ({ movieId, data }, { rejectWithValue }) => {
    try {
      const response = await createReviewApi(movieId, data);
      return response.review;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create review")
      );
    }
  }
);

export const updateReview = createAsyncThunk(
  "reviews/updateReview",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateReviewApi(id, data);
      return response.review;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update review")
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (id, { rejectWithValue }) => {
    try {
      await deleteReviewApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete review")
      );
    }
  }
);

export const likeReview = createAsyncThunk(
  "reviews/likeReview",
  async (id, { rejectWithValue }) => {
    try {
      const response = await likeReviewApi(id);
      return { id, likesCount: response.likesCount };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to like review"));
    }
  }
);

const initialState = {
  items: [],
  myReviews: [],
  pagination: null,
  totalAvgRating: 0,
  loading: false,
  error: null,
};

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.reviews;
        state.pagination = action.payload.pagination;
        state.totalAvgRating = action.payload.totalAvgRating;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.myReviews = action.payload.reviews;
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        upsertReview(state.items, action.payload);
        upsertReview(state.myReviews, action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        upsertReview(state.items, action.payload);
        upsertReview(state.myReviews, action.payload);
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (review) => getReviewId(review) !== action.payload
        );
        state.myReviews = state.myReviews.filter(
          (review) => getReviewId(review) !== action.payload
        );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(likeReview.pending, (state) => {
        state.error = null;
      })
      .addCase(likeReview.fulfilled, (state, action) => {
        const { id, likesCount } = action.payload;
        [...state.items, ...state.myReviews].forEach((review) => {
          if (getReviewId(review) === id) {
            review.likesCount = likesCount;
          }
        });
      })
      .addCase(likeReview.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearReviewsError } = reviewsSlice.actions;
export default reviewsSlice.reducer;
